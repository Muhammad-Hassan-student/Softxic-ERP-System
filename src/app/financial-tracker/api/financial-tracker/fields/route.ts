import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CustomFieldModel from '@/app/financial-tracker/models/custom-field.model';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

// GET /api/financial-tracker/fields - List fields for entity
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
    const entityId = searchParams.get('entityId');
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    if (!module || !entityId) {
      return NextResponse.json(
        { error: 'Module and entityId are required' },
        { status: 400 }
      );
    }

    const query: any = { module, entityId };
    if (!includeDisabled) {
      query.isEnabled = true;
    }

    const fields = await CustomFieldModel.find(query)
      .sort({ order: 1, createdAt: 1 });

    return NextResponse.json({ fields });

  } catch (error: any) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fields', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/financial-tracker/fields - Create new field
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
    if (!body.module || !body.entityId || !body.fieldKey || !body.label || !body.type) {
      return NextResponse.json(
        { error: 'Module, entityId, fieldKey, label, and type are required' },
        { status: 400 }
      );
    }

    // Validate fieldKey format
    if (!/^[a-z0-9-]+$/.test(body.fieldKey)) {
      return NextResponse.json(
        { error: 'fieldKey must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    // Check if entity exists
    const entity = await EntityModel.findById(body.entityId);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Check if field already exists
    const existing = await CustomFieldModel.findOne({
      entityId: body.entityId,
      fieldKey: body.fieldKey.toLowerCase()
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Field with this key already exists for this entity' },
        { status: 409 }
      );
    }

    // Validate options for select/radio
    if ((body.type === 'select' || body.type === 'radio') && (!body.options || body.options.length === 0)) {
      return NextResponse.json(
        { error: 'Options are required for select/radio fields' },
        { status: 400 }
      );
    }

    // Create field
    const field = new CustomFieldModel({
      module: body.module,
      entityId: body.entityId,
      fieldKey: body.fieldKey.toLowerCase(),
      label: body.label,
      type: body.type,
      isSystem: false,
      isEnabled: body.isEnabled !== false,
      required: body.required || false,
      readOnly: body.readOnly || false,
      visible: body.visible !== false,
      order: body.order || 0,
      defaultValue: body.defaultValue,
      options: body.options,
      validation: body.validation,
      createdBy: decoded.userId
    });

    await field.save();

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: body.module,
      entity: entity.entityKey,
      action: 'CREATE',
      changes: [{ 
        field: 'customField', 
        oldValue: null,
        newValue: body.fieldKey 
      }]
    });

    return NextResponse.json({
      message: 'Field created successfully',
      field
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: 'Failed to create field', details: error.message },
      { status: 500 }
    );
  }
}