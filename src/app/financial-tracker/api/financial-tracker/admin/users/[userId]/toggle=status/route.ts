import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/models/User';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function PATCH(
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

    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldStatus = user.isActive;
    user.isActive = !user.isActive;
    user.status = user.isActive ? 'active' : 'inactive';
    await user.save();

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'users',
      recordId: params.userId,
      action: 'UPDATE',
      changes: [{
        field: 'isActive',
        oldValue: oldStatus,
        newValue: user.isActive
      }]
    });

    return NextResponse.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to toggle user status', details: error.message },
      { status: 500 }
    );
  }
}