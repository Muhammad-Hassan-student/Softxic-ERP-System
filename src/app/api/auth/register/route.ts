import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Extract creator info from headers (added by middleware)
    const creatorId = request.headers.get('x-user-id');
    const creatorRole = request.headers.get('x-user-role');
    
    if (!creatorId || !creatorRole) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check permissions based on role being created
    const { role } = body;
    
    if (role === 'hr' && creatorRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admin can create HR accounts' },
        { status: 403 }
      );
    }
    
    if (role === 'employee' && !['admin', 'hr'].includes(creatorRole)) {
      return NextResponse.json(
        { success: false, message: 'Only admin or HR can create employee accounts' },
        { status: 403 }
      );
    }
    
    // Validate required fields based on role
    const validationErrors = [];
    
    if (role === 'employee') {
      const requiredEmployeeFields = [
        'fullName', 'cnic', 'password', 'mobile', 'fatherName',
        'dateOfBirth', 'gender', 'maritalStatus', 'address',
        'qualification', 'jobTitle', 'department', 'responsibility',
        'timing', 'monthOff', 'dateOfJoining', 'salary'
      ];
      
      for (const field of requiredEmployeeFields) {
        if (!body[field]) {
          validationErrors.push(`${field} is required for employees`);
        }
      }
      
      // Validate qualification structure
      if (body.qualification && (!body.qualification.academic || !body.qualification.other)) {
        validationErrors.push('Both academic and other qualifications are required');
      }
    }
    
    if (role === 'hr') {
      const requiredHRFields = ['fullName', 'cnic', 'password', 'mobile', 'email'];
      for (const field of requiredHRFields) {
        if (!body[field]) {
          validationErrors.push(`${field} is required for HR`);
        }
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }
    
    // Check if user already exists (CNIC should be unique)
    const existingUser = await User.findOne({ 
      $or: [
        { cnic: body.cnic },
        ...(body.email ? [{ email: body.email }] : []),
        ...(body.rollNo ? [{ rollNo: body.rollNo }] : [])
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User already exists with same CNIC, email, or roll number' 
        },
        { status: 400 }
      );
    }
    
    // Create user
    const userData = {
      ...body,
      createdBy: creatorId,
      status: 'active',
      isActive: true,
    };
    
    // Set default password if not provided
    if (!userData.password) {
      // Generate default password from CNIC (last 6 digits)
      userData.password = body.cnic.replace(/-/g, '').slice(-6);
    }
    
    const user = await User.create(userData);
    
    // Generate token for immediate login if needed
    const token = generateToken(user._id.toString(), user.role);
    
    // Prepare response (remove sensitive data)
    const userResponse = {
      id: user._id,
      rollNo: user.rollNo,
      fullName: user.fullName,
      cnic: user.cnic,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      department: user.department,
      jobTitle: user.jobTitle,
      status: user.status,
      createdAt: user.createdAt,
    };
    
    return NextResponse.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      data: userResponse,
      ...(role === 'hr' || role === 'employee' ? { 
        loginCredentials: {
          rollNo: user.rollNo,
          fullName: user.fullName,
          cnic: user.cnic,
          password: body.password || body.cnic.replace(/-/g, '').slice(-6),
        }
      } : {}),
      token: role === 'employee' ? undefined : token, // Don't return token for employees
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, message: `${field} already exists` },
        { status: 400 }
      );
    }
    
    if (error.message === 'Only one admin is allowed in the system') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}