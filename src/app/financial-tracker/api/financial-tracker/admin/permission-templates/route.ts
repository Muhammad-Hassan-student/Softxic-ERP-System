// src/app/api/financial-tracker/admin/permission-templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import PermissionTemplateModel from '@/app/financial-tracker/models/permission-template.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function GET(request: NextRequest) {
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

    const templates = await PermissionTemplateModel.find()
      .sort({ name: 1 });

    return NextResponse.json({ templates });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

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

    const template = new PermissionTemplateModel({
      name: body.name,
      description: body.description,
      permissions: body.permissions,
      createdBy: decoded.userId,
      updatedBy: decoded.userId
    });

    await template.save();

    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'permission-templates',
      recordId: template._id,
      action: 'CREATE',
      changes: [{
        field: 'template',
        oldValue: null,
        newValue: body.name
      }]
    });

    return NextResponse.json({
      message: 'Permission template created successfully',
      template
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}