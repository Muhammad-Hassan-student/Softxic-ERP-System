import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { generateToken } from '@/lib/auth/jwt';
import ModuleUser from '@/app/financial-tracker/models/module-user.model';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, module } = await request.json();

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

    // Generate token
    const token = generateToken(user._id.toString(), 'module-user');

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        module: user.module,
        entities: user.entities,
        permissions: user.permissions
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}