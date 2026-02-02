// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('Login request:', { 
      loginType: body.loginType,
      identifier: body.email || body.rollNo || 'N/A' 
    });

    const { loginType } = body;

    // Determine login type and build query
    let query: any = {};
    let user: any = null;

    if (loginType === 'employee') {
      const { rollNo, fullName, cnic, password } = body;
      
      if (!rollNo || !fullName || !cnic || !password) {
        return NextResponse.json(
          { success: false, message: 'All fields are required for employee login' },
          { status: 400 }
        );
      }
      
      // Clean CNIC (remove dashes)
      const cleanCnic = cnic.replace(/-/g, '');
      
      query = { 
        rollNo: rollNo.trim(),
        cnic: cleanCnic,
        role: 'employee',
        isActive: true,
        status: 'active'
      };
      
      console.log('Employee login query:', query);
      
      // Find user
      user = await User.findOne(query).select('+password');
      
      if (user) {
        // Check if full name matches (case-insensitive)
        const userFullName = user.fullName?.toLowerCase().trim();
        const inputFullName = fullName.toLowerCase().trim();
        
        if (userFullName !== inputFullName) {
          console.log('Full name mismatch:', userFullName, 'vs', inputFullName);
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.log('Invalid password for employee');
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }
      }
      
    } else if (loginType === 'admin' || loginType === 'hr') {
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }
      
      query = { 
        email: email.toLowerCase().trim(),
        isActive: true,
        status: 'active'
      };
      
      console.log(`${loginType} login query:`, query);
      user = await User.findOne(query).select('+password');
      
      if (user) {
        // Check role matches
        if (user.role !== loginType) {
          console.log(`Role mismatch: Expected ${loginType}, got ${user.role}`);
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.log('Invalid password for:', loginType);
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid login type' },
        { status: 400 }
      );
    }

    // Check if user exists
    if (!user) {
      console.log('User not found with query:', query);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email || user.rollNo, 'Role:', user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    console.log('Token generated for:', user.fullName);

    // Prepare user response
    const userResponse = {
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

    // Determine dashboard path
    const dashboardPath = getDashboardPath(user.role);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userResponse,
      redirectTo: dashboardPath,
      userRole: user.role,
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set user role cookie (for client-side use)
    response.cookies.set({
      name: 'userRole',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Add debugging headers in development
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-id', user._id.toString());
    }

    console.log('Login successful for:', user.fullName);
    console.log('Redirecting to:', dashboardPath);

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
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

// Helper function to get dashboard path
function getDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    admin: '/admin/dashboard',
    hr: '/hr/dashboard/employee-management',
    employee: '/employee/dashboard',
    accounts: '/accounts/dashboard',
    support: '/support/dashboard',
    marketing: '/marketing/dashboard',
  };
  return paths[role] || '/dashboard';
}