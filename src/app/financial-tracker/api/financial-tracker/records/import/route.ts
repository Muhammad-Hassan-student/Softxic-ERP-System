import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ExportService from '@/app/financial-tracker/services/export-service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const module = formData.get('module') as string;
    const entity = formData.get('entity') as string;
    const branchId = formData.get('branchId') as string || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';

    const result = await ExportService.importFromFile(
      module,
      entity,
      buffer,
      fileType,
      decoded.userId,
      branchId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}