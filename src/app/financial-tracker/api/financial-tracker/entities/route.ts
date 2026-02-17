import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const active = searchParams.get('active') === 'true';

    const query: any = {};
    if (module) query.module = module;
    if (active) query.isEnabled = true;

    const entities = await EntityModel.find(query)
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ entities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const entity = new EntityModel({
      ...body,
      createdBy: decoded.userId,
      updatedBy: decoded.userId
    });

    await entity.save();

    await ActivityService.log({
      userId: decoded.userId,
      module: body.module,
      entity: body.entityKey,
      action: 'CREATE',
      changes: [{ field: 'entity', oldValue: null, newValue: body.entityKey }]
    });

    return NextResponse.json({ entity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}