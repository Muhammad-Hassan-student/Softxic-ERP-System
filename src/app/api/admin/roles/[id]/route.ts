import { connectDB } from "@/lib/db/mongodb";
import { withPermission } from "@/lib/middleware/permission-guard";
import Permission from "@/models/Permission";
import Role from "@/models/Role";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "node:http2";
import { success } from "zod";


interface Params {
  params: { id: string };
}

// GET single role by ID
async function getHandler(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const role = await Role.findById(params.id).lean();
    
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Get permission details
    const allPermissions = [
      ...(role.permissionCodes || []),
      ...(role.analyticsPermissions || []),
    ];
    
    const permissionDetails = allPermissions.length > 0 
      ? await Permission.find({
          code: { $in: allPermissions },
          isActive: true,
        }).lean()
      : [];
    
    // Get user count
    const userCount = await User.countDocuments({ 
      role: role.name,
      isActive: true 
    });
    
    // Get users with this role
    const users = await User.find({ 
      role: role.name,
      isActive: true 
    })
    .select('fullName email department jobTitle status lastLogin')
    .limit(10)
    .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissionDetails,
        userCount,
        users,
        stats: {
          totalPermissions: allPermissions.length,
          crudPermissions: role.permissionCodes?.length || 0,
          analyticsPermissions: role.analyticsPermissions?.length || 0,
        },
      },
    });

  } catch (error: any) {
    console.error('Get role error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PUT update role
async function putHandler(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const { name, description, permissionCodes, analyticsPermissions, dataAccessLevel, isActive } = body;
    
    await connectDB();
    
    const role = await Role.findById(params.id);
    
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Don't allow updating default roles name
    if (role.isDefault && name && name !== role.name) {
      return NextResponse.json(
        { success: false, message: 'Cannot rename default roles' },
        { status: 400 }
      );
    }
    
    // Check if new name already exists (if name is being changed)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: params.id }
      });
      
      if (existingRole) {
        return NextResponse.json(
          { success: false, message: 'Role with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    // Validate permissions if provided
    if (permissionCodes || analyticsPermissions) {
      const allPermissions = [
        ...(permissionCodes || role.permissionCodes),
        ...(analyticsPermissions || role.analyticsPermissions),
      ];
      
      const validPermissions = await Permission.countDocuments({
        code: { $in: allPermissions },
        isActive: true,
      });
      
      if (validPermissions !== allPermissions.length) {
        return NextResponse.json(
          { success: false, message: 'One or more invalid permissions' },
          { status: 400 }
        );
      }
    }
    
    // Update role
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissionCodes !== undefined) updateData.permissionCodes = permissionCodes;
    if (analyticsPermissions !== undefined) updateData.analyticsPermissions = analyticsPermissions;
    if (dataAccessLevel !== undefined) updateData.dataAccessLevel = dataAccessLevel;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedRole = await Role.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    
    // Get updated permission details
    const allPermissions = [
      ...(updatedRole.permissionCodes || []),
      ...(updatedRole.analyticsPermissions || []),
    ];
    
    const permissionDetails = allPermissions.length > 0 
      ? await Permission.find({
          code: { $in: allPermissions },
          isActive: true,
        }).lean()
      : [];
    
    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        ...updatedRole,
        permissionDetails,
      },
    });

  } catch (error: any) {
    console.error('Update role error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Role name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE role
async function deleteHandler(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const role = await Role.findById(params.id);
    
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Don't allow deleting default roles
    if (role.isDefault) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete default roles' },
        { status: 400 }
      );
    }
    
    // Check if any users are assigned to this role
    const userCount = await User.countDocuments({ 
      role: role.name,
      isActive: true 
    });
    
    if (userCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`,
          userCount 
        },
        { status: 400 }
      );
    }
    
    // Soft delete - set isActive to false
    await Role.findByIdAndUpdate(params.id, { 
      $set: { isActive: false } 
    });
    
    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete role' },
      { status: 500 }
    );
  }
}

// Export with permission middleware
export const GET = withPermission(getHandler, {
  requiredPermission: 'user.role.assign',
  module: 'role',
});

export const PUT = withPermission(putHandler, {
  requiredPermission: 'user.role.assign',
  module: 'role',
  logAccess: true,
});

export const DELETE = withPermission(deleteHandler, {
  requiredPermission: 'user.role.assign',
  module: 'role',
  logAccess: true,
});