import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import DashboardService from '@/modules/financial-tracker/services/dashboard.service'; // Fixed: Correct import path

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') || undefined;
    const entity = searchParams.get('entity') || undefined;
    const branchId = searchParams.get('branchId') || undefined;

    const stats = await DashboardService.getDashboardStats(module, entity, branchId);

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}