import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔐 Logout API called');
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear all auth cookies
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    response.cookies.delete('userId');
    response.cookies.delete('userData');

    // Also clear using set with expired date
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    response.cookies.set({
      name: 'userRole',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    response.cookies.set({
      name: 'userId',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    console.log('✅ Logout successful, cookies cleared');
    return response;

  } catch (error: any) {
    console.error('❌ Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}