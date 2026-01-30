import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Role from '@/models/Role';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get role permissions
    const role = await Role.findOne({ 
      name: decoded.role, 
      isActive: true 
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    // Format permissions for frontend
    const formattedPermissions: Record<string, any> = {};
    
    role.permissions.forEach((permission: any) => {
      formattedPermissions[permission.module] = {
        view: permission.view,
        create: permission.create,
        edit: permission.edit,
        delete: permission.delete,
        export: permission.export || false,
        approve: permission.approve || false,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        role: role.name,
        permissions: formattedPermissions,
      },
    });

  } catch (error: any) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}