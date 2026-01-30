  import { NextRequest, NextResponse } from 'next/server';
  import { connectDB } from '@/lib/db/mongodb';
  import User from '@/models/User';
  import { verifyToken } from '@/lib/auth/jwt';

  export async function PUT(request: NextRequest) {
    try {
      await connectDB();
      
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

      const body = await request.json();
      const { userId, updates } = body;

      // Check permissions
      const requestingUser = await User.findById(decoded.userId);
      if (!requestingUser) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Determine target user
      let targetUserId = decoded.userId;
      let canUpdate = true;
      
      if (userId && userId !== decoded.userId) {
        // Admin/HR can update other users' profiles
        if (['admin', 'hr'].includes(requestingUser.role)) {
          targetUserId = userId;
        } else {
          return NextResponse.json(
            { success: false, message: 'You can only update your own profile' },
            { status: 403 }
          );
        }
      }

      // Find target user
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json(
          { success: false, message: 'Target user not found' },
          { status: 404 }
        );
      }

      // Define allowed fields based on role
      const allowedFields = ['mobile', 'alternateMobile', 'address'];
      
      if (requestingUser.role === 'admin') {
        allowedFields.push(...['salary', 'incentive', 'taxDeduction', 'taxAmount', 'status']);
      }
      
      if (requestingUser.role === 'hr' && targetUser.role === 'employee') {
        allowedFields.push(...['department', 'jobTitle', 'responsibility', 'salary', 'incentive']);
      }

      // Filter updates to only allowed fields
      const filteredUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Update user
      Object.assign(targetUser, filteredUpdates);
      await targetUser.save();

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: targetUser._id,
          fullName: targetUser.fullName,
          ...filteredUpdates,
        },
      });

    } catch (error: any) {
      console.error('Update profile error:', error);
      return NextResponse.json(
        { success: false, message: 'Server error', error: error.message },
        { status: 500 }
      );
    }
  }