// src/app/api/financial-tracker/module-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { generateToken } from '@/lib/auth/jwt';
import ModuleUser from '@/app/financial-tracker/models/module-user.model';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, module } = await request.json();

    // Validate input
    if (!email || !password || !module) {
      return NextResponse.json(
        { error: 'Email, password and module are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await ModuleUser.findOne({ email, module }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // ✅ Generate token with role 'module-user'
    const token = generateToken(user._id.toString(), 'module-user');

    // Create response with proper JSON
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        module: user.module,
        role: 'module-user',
        entities: user.entities || [],
        permissions: user.permissions || {}
      }
    };

    // Create response
    const response = NextResponse.json(responseData);

    // Set cookies
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
      value: 'module-user',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set({
      name: 'module',
      value: user.module,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set({
      name: 'userType',
      value: 'module',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Module login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Module login API is working. Use POST to login.' 
  });
}