import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import { getTokenFromRequest } from '@/lib/auth/token-helper';
import FieldModel from '@/modules/financial-tracker/models/custom-field.model';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token using helper
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const entityId = searchParams.get('entityId');

    if (!module || !entityId) {
      return NextResponse.json(
        { error: 'Module and entityId are required' },
        { status: 400 }
      );
    }

    const fields = await FieldModel.find({
      module,
      entityId,
      isEnabled: true
    }).sort('order');

    return NextResponse.json({ fields });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch fields', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    const field = new FieldModel({
      ...body,
      createdBy: decoded.userId,
      order: await FieldModel.countDocuments({ entityId: body.entityId })
    });

    await field.save();

    return NextResponse.json({ field });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create field', details: error.message },
      { status: 500 }
    );
  }
}