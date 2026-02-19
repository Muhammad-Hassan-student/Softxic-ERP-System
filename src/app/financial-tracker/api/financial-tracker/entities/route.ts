import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

// GET /api/financial-tracker/entities - List all entities
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
    const module = searchParams.get('module');
    const branchId = searchParams.get('branchId');

    const query: any = {};
    if (module) query.module = module;
    if (branchId) query.branchId = branchId;

    const entities = await EntityModel.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ entities });

  } catch (error: any) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/financial-tracker/entities - Create new entity
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.module || !body.entityKey || !body.name) {
      return NextResponse.json(
        { error: 'Module, entityKey, and name are required' },
        { status: 400 }
      );
    }

    // Validate module
    if (!['re', 'expense'].includes(body.module)) {
      return NextResponse.json(
        { error: 'Invalid module. Must be "re" or "expense"' },
        { status: 400 }
      );
    }

    // Check if entity already exists
    const existing = await EntityModel.findOne({
      module: body.module,
      entityKey: body.entityKey.toLowerCase(),
      branchId: body.branchId || null
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Entity with this key already exists in this module' },
        { status: 409 }
      );
    }

    // Create entity
    const entity = new EntityModel({
      module: body.module,
      entityKey: body.entityKey.toLowerCase(),
      name: body.name,
      description: body.description || '',
      isEnabled: body.isEnabled !== false,
      enableApproval: body.enableApproval || false,
      branchId: body.branchId,
      createdBy: decoded.userId,
      updatedBy: decoded.userId
    });

    await entity.save();

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: body.module,
      entity: body.entityKey,
      action: 'CREATE',
      changes: [{ 
        field: 'entity', 
        oldValue: null,
        newValue: body.entityKey 
      }]
    });

    return NextResponse.json({
      message: 'Entity created successfully',
      entity
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating entity:', error);
    return NextResponse.json(
      { error: 'Failed to create entity', details: error.message },
      { status: 500 }
    );
  }
}