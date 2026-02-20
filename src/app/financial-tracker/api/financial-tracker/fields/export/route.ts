// src/app/api/financial-tracker/fields/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CustomFieldModel from '@/app/financial-tracker/models/custom-field.model';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import { Parser } from 'json2csv';

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

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const entityId = searchParams.get('entityId');
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    const query: any = {};
    if (module) query.module = module;
    if (entityId) query.entityId = entityId;
    if (!includeDisabled) query.isEnabled = true;

    const fields = await CustomFieldModel.find(query)
      .populate('entityId', 'name entityKey')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ module: 1, entityId: 1, order: 1 });

    const exportData = fields.map(field => ({
      'Module': field.module.toUpperCase(),
      'Entity': (field.entityId as any)?.name || '',
      'Entity Key': (field.entityId as any)?.entityKey || '',
      'Field Key': field.fieldKey,
      'Label': field.label,
      'Type': field.type,
      'Required': field.required ? 'Yes' : 'No',
      'Read Only': field.readOnly ? 'Yes' : 'No',
      'Visible': field.visible ? 'Yes' : 'No',
      'Enabled': field.isEnabled ? 'Yes' : 'No',
      'System Field': field.isSystem ? 'Yes' : 'No',
      'Order': field.order,
      'Default Value': field.defaultValue || '',
      'Options': field.options ? field.options.join(', ') : '',
      'Validation Min': field.validation?.min || '',
      'Validation Max': field.validation?.max || '',
      'Validation Regex': field.validation?.regex || '',
      'Allowed File Types': field.validation?.allowedFileTypes?.join(', ') || '',
      'Max File Size (MB)': field.validation?.maxFileSize ? field.validation.maxFileSize / 1024 / 1024 : '',
      'Created By': (field.createdBy as any)?.fullName || '',
      'Created At': new Date(field.createdAt).toLocaleDateString(),
      'Updated By': (field.updatedBy as any)?.fullName || '',
      'Updated At': new Date(field.updatedAt).toLocaleDateString()
    }));

    const fields_csv = [
      'Module', 'Entity', 'Entity Key', 'Field Key', 'Label', 'Type',
      'Required', 'Read Only', 'Visible', 'Enabled', 'System Field', 'Order',
      'Default Value', 'Options', 'Validation Min', 'Validation Max',
      'Validation Regex', 'Allowed File Types', 'Max File Size (MB)',
      'Created By', 'Created At', 'Updated By', 'Updated At'
    ];
    
    const parser = new Parser({ fields: fields_csv });
    const csv = parser.parse(exportData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=fields-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error: any) {
    console.error('Error exporting fields:', error);
    return NextResponse.json(
      { error: 'Failed to export fields', details: error.message },
      { status: 500 }
    );
  }
}