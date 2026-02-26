// src/app/financial-tracker/api/financial-tracker/analytics/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import { startOfDay, subDays, subWeeks, subMonths, subQuarters, subYears, format } from 'date-fns';

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
    const range = searchParams.get('range') || 'month';
    const module = searchParams.get('module');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let groupBy: any;

    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        dateFormat = 'HH:00';
        groupBy = { $hour: '$createdAt' };
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        dateFormat = 'EEE';
        groupBy = { $dayOfWeek: '$createdAt' };
        break;
      case 'month':
        startDate = subMonths(now, 1);
        dateFormat = 'MMM d';
        groupBy = { $dayOfMonth: '$createdAt' };
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        dateFormat = 'MMM';
        groupBy = { $month: '$createdAt' };
        break;
      case 'year':
        startDate = subYears(now, 1);
        dateFormat = 'MMM';
        groupBy = { $month: '$createdAt' };
        break;
      default:
        startDate = subMonths(now, 1);
        dateFormat = 'MMM d';
        groupBy = { $dayOfMonth: '$createdAt' };
    }

    // Build query
    const query: any = {
      createdAt: { $gte: startDate },
      ...(module && module !== 'all' ? { module } : {})
    };

    // Get RE data
    const reData = await RecordModel.aggregate([
      { $match: { ...query, module: 're' } },
      {
        $group: {
          _id: groupBy,
          total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get Expense data
    const expenseData = await RecordModel.aggregate([
      { $match: { ...query, module: 'expense' } },
      {
        $group: {
          _id: groupBy,
          total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get profit/loss data
    const profitData = await RecordModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupBy,
          reTotal: {
            $sum: {
              $cond: [
                { $eq: ['$module', 're'] },
                { $ifNull: ['$data.amount', '$data.total', 0] },
                0
              ]
            }
          },
          expenseTotal: {
            $sum: {
              $cond: [
                { $eq: ['$module', 'expense'] },
                { $ifNull: ['$data.amount', '$data.total', 0] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          profit: { $subtract: ['$reTotal', '$expenseTotal'] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate labels based on range
    const labels: string[] = [];
    const dataPoints: any[] = [];

    for (let i = 0; i < (range === 'week' ? 7 : range === 'month' ? 30 : 12); i++) {
      let date: Date;
      let label: string;

      switch (range) {
        case 'today':
          date = new Date(now);
          date.setHours(i, 0, 0, 0);
          label = format(date, 'HH:00');
          break;
        case 'week':
          date = subDays(now, 6 - i);
          label = format(date, 'EEE');
          break;
        case 'month':
          date = subDays(now, 29 - i);
          label = format(date, 'MMM d');
          break;
        case 'quarter':
        case 'year':
          date = new Date(now.getFullYear(), i, 1);
          label = format(date, 'MMM');
          break;
        default:
          date = subDays(now, 29 - i);
          label = format(date, 'MMM d');
      }

      labels.push(label);
    }

    // Prepare dataset
    const datasets = [
      {
        label: 'Revenue',
        data: reData.map(d => d.total),
        color: '#3B82F6',
        borderColor: '#2563EB',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        label: 'Expense',
        data: expenseData.map(d => d.total),
        color: '#EF4444',
        borderColor: '#DC2626',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      },
      {
        label: 'Profit',
        data: profitData.map(d => d.profit),
        color: '#10B981',
        borderColor: '#059669',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }
    ];

    return NextResponse.json({
      success: true,
      labels,
      datasets,
      summary: {
        totalRE: reData.reduce((acc, d) => acc + d.total, 0),
        totalExpense: expenseData.reduce((acc, d) => acc + d.total, 0),
        totalProfit: profitData.reduce((acc, d) => acc + d.profit, 0),
        avgRE: reData.length ? reData.reduce((acc, d) => acc + d.total, 0) / reData.length : 0,
        avgExpense: expenseData.length ? expenseData.reduce((acc, d) => acc + d.total, 0) / expenseData.length : 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data', details: error.message },
      { status: 500 }
    );
  }
}