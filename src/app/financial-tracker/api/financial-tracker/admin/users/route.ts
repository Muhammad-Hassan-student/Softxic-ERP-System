import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/models/User';
import UserPermissionModel from '@/app/financial-tracker/models/user-permission.model'; // ✅ FIXED: modules path
import bcrypt from 'bcryptjs';

// GET /api/financial-tracker/admin/users - List all users
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/financial-tracker/admin/users - Create new user
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.fullName || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const user = new User({
      fullName: body.fullName,
      email: body.email,
      password: hashedPassword,
      role: body.role,
      department: body.department,
      designation: body.designation,
      mobile: body.mobile,
      employeeId: body.employeeId,
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
      status: 'active',
      isActive: true,
      createdBy: decoded.userId
    });

    await user.save();

    // Create default permissions
    const permissions = new UserPermissionModel({
      userId: user._id,
      permissions: {
        re: {},
        expense: {}
      },
      department: body.department,
      createdBy: decoded.userId,
      updatedBy: decoded.userId
    });

    await permissions.save();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}