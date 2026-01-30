import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: {
    id: string;
  }
}

// GET user profile
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Find requesting user
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find target user
    const targetUser = await User.findById(params.id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canView = 
      requestingUser.role === 'admin' ||
      (requestingUser.role === 'hr' && targetUser.role === 'employee') ||
      requestingUser._id.toString() === params.id;

    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Prepare response based on permissions
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
        requestingUser._id.toString() === params.id) {
      userData.email = targetUser.email;
      userData.mobile = targetUser.mobile;
      userData.alternateMobile = targetUser.alternateMobile;
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    
    // Find requesting user
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find target user
    const targetUser = await User.findById(params.id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canUpdate = 
      requestingUser.role === 'admin' ||
      (requestingUser.role === 'hr' && targetUser.role === 'employee') ||
      requestingUser._id.toString() === params.id;

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Define allowed fields based on role
    let allowedFields: string[] = [];
    
    if (requestingUser._id.toString() === params.id) {
      // Users can update their own basic info
      allowedFields = ['fullName', 'mobile', 'alternateMobile', 'address'];
    }
    
    if (requestingUser.role === 'hr' && targetUser.role === 'employee') {
      allowedFields = [
        ...allowedFields,
        'jobTitle', 'department', 'responsibility', 'timing',
        'monthOff', 'salary', 'incentive'
      ];
    }
    
    if (requestingUser.role === 'admin') {
      if (targetUser.role === 'employee') {
        allowedFields = [
          'fullName', 'email', 'mobile', 'alternateMobile', 'address',
          'jobTitle', 'department', 'responsibility', 'timing',
          'monthOff', 'salary', 'incentive', 'taxDeduction', 'taxAmount'
        ];
      } else {
        allowedFields = ['fullName', 'email', 'mobile', 'alternateMobile', 'address'];
      }
    }

    // Filter updates to only allowed fields
    const filteredUpdates: any = {};
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = body[key];
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
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}