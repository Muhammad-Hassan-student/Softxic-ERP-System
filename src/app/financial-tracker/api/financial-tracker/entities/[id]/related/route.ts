// src/app/financial-tracker/api/financial-tracker/entities/[id]/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';

export async function GET(
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // ✅ FIXED: await params to get id
    const { id } = await params;

    const entity = await EntityModel.findById(id);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Find related entities
    const related = await EntityModel.find({
      $and: [
        { _id: { $ne: entity._id } },
        {
          $or: [
            { module: entity.module },
            { entityKey: { $regex: entity.entityKey.split('-')[0], $options: 'i' } },
            { branchId: entity.branchId }
          ]
        }
      ]
    })
    .limit(10)
    .select('_id name module entityKey');

    // Add relationship types
    const relatedWithTypes = related.map(rel => {
      let relationship = 'related';
      if (rel.module === entity.module) relationship = 'same-module';
      if (rel.branchId === entity.branchId) relationship = 'same-branch';
      if (rel.entityKey.includes(entity.entityKey.split('-')[0])) relationship = 'similar';

      return {
        _id: rel._id,
        name: rel.name,
        module: rel.module,
        entityKey: rel.entityKey,
        relationship,
        direction: 'bidirectional',
        strength: relationship === 'same-module' ? 'strong' : 'weak'
      };
    });

    return NextResponse.json({ related: relatedWithTypes });
  } catch (error: any) {
    console.error('Error fetching related entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related entities', details: error.message },
      { status: 500 }
    );
  }
}