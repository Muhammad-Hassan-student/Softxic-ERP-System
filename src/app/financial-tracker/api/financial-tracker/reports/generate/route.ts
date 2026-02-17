import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

// Define types for the report data
interface ReportTotals {
  reTotal: number;
  expenseTotal: number;
  totalRecords: number;
}

export async function POST(request: NextRequest) {
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

    const config = await request.json();

    // Build query based on config
    const query: any = {
      isDeleted: false
    };

    if (config.module !== 'both') {
      query.module = config.module;
    }

    if (config.entity !== 'all') {
      query.entity = config.entity;
    }

    if (config.dateRange) {
      query.createdAt = {
        $gte: new Date(config.dateRange.start),
        $lte: new Date(config.dateRange.end)
      };
    }

    // Apply additional filters
    if (config.filters) {
      Object.assign(query, config.filters);
    }

    // Fetch records
    const records = await RecordModel.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for report
    const reportData = records.map(record => {
      // Convert Map to plain object
      const dataObject: Record<string, any> = {};
      if (record.data && typeof (record.data as any).forEach === 'function') {
        (record.data as Map<string, any>).forEach((value, key) => {
          dataObject[key] = value;
        });
      }

      return {
        'ID': record._id?.toString() || '',
        'Module': record.module,
        'Entity': record.entity,
        'Created By': (record.createdBy as any)?.fullName || 'Unknown',
        'Created At': record.createdAt ? new Date(record.createdAt).toLocaleString() : '',
        'Updated By': (record.updatedBy as any)?.fullName || 'Unknown',
        'Updated At': record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '',
        'Status': record.status || 'draft',
        'Version': record.version || 1,
        ...dataObject
      };
    });

    // Generate file based on format
    if (config.format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(reportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=report-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } 
    else if (config.format === 'csv') {
      const fields = Object.keys(reportData[0] || {});
      const parser = new Parser({ fields });
      const csv = parser.parse(reportData);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=report-${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }
    else if (config.format === 'pdf') {
      // Create PDF
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      // Fix: Add proper type for chunk
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      
      // Add content to PDF
      doc.fontSize(16).text('Financial Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
      doc.text(`Module: ${config.module}`);
      doc.text(`Entity: ${config.entity}`);
      doc.text(`Date Range: ${config.dateRange?.start || 'N/A'} to ${config.dateRange?.end || 'N/A'}`);
      doc.moveDown();

      // Add summary with proper typing
      const totals = records.reduce<ReportTotals>((acc, record) => {
        let amount = 0;
        if (record.data && typeof (record.data as any).get === 'function') {
          amount = (record.data as Map<string, any>).get('amount') || 0;
        }
        
        if (record.module === 're') {
          acc.reTotal += Number(amount);
        } else {
          acc.expenseTotal += Number(amount);
        }
        acc.totalRecords++;
        return acc;
      }, { reTotal: 0, expenseTotal: 0, totalRecords: 0 });

      doc.fontSize(14).text('Summary');
      doc.fontSize(10).text(`Total Records: ${totals.totalRecords}`);
      doc.text(`RE Total: PKR ${totals.reTotal.toLocaleString()}`);
      doc.text(`Expense Total: PKR ${totals.expenseTotal.toLocaleString()}`);
      doc.text(`Net: PKR ${(totals.reTotal - totals.expenseTotal).toLocaleString()}`);
      doc.moveDown();

      // Add table (simplified)
      doc.fontSize(14).text('Details');
      doc.fontSize(8);
      
      const sampleRecords = records.slice(0, 50); // Limit for PDF
      sampleRecords.forEach((record, index) => {
        let amount = 0;
        if (record.data && typeof (record.data as any).get === 'function') {
          amount = (record.data as Map<string, any>).get('amount') || 0;
        }
        doc.text(`${index + 1}. ${record.module?.toUpperCase() || ''} - ${record.entity || ''}: ${amount}`);
      });

      doc.end();

      // Wait for PDF to complete
      await new Promise<void>((resolve) => {
        doc.on('end', resolve);
      });

      const pdfBuffer = Buffer.concat(chunks);

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=report-${new Date().toISOString().split('T')[0]}.pdf`
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid format specified' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}