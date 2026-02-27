// src/app/financial-tracker/api/financial-tracker/entities/[id]/clone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ FIXED
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

    const { id } = await params;  // ✅ FIXED: await params

    const originalEntity = await EntityModel.findById(id);
    if (!originalEntity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    const clonedEntity = new EntityModel({
      ...originalEntity.toObject(),
      _id: undefined,
      name: `${originalEntity.name} (Copy)`,
      entityKey: `${originalEntity.entityKey}-copy`,
      createdBy: decoded.userId,
      updatedBy: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await clonedEntity.save();

    return NextResponse.json({
      message: 'Entity cloned successfully',
      entity: clonedEntity
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error cloning entity:', error);
    return NextResponse.json(
      { error: 'Failed to clone entity', details: error.message },
      { status: 500 }
    );
  }
}