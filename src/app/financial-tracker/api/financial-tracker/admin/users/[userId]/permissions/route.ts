import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import UserPermissionModel from '@/app/financial-tracker/models/user-permission.model'; // ✅ Fixed import
import ActivityService from '@/app/financial-tracker/services/activity-service'; // ✅ Fixed import

// ✅ GET /api/financial-tracker/permissions/[userId] - Specific user ki permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;

    let permissions = await UserPermissionModel.findOne({ userId }).lean();

    if (!permissions) {
      permissions = await UserPermissionModel.create({
        userId,
        permissions: {
          re: {},
          expense: {}
        },
        createdBy: decoded.userId,
        updatedBy: decoded.userId
      });
    }

    return NextResponse.json({ permissions });

  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions', details: error.message },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/financial-tracker/permissions/[userId] - Specific user ki permissions update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();

    const oldPermissions = await UserPermissionModel.findOne({ userId });

    const permissions = await UserPermissionModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          permissions: body.permissions,
          updatedBy: decoded.userId,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'users',
      recordId: userId,
      action: 'UPDATE',
      changes: [{ 
        field: 'permissions', 
        oldValue: oldPermissions?.permissions || {},
        newValue: body.permissions 
      }]
    });

    return NextResponse.json({ 
      message: 'Permissions updated successfully',
      permissions 
    });

  } catch (error: any) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions', details: error.message },
      { status: 500 }
    );
  }
}