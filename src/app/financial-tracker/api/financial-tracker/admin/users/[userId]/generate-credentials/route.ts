import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ✅ FIX: params ab async function ke andar await karna hoga
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ FIX: params ko await karo
    const { userId } = await params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate random password
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      username: user.email,
      password: password,
      message: 'Credentials generated successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate credentials', details: error.message },
      { status: 500 }
    );
  }
}