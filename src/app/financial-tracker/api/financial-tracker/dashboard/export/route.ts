// src/app/api/financial-tracker/dashboard/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import DashboardService from '@/app/financial-tracker/services/dashboard.service';

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
    const format = searchParams.get('format') as 'excel' | 'csv' | 'pdf';
    const range = searchParams.get('range') as 'today' | 'week' | 'month' | 'quarter' | 'year' || 'month';
    const module = searchParams.get('module') || undefined;
    const entity = searchParams.get('entity') || undefined;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get stats
    const stats = await DashboardService.getDashboardStats(module, entity);
    
    // Get calendar data
    const calendarData = await DashboardService.getCalendarData(
      startDate,
      endDate,
      module,
      entity
    );

    // Prepare summary data with safe access
    const summaryData = [
      { Metric: 'Total Users', Value: stats.totalUsers || 0 },
      { Metric: 'Active Users', Value: stats.activeUsers || 0 },
      { Metric: 'New Users Today', Value: stats.newUsersToday || 0 },
      { Metric: 'Total Records', Value: stats.totalRecords || 0 },
      { Metric: 'Records Today', Value: stats.recordsToday || 0 },
      { Metric: 'Records This Week', Value: stats.recordsThisWeek || 0 },
      { Metric: 'Records This Month', Value: stats.recordsThisMonth || 0 },
      { Metric: 'Total RE', Value: stats.totalRE || 0 },
      { Metric: 'Total Expense', Value: stats.totalExpense || 0 },
      { Metric: 'Net Profit', Value: (stats.totalRE || 0) - (stats.totalExpense || 0) },
      { Metric: 'RE Today', Value: stats.reToday || 0 },
      { Metric: 'Expense Today', Value: stats.expenseToday || 0 },
      { Metric: 'Pending Approvals', Value: stats.pendingApprovals || 0 },
      { Metric: 'Approved Today', Value: stats.approvedToday || 0 },
      { Metric: 'Rejected Today', Value: stats.rejectedToday || 0 }
    ];

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const ws1 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
      
      // Calendar sheet
      if (calendarData && calendarData.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(calendarData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Daily Breakdown');
      }
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=dashboard-${range}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } 
    else if (format === 'csv') {
      const parser = new Parser({ fields: ['Metric', 'Value'] });
      const csv = parser.parse(summaryData);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=dashboard-${range}-${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }
    else if (format === 'pdf') {
      return new Promise((resolve) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename=dashboard-${range}-${new Date().toISOString().split('T')[0]}.pdf`
            }
          }));
        });
        
        // Add content
        doc.fontSize(20).text('Dashboard Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Date Range: ${range}`);
        doc.moveDown();
        
        doc.fontSize(16).text('Summary');
        doc.moveDown();
        
        summaryData.forEach(item => {
          const value = typeof item.Value === 'number' 
            ? item.Value.toLocaleString() 
            : String(item.Value);
          doc.fontSize(10).text(`${item.Metric}: ${value}`);
        });
        
        doc.end();
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error: any) {
    console.error('Dashboard export error:', error);
    return NextResponse.json(
      { error: 'Failed to export dashboard', details: error.message },
      { status: 500 }
    );
  }
}