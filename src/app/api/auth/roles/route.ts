import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Role from '@/models/Role';
import { requirePermission } from '@/lib/auth/permissions';

// GET all roles (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    const permissionCheck = await requirePermission({
      module: 'role_management',
      action: 'view'
    })(request);
    
    if (permissionCheck.status !== 200) {
      return permissionCheck;
    }

    await connectDB();
    
    const roles = await Role.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length,
    });

  } catch (error: any) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new role (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check create permission
    const permissionCheck = await requirePermission({
      module: 'role_management',
      action: 'create'
    })(request);
    
    if (permissionCheck.status !== 200) {
      return permissionCheck;
    }

    await connectDB();
    
    const body = await request.json();
    const { name, description, permissions, isDefault } = body;

    // Validate required fields
    if (!name || !permissions) {
      return NextResponse.json(
        { success: false, message: 'Name and permissions are required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: 'Role already exists' },
        { status: 400 }
      );
    }

    // Validate permissions structure
    const validModules = [
      'dashboard', 'employee_management', 'payments', 'payroll', 'reports',
      'attendance', 'leaves', 'tax', 'inventory', 'vendors', 'invoices',
      'complaints', 'credit_debit', 'role_management', 'user_management', 'settings'
    ];

    const invalidPermissions = permissions.filter((p: any) => 
      !validModules.includes(p.module)
    );

    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid module in permissions' },
        { status: 400 }
      );
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      permissions,
      isDefault: isDefault || false,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      data: role,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create role error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Role name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}