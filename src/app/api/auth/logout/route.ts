import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear cookies
    response.cookies.delete('token');
    response.cookies.delete('userRole');
    
    // Also clear any other auth-related cookies
    ['token', 'userRole', 'user', 'rememberedUser'].forEach(cookieName => {
      response.cookies.delete(cookieName);
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}