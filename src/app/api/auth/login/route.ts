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
      const { rollNo, fullName, cnic } = body;
      
      if (!rollNo || !fullName || !cnic || !password) {
        return NextResponse.json(
          { success: false, message: 'Roll number, full name, CNIC, and password are required' },
          { status: 400 }
        );
      }
      
      query = { rollNo, fullName, cnic, role: 'employee' };
    } else if (loginType === 'hr') {
      const { email } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }
      
      query = { email, role: 'hr' };
    } else if (loginType === 'admin') {
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

    // Prepare response
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      lastLogin: user.lastLogin,
      ...(user.role === 'employee' ? {
        rollNo: user.rollNo,
        cnic: user.cnic,
        jobTitle: user.jobTitle,
      } : {
        email: user.email,
        mobile: user.mobile,
      }),
    };

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      token, // Also return token for client-side storage if needed
    });

    // Set token as HTTP-only cookie (FIXED)
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set user role in cookie for quick access
    response.cookies.set({
      name: 'userRole',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Set user data in cookie (optional)
    response.cookies.set({
      name: 'userData',
      value: JSON.stringify(userResponse),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}