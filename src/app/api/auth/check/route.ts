import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token found',
        hasToken: false,
        cookies: request.cookies.getAll().map(c => c.name),
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
        hasToken: true,
        tokenValid: false,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      hasToken: true,
      tokenValid: true,
      user: {
        userId: decoded.userId,
        role: decoded.role,
      },
      cookies: request.cookies.getAll().map(c => ({ 
        name: c.name, 
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
      })),
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error.message,
    }, { status: 500 });
  }
}