// src/app/financial-tracker/api/financial-tracker/entities/[id]/archive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ FIXED: params is Promise
) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ FIXED: await params to get id
    const { id } = await params;

    const entity = await EntityModel.findByIdAndUpdate(
      id,  // Use id from awaited params
      { 
        isEnabled: false,
        updatedBy: decoded.userId,
        updatedAt: new Date(),
        $set: {
          'metadata.archivedAt': new Date(),
          'metadata.archivedBy': decoded.userId
        }
      },
      { new: true }
    );

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Entity archived successfully',
      entity
    });

  } catch (error: any) {
    console.error('Error archiving entity:', error);
    return NextResponse.json(
      { error: 'Failed to archive entity', details: error.message },
      { status: 500 }
    );
  }
}