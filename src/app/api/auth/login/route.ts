import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function POST(request: NextRequest) {
  console.log('🔐 Login API called');
  
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('Login request:', { loginType: body.loginType });
    
    const { loginType, password } = body;
    
    if (!loginType || !password) {
      return NextResponse.json(
        { success: false, message: 'Login type and password are required' },
        { status: 400 }
      );
    }
    
    let user = null;
    
    // Employee login
    if (loginType === 'employee') {
      const { rollNo, fullName, cnic } = body;
      
      if (!rollNo || !fullName || !cnic) {
        return NextResponse.json(
          { success: false, message: 'All fields are required for employee login' },
          { status: 400 }
        );
      }
      
      // Clean CNIC
      const cleanCnic = cnic.replace(/-/g, '');
      
      // Find employee
      user = await User.findOne({ 
        rollNo: rollNo.trim(),
        cnic: cleanCnic,
        role: 'employee',
        isActive: true,
        status: 'active'
      }).select('+password');
      
      if (user) {
        // Check full name (case-insensitive)
        const userFullName = user.fullName?.toLowerCase().trim();
        const inputFullName = fullName.toLowerCase().trim();
        
        if (userFullName !== inputFullName) {
          console.log('Full name mismatch');
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }
      }
    }
    // Admin login
    else if (loginType === 'admin') {
      const { email } = body;
      
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }
      
      user = await User.findOne({ 
        email: email.toLowerCase().trim(),
        role: 'admin',
        isActive: true,
        status: 'active'
      }).select('+password');
    }
    // HR login
    else if (loginType === 'hr') {
      const { email } = body;
      
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }
      
      user = await User.findOne({ 
        email: email.toLowerCase().trim(),
        role: 'hr',
        isActive: true,
        status: 'active'
      }).select('+password');
    }
    else {
      return NextResponse.json(
        { success: false, message: 'Invalid login type' },
        { status: 400 }
      );
    }
    
    // User not found
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('✅ User found:', user.email || user.rollNo);
    
    // Check password - FIXED: Use bcrypt.compare directly
    let isPasswordValid = false;
    try {
      // First try bcrypt.compare
      isPasswordValid = await bcrypt.compare(password, user.password);
      
      // If bcrypt fails, try the comparePassword method if it exists
      if (!isPasswordValid && typeof user.comparePassword === 'function') {
        isPasswordValid = await user.comparePassword(password);
      }
    } catch (error) {
      console.error('Password comparison error:', error);
    }
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log('✅ Password verified');
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    
    console.log('✅ Token generated');
    
    // Prepare user data
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
      lastLogin: user.lastLogin,
    };
    
    // Determine redirect path
    const dashboardPath = getDashboardPath(user.role);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userData,
      redirectTo: dashboardPath,
    });
    
    // Set cookies - FIXED: secure: false for local development
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    response.cookies.set({
      name: 'userRole',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    
    console.log('🍪 Cookies set for:', user.role);
    console.log('🔗 Redirecting to:', dashboardPath);
    
    return response;
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function getDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    admin: '/admin/dashboard',
    hr: '/hr/dashboard',
    employee: '/employee/dashboard',
    accounts: '/accounts/dashboard',
    support: '/support/dashboard',
    marketing: '/marketing/dashboard',
  };
  return paths[role] || '/dashboard';
}

export const runtime = 'nodejs';