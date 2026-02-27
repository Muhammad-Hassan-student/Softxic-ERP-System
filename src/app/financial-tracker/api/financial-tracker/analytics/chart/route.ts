// src/app/financial-tracker/api/financial-tracker/analytics/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import { subDays, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  console.log('🔵 ANALYTICS API CALLED');
  
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
    const range = searchParams.get('range') || 'month';
    const module = searchParams.get('module');

    // Get date range
    const endDate = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'quarter':
        startDate = subMonths(endDate, 3);
        break;
      case 'year':
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    // Build query
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      isDeleted: { $ne: true }
    };
    
    if (module && module !== 'all') {
      match.module = module;
    }

    // Get daily aggregates
    const data = await RecordModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            module: '$module'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$data.amount', 0] } }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format response
    const labels: string[] = [];
    const reData: number[] = [];
    const expenseData: number[] = [];

    // Generate all dates in range
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      labels.push(dateStr);
      
      const reEntry = data.find(d => 
        d._id.date === dateStr && d._id.module === 're'
      );
      const expenseEntry = data.find(d => 
        d._id.date === dateStr && d._id.module === 'expense'
      );
      
      reData.push(reEntry?.totalAmount || 0);
      expenseData.push(expenseEntry?.totalAmount || 0);
      
      currentDate = subDays(currentDate, -1);
    }

    return NextResponse.json({
      success: true,
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: reData,
          color: '#3B82F6',
          borderColor: '#2563EB',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
          label: 'Expense',
          data: expenseData,
          color: '#EF4444',
          borderColor: '#DC2626',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }
      ],
      summary: {
        totalRE: reData.reduce((a, b) => a + b, 0),
        totalExpense: expenseData.reduce((a, b) => a + b, 0),
        avgRE: reData.length ? reData.reduce((a, b) => a + b, 0) / reData.length : 0,
        avgExpense: expenseData.length ? expenseData.reduce((a, b) => a + b, 0) / expenseData.length : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}