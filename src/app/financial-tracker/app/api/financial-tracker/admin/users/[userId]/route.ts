import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/models/User';
import UserPermissionModel from '@/modules/financial-tracker/models/user-permission.model';
import ActivityService from '@/modules/financial-tracker/services/activity-service';
import bcrypt from 'bcryptjs';

// GET user details
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

    const user = await User.findById(params.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE user
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
    const user = await User.findById(params.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedUpdates = [
      'fullName', 'email', 'role', 'department', 'designation',
      'mobile', 'employeeId', 'joiningDate', 'status', 'isActive'
    ];

    const changes = [];
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined && user[field] !== body[field]) {
        changes.push({
          field,
          oldValue: user[field],
          newValue: body[field]
        });
        user[field] = body[field];
      }
    });

    // Update password if provided
    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
      changes.push({ field: 'password', oldValue: '***', newValue: '***' });
    }

    await user.save();

    // Log activity
    if (changes.length > 0) {
      await ActivityService.log({
        userId: decoded.userId,
        module: 'admin',
        entity: 'users',
        recordId: params.userId,
        action: 'UPDATE',
        changes
      });
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: user.toObject({ virtuals: true, versionKey: false })
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
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

    // Don't allow deleting admin users
    if (user.role === 'admin' && user._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Soft delete - deactivate instead
    user.isActive = false;
    user.status = 'inactive';
    await user.save();

    // Also delete permissions
    await UserPermissionModel.deleteOne({ userId: params.userId });

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'users',
      recordId: params.userId,
      action: 'DELETE',
      changes: [{ field: 'status', oldValue: 'active', newValue: 'deleted' }]
    });

    return NextResponse.json({ 
      message: 'User deactivated successfully' 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}