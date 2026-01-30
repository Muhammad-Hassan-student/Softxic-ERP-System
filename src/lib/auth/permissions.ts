import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { connectDB } from '@/lib/db/mongodb';
import Role from '@/models/Role';

export interface PermissionCheck {
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';
}

export async function checkPermission(
  request: NextRequest,
  permission: PermissionCheck
): Promise<boolean> {
  try {
    // Verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return false;
    }

    // Get user role
    const role = await Role.findOne({ 
      name: decoded.role, 
      isActive: true 
    });

    if (!role) {
      return false;
    }

    // Check permission for the module
    const modulePermission = role.permissions.find(
      (p: any) => p.module === permission.module
    );

    if (!modulePermission) {
      return false;
    }

    // Check specific action
    return modulePermission[permission.action] === true;
    
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export function requirePermission(permission: PermissionCheck) {
  return async (request: NextRequest) => {
    const hasPermission = await checkPermission(request, permission);
    
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}

// Helper function to get all permissions for a role
export async function getRolePermissions(roleName: string) {
  try {
    await connectDB();
    const role = await Role.findOne({ name: roleName, isActive: true });
    return role?.permissions || [];
  } catch (error) {
    console.error('Get role permissions error:', error);
    return [];
  }
}