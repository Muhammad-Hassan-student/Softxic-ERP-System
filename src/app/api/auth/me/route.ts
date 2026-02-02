import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  console.log('🔍 Auth check /me API called');
  
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    console.log('Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token',
        isAuthenticated: false,
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
        isAuthenticated: false,
      });
    }
    
    console.log('✅ Token decoded:', decoded);
    
    // Connect to database and get user
    await connectDB();
    
    const user = await User.findById(decoded.userId)
      .select('-password -__v')
      .lean();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        isAuthenticated: false,
      });
    }
    
    if (!user.isActive || user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Account is deactivated',
        isAuthenticated: false,
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
      status: user.status,
    };
    
    console.log('✅ User authenticated:', userData.fullName);
    
    return NextResponse.json({
      success: true,
      message: 'User authenticated',
      data: userData,
      isAuthenticated: true,
    });
    
  } catch (error: any) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      isAuthenticated: false,
    }, { status: 500 });
  }
}