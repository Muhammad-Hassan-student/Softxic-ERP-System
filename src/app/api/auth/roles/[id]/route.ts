import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Role from '@/models/Role';
import { requirePermission } from '@/lib/auth/permissions';

/* =========================
   GET single role
========================= */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await requirePermission({
      module: 'role_management',
      action: 'view',
    })(request);

    if (permissionCheck.status !== 200) {
      return permissionCheck;
    }

    await connectDB();

    const { id } = await context.params;

    const role = await Role.findById(id).select('-__v');

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: role,
    });

  } catch (error: any) {
    console.error('Get role error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   PUT update role
========================= */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await requirePermission({
      module: 'role_management',
      action: 'edit',
    })(request);

    if (permissionCheck.status !== 200) {
      return permissionCheck;
    }

    await connectDB();

    const { id } = await context.params;
    const body = await request.json();
    const { description, permissions, isActive } = body;

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.isDefault && permissions) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot modify permissions of default roles',
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });

  } catch (error: any) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE role (soft delete)
========================= */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const permissionCheck = await requirePermission({
      module: 'role_management',
      action: 'delete',
    })(request);

    if (permissionCheck.status !== 200) {
      return permissionCheck;
    }

    await connectDB();

    const { id } = await context.params;

    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    if (role.isDefault) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete default roles' },
        { status: 400 }
      );
    }

    role.isActive = false;
    await role.save();

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
