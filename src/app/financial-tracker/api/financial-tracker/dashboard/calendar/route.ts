import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import DashboardService from '@/app/financial-tracker/services/dashboard.service'; // Fixed: dashboard.service.ts (with .ts extension, not dashboard-service)

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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const module = searchParams.get('module') || undefined;
    const entity = searchParams.get('entity') || undefined;
    const branchId = searchParams.get('branchId') || undefined;

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    const calendarData = await DashboardService.getCalendarData(
      startDate,
      endDate,
      module,
      entity,
      branchId
    );

    return NextResponse.json(calendarData);

  } catch (error: any) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data', details: error.message },
      { status: 500 }
    );
  }
}