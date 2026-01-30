import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';

interface RouteParams {
  params: {
    id: string;
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const userId = params.id;
    
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

    // Check permissions
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only view their own profile unless admin/hr
    let targetUserId = decoded.userId;
    if (userId && ['admin', 'hr'].includes(requestingUser.role)) {
      targetUserId = userId;
    } else if (userId && userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only view your own profile' },
        { status: 403 }
      );
    }

    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare response based on role and permissions
    let userData: any = {
      id: targetUser._id,
      fullName: targetUser.fullName,
      profilePhoto: targetUser.profilePhoto,
      role: targetUser.role,
      department: targetUser.department,
      status: targetUser.status,
      createdAt: targetUser.createdAt,
    };

    // Add role-specific fields
    if (targetUser.role === 'employee') {
      userData = {
        ...userData,
        rollNo: targetUser.rollNo,
        cnic: targetUser.cnic,
        fatherName: targetUser.fatherName,
        dateOfBirth: targetUser.dateOfBirth,
        gender: targetUser.gender,
        maritalStatus: targetUser.maritalStatus,
        address: targetUser.address,
        qualification: targetUser.qualification,
        reference: targetUser.reference,
        jobTitle: targetUser.jobTitle,
        responsibility: targetUser.responsibility,
        timing: targetUser.timing,
        monthOff: targetUser.monthOff,
        dateOfJoining: targetUser.dateOfJoining,
        salary: targetUser.salary,
        incentive: targetUser.incentive,
        taxDeduction: targetUser.taxDeduction,
        taxAmount: targetUser.taxAmount,
      };
    }

    // Add contact info if allowed
    if (requestingUser.role === 'admin' || requestingUser.role === 'hr' || 
        requestingUser._id.toString() === targetUserId) {
      userData.mobile = targetUser.mobile;
      userData.alternateMobile = targetUser.alternateMobile;
      userData.email = targetUser.email;
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}