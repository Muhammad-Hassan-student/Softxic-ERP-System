import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import UserPermissionModel from '@/modules/financial-tracker/models/user-permission.model';
import ActivityService from '@/modules/financial-tracker/services/activity-service'; // Fixed import

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    let permissions = await UserPermissionModel.findOne({ 
      userId: params.userId 
    }).lean();

    if (!permissions) {
      // Create default permissions if none exist
      permissions = await UserPermissionModel.create({
        userId: params.userId,
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
    return NextResponse.json(
      { error: 'Failed to fetch permissions', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const body = await request.json();

    // Get old permissions for change tracking
    const oldPermissions = await UserPermissionModel.findOne({ userId: params.userId });

    const permissions = await UserPermissionModel.findOneAndUpdate(
      { userId: params.userId },
      {
        $set: {
          permissions: body.permissions,
          updatedBy: decoded.userId,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    // Log activity - Fixed to include both oldValue and newValue
    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin', // Now allowed because we added 'admin' to ActivityLogData type
      entity: 'users',
      recordId: params.userId,
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
    return NextResponse.json(
      { error: 'Failed to update permissions', details: error.message },
      { status: 500 }
    );
  }
}