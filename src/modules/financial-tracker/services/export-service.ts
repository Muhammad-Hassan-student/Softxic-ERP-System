import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import RecordModel from '../models/record.model';
import CustomFieldModel from '../models/custom-field.model';
import PermissionService from './permission-service';

class ExportService {
  /**
   * Export records to Excel
   */
  static async toExcel(
    module: string,
    entity: string,
    userId: string,
    filters?: any,
    branchId?: string
  ): Promise<Buffer> {
    // Get fields for headers
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true,
      visible: true
    }).sort('order');

    // Get column permissions
    const columnPerms = await PermissionService.getColumnPermissions(userId, module, entity);
    
    // Filter columns user can view
    const visibleFields = fields.filter(f => 
      columnPerms[f.fieldKey]?.view !== false
    );

    // Build query
    const query: any = {
      module,
      entity,
      isDeleted: false
    };
    
    if (branchId) query.branchId = branchId;
    if (filters) {
      Object.assign(query, filters);
    }

    // Get records
    const records = await RecordModel.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .lean();

    // Transform data for export
    const exportData = records.map(record => {
      const row: any = {
        'ID': record._id,
        'Created By': (record.createdBy as any)?.fullName || '',
        'Created At': record.createdAt,
        'Updated By': (record.updatedBy as any)?.fullName || '',
        'Updated At': record.updatedAt,
        'Status': record.status,
        'Version': record.version
      };

      // Add dynamic fields
      visibleFields.forEach(field => {
        let value = '';
        if (record.data && typeof (record.data as any).get === 'function') {
          value = (record.data as Map<string, any>).get(field.fieldKey) || '';
        }
        row[field.label] = value;
      });

      return row;
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [];
    for (let i = 0; i < visibleFields.length + 7; i++) {
      colWidths.push({ wch: 20 });
    }
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `${entity}_export`);
    
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export to CSV
   */
  static async toCSV(
    module: string,
    entity: string,
    userId: string,
    filters?: any,
    branchId?: string
  ): Promise<string> {
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true,
      visible: true
    }).sort('order');

    const columnPerms = await PermissionService.getColumnPermissions(userId, module, entity);
    const visibleFields = fields.filter(f => columnPerms[f.fieldKey]?.view !== false);

    const query: any = {
      module,
      entity,
      isDeleted: false
    };
    
    if (branchId) query.branchId = branchId;
    if (filters) Object.assign(query, filters);

    const records = await RecordModel.find(query)
      .populate('createdBy', 'fullName email')
      .lean();

    const fields_for_csv = [
      'ID',
      'Created By',
      'Created At',
      'Status',
      ...visibleFields.map(f => f.label)
    ];

    const opts = { fields: fields_for_csv };
    const parser = new Parser(opts);

    const exportData = records.map(record => {
      const row: any = {
        'ID': record._id?.toString() || '',
        'Created By': (record.createdBy as any)?.fullName || '',
        'Created At': record.createdAt ? new Date(record.createdAt).toLocaleString() : '',
        'Status': record.status || 'draft'
      };

      visibleFields.forEach(field => {
        let value = '';
        if (record.data && typeof (record.data as any).get === 'function') {
          value = (record.data as Map<string, any>).get(field.fieldKey) || '';
        }
        row[field.label] = value;
      });

      return row;
    });

    return parser.parse(exportData);
  }

  /**
   * Import from Excel/CSV with validation
   */
  static async importFromFile(
    module: string,
    entity: string,
    fileBuffer: Buffer,
    fileType: 'xlsx' | 'csv',
    userId: string,
    branchId?: string
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    let data: any[] = [];

    // Parse file
    if (fileType === 'xlsx') {
      const wb = XLSX.read(fileBuffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(ws);
    } else {
      // Parse CSV
      const csvString = fileBuffer.toString();
      const lines = csvString.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    // Get field definitions
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true
    });

    const fieldMap = new Map(fields.map(f => [f.label, f]));

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const recordData = new Map();

      try {
        // Validate and map fields
        for (const [header, value] of Object.entries(row)) {
          const field = fieldMap.get(header);
          if (!field) continue; // Skip unknown fields

          // Validate based on field type
          if (field.required && !value) {
            throw new Error(`${field.label} is required`);
          }

          let processedValue: any = value;

          // Type conversion
          if (field.type === 'number') {
            processedValue = Number(value);
            if (isNaN(processedValue)) {
              throw new Error(`${field.label} must be a number`);
            }
            if (field.validation?.min !== undefined && processedValue < field.validation.min) {
              throw new Error(`${field.label} must be at least ${field.validation.min}`);
            }
            if (field.validation?.max !== undefined && processedValue > field.validation.max) {
              throw new Error(`${field.label} must be at most ${field.validation.max}`);
            }
          } else if (field.type === 'date') {
            processedValue = new Date(value as string);
            if (isNaN(processedValue.getTime())) {
              throw new Error(`${field.label} must be a valid date`);
            }
          } else if (field.type === 'select' || field.type === 'radio') {
            if (value && field.options && !field.options.includes(value as string)) {
              throw new Error(`${field.label} must be one of: ${field.options.join(', ')}`);
            }
          }

          recordData.set(field.fieldKey, processedValue);
        }

        // Create record
        await RecordModel.create({
          module,
          entity,
          data: recordData,
          version: 1,
          status: 'draft',
          branchId,
          createdBy: userId,
          updatedBy: userId,
          isDeleted: false
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 2, // +2 because Excel is 1-indexed and header row
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Download template for import
   */
  static async downloadTemplate(
    module: string,
    entity: string
  ): Promise<Buffer> {
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true
    }).sort('order');

    // Create template with headers
    const templateData = [{}];
    const headers = fields.map(f => f.label);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData, { header: headers });
    
    // Add instructions
    ws['!comments'] = [
      {
        r: 0,
        c: 0,
        comment: {
          t: 'Required fields: ' + fields.filter(f => f.required).map(f => f.label).join(', '),
          a: 'System'
        }
      }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export default ExportService;