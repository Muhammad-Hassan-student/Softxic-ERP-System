// src/app/financial-tracker/api/financial-tracker/analytics/views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import AnalyticsModel from '@/app/financial-tracker/models/analytics.model';
import { subDays, subWeeks, subMonths, format } from 'date-fns';

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
    const entityId = searchParams.get('entityId');
    const range = searchParams.get('range') || 'month';

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let formatStr: string;
    
    switch (range) {
      case 'day':
        startDate = subDays(now, 1);
        formatStr = 'HH:00';
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        formatStr = 'EEE';
        break;
      case 'month':
        startDate = subMonths(now, 1);
        formatStr = 'MMM dd';
        break;
      case 'year':
        startDate = subMonths(now, 12);
        formatStr = 'MMM yyyy';
        break;
      default:
        startDate = subMonths(now, 1);
        formatStr = 'MMM dd';
    }

    // Get analytics data
    const analytics = await AnalyticsModel.find({
      entityId,
      type: 'view',
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Group by date
    const grouped: Record<string, number> = {};
    analytics.forEach((item:any) => {
      const key = format(item.timestamp, formatStr);
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    return NextResponse.json({ labels, data });
  } catch (error: any) {
    console.error('Error fetching views analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views analytics', details: error.message },
      { status: 500 }
    );
  }
}