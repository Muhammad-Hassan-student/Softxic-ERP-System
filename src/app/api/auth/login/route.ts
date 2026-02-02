import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { identifier, password, loginType } = body;

    let query = {};
    let userRole = '';
    
    if (loginType === 'employee') {
      const { rollNo, fullName, cnic } = body;
      
      if (!rollNo || !fullName || !cnic || !password) {
        return NextResponse.json(
          { success: false, message: 'All fields are required' },
          { status: 400 }
        );
      }
      
      query = { rollNo, fullName, cnic };
      userRole = 'employee';
    } else if (loginType === 'hr') {
      const { email } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password required' },
          { status: 400 }
        );
      }
      
      query = { email };
      userRole = 'hr';
    } else if (loginType === 'admin') {
      const { email } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password required' },
          { status: 400 }
        );
      }
      
      query = { email };
      userRole = 'admin';
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid login type' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check role matches
    if (user.role !== userRole) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials for this login type' },
        { status: 401 }
      );
    }

    // Check active status
    if (!user.isActive || user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account deactivated' },
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

    // Prepare response data
    const userResponse = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      email: user.email,
      profilePhoto: user.profilePhoto,
      lastLogin: user.lastLogin,
      rollNo: user.rollNo,
      cnic: user.cnic,
      jobTitle: user.jobTitle,
      mobile: user.mobile,
      status: user.status,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userResponse,
    });

    // Set cookies - CRITICAL FIX
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set({
      name: 'userRole',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set({
      name: 'userId',
      value: user._id.toString(),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('✅ Login successful, cookies set for:', user.fullName);
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}