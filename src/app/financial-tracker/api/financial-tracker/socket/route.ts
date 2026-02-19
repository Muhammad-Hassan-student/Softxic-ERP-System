import { NextResponse } from 'next/server';
import { initializeSocket } from '@/app/financial-tracker/lib/socket/server';

// This is a special route for Socket.io initialization
export async function GET() {
  return NextResponse.json({ 
    message: 'Socket.io server initialized',
    path: '/api/financial-tracker/socket'
  });
}

// Export the socket handler for Next.js to use
export const dynamic = 'force-dynamic';