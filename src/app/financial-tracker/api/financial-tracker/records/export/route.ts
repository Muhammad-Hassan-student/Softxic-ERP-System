import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ExportService from '@/app/financial-tracker/services/export-service';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module')!;
    const entity = searchParams.get('entity')!;
    const format = searchParams.get('format') as 'excel' | 'csv';
    const branchId = searchParams.get('branchId') || undefined;

    let buffer: Buffer | string;
    let contentType: string;
    let extension: string;

    if (format === 'excel') {
      buffer = await ExportService.toExcel(module, entity, decoded.userId, {}, branchId);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
    } else {
      buffer = await ExportService.toCSV(module, entity, decoded.userId, {}, branchId);
      contentType = 'text/csv';
      extension = 'csv';
    }

    return new NextResponse(typeof buffer === 'string' ? buffer : new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${module}-${entity}-${new Date().toISOString().split('T')[0]}.${extension}`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}