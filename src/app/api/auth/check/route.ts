import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        hasToken: false,
        isValid: false,
        message: 'No token found',
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        hasToken: true,
        isValid: false,
        message: 'Token is invalid or expired',
      });
    }

    return NextResponse.json({
      success: true,
      hasToken: true,
      isValid: true,
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        role: decoded.role,
      },
      cookies: {
        token: !!request.cookies.get('token'),
        userRole: !!request.cookies.get('userRole'),
        userId: !!request.cookies.get('userId'),
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error.message,
    }, { status: 500 });
  }
}