import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { identifier, password, loginType } = body;

    // Determine login type
    let query = {};
    
    if (loginType === 'employee') {
      // Employee login: rollNo + fullName + cnic + password
      const { rollNo, fullName, cnic } = body;
      
      if (!rollNo || !fullName || !cnic || !password) {
        return NextResponse.json(
          { success: false, message: 'Roll number, full name, CNIC, and password are required' },
          { status: 400 }
        );
      }
      
      query = { rollNo, fullName, cnic, role: 'employee' };
    } else if (loginType === 'hr') {
      // HR login: email + password
      const { email } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }
      
      query = { email, role: 'hr' };
    } else if (loginType === 'admin') {
      // Admin login: email + password
      const { email } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }
      
      query = { email, role: 'admin' };
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid login type' },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive || user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Prepare response based on role
    let userResponse: any = {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      lastLogin: user.lastLogin,
    };

    // Add role-specific fields
    if (user.role === 'employee') {
      userResponse = {
        ...userResponse,
        rollNo: user.rollNo,
        cnic: user.cnic,
        jobTitle: user.jobTitle,
        salary: user.salary,
        status: user.status,
      };
    } else if (user.role === 'hr' || user.role === 'admin') {
      userResponse = {
        ...userResponse,
        email: user.email,
        mobile: user.mobile,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token,
    });

  } catch (error: any) {
    console.error('Login error:', error);
  return NextResponse.json(
    {
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
  }
}