import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import UserPermissionModel from '@/app/financial-tracker/models/user-permission.model';
import PermissionService from '@/app/financial-tracker/services/permission-service';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const entity = searchParams.get('entity');

    if (!module || !entity) {
      return NextResponse.json(
        { error: 'Module and entity are required' },
        { status: 400 }
      );
    }

    // Get permissions using service
    const permissions = await PermissionService.getUserPermissions(decoded.userId);
    
    const entityPerms = permissions[module]?.[entity] || {
      access: false,
      create: false,
      edit: false,
      delete: false,
      scope: 'own',
      columns: {}
    };

    return NextResponse.json({ permissions: entityPerms });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch permissions', details: error.message },
      { status: 500 }
    );
  }
}