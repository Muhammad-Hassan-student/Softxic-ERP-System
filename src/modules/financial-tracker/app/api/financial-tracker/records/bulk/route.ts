import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordService from '@/modules/financial-tracker/services/record-service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { module, entity, records, branchId } = await request.json();

    const result = await RecordService.bulkCreate(
      records,
      module,
      entity,
      decoded.userId,
      branchId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}