// src/app/api/financial-tracker/admin/users/bulk-permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import UserPermissionModel from '@/app/financial-tracker/models/user-permission.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function POST(request: NextRequest) {
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
    const { userIds, permissions, operation } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    for (const userId of userIds) {
      try {
        if (operation === 'replace') {
          // Replace all permissions
          await UserPermissionModel.findOneAndUpdate(
            { userId },
            {
              $set: {
                permissions,
                updatedBy: decoded.userId,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
        } else if (operation === 'merge') {
          // Merge with existing permissions
          await UserPermissionModel.findOneAndUpdate(
            { userId },
            {
              $set: {
                updatedBy: decoded.userId,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );

          // Then merge the permissions
          const userPerms = await UserPermissionModel.findOne({ userId });
          if (userPerms) {
            userPerms.permissions = {
              ...userPerms.permissions,
              ...permissions
            };
            await userPerms.save();
          }
        }

        results.success.push(userId);
      } catch (error) {
        results.failed.push(userId);
      }
    }

    // Log bulk activity
    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'users',
      action: 'UPDATE',
      changes: [{
        field: 'bulk_permissions',
        oldValue: null,
        newValue: {
          userIds,
          operation,
          successCount: results.success.length,
          failCount: results.failed.length
        }
      }]
    });

    return NextResponse.json({
      message: `Bulk permissions ${operation} completed`,
      results
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}