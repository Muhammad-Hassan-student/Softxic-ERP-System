import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  console.log('🔍 /api/auth/me called');
  
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('❌ No token in cookies');
      return NextResponse.json({
        success: false,
        isAuthenticated: false,
        message: 'No authentication token',
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Token verification failed');
      return NextResponse.json({
        success: false,
        isAuthenticated: false,
        message: 'Invalid or expired token',
      });
    }

    console.log('✅ Token verified:', { userId: decoded.userId, role: decoded.role });

    // Connect to database
    await connectDB();
    
    // Get user from database
    const user = await User.findById(decoded.userId)
      .select('-password -__v -createdAt -updatedAt')
      .lean();

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({
        success: false,
        isAuthenticated: false,
        message: 'User not found',
      });
    }

    if (!user.isActive || user.status !== 'active') {
      console.log('❌ User account is not active');
      return NextResponse.json({
        success: false,
        isAuthenticated: false,
        message: 'Account is deactivated',
      });
    }

    const userData = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      rollNo: user.rollNo,
      cnic: user.cnic,
      jobTitle: user.jobTitle,
      mobile: user.mobile,
      status: user.status,
      lastLogin: user.lastLogin,
    };

    console.log('✅ User authenticated:', userData.fullName);

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      message: 'User authenticated',
      data: userData,
    });

  } catch (error: any) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json({
      success: false,
      isAuthenticated: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}