import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import PermissionService from '../../services/permission-service';

export interface AuthUser {
  userId: string;
  role: string;
}

export async function withPermission(
  req: NextRequest,
  module: string,
  entity: string,
  action: 'access' | 'create' | 'edit' | 'delete',
  recordCreatedBy?: string
) {
  try {
    // Get token from cookie or header
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      };
    }

    // Attach user to request
    (req as any).user = decoded;

    // Admin bypass
    if (decoded.role === 'admin') {
      return { authorized: true, user: decoded };
    }

    // Check permission
    let hasPermission = false;

    switch (action) {
      case 'access':
        hasPermission = await PermissionService.hasAccess(decoded.userId, module, entity);
        break;
      case 'create':
        hasPermission = await PermissionService.canCreate(decoded.userId, module, entity);
        break;
      case 'edit':
        if (!recordCreatedBy) {
          return {
            authorized: false,
            response: NextResponse.json(
              { error: 'Record creator required' },
              { status: 400 }
            )
          };
        }
        hasPermission = await PermissionService.canEdit(decoded.userId, module, entity, recordCreatedBy);
        break;
      case 'delete':
        if (!recordCreatedBy) {
          return {
            authorized: false,
            response: NextResponse.json(
              { error: 'Record creator required' },
              { status: 400 }
            )
          };
        }
        hasPermission = await PermissionService.canDelete(decoded.userId, module, entity, recordCreatedBy);
        break;
    }

    if (!hasPermission) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      };
    }

    return { authorized: true, user: decoded };

  } catch (error) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Permission check failed' },
        { status: 500 }
      )
    };
  }
}

// Higher-order function for route handlers
export function requirePermission(
  module: string,
  entity: string,
  action: 'access' | 'create' | 'edit' | 'delete',
  getRecordCreatedBy?: (req: NextRequest) => Promise<string | undefined>
) {
  return function (handler: Function) {
    return async function (req: NextRequest, ...args: any[]) {
      let recordCreatedBy: string | undefined;
      
      if (getRecordCreatedBy && (action === 'edit' || action === 'delete')) {
        recordCreatedBy = await getRecordCreatedBy(req);
      }

      const result = await withPermission(req, module, entity, action, recordCreatedBy);
      
      if (!result.authorized) {
        return result.response;
      }

      return handler(req, ...args);
    };
  };
}