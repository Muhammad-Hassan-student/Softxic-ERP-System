import { Types } from 'mongoose';
import RecordModel, { IRecord } from '../models/record.model';
import CustomFieldModel from '../models/custom-field.model';
import PermissionService from './permission-service'; // Fixed import path
import ActivityService from './activity-service'; // Fixed import
import ConcurrencyService from './concurrency.service';
import FieldService from './field-service'; // Fixed import

class RecordService {
  /**
   * Create new record
   */
  static async createRecord(
    module: 're' | 'expense', // Fixed type
    entity: string,
    data: Map<string, any>,
    userId: string | Types.ObjectId,
    branchId?: string
  ): Promise<IRecord> {
    // Validate fields
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true
    });

    const errors: string[] = [];
    for (const field of fields) {
      const validation = FieldService.validateFieldValue(
        field,
        data.get(field.fieldKey)
      );
      if (!validation.valid) {
        errors.push(validation.error!);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Create record with version 1
    const record = await ConcurrencyService.createWithLock(
      data,
      module,
      entity,
      userId,
      branchId
    );

    // Log activity - Fixed to include oldValue
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId: record._id,
      action: 'CREATE',
      changes: [{ 
        field: 'data', 
        oldValue: null,
        newValue: Object.fromEntries(data) // Convert Map to object
      }]
    });

    return record;
  }

  /**
   * Get records with pagination
   */
  static async getRecords(
    module: 're' | 'expense', // Fixed type
    entity: string,
    options: {
      page?: number;
      limit?: number;
      includeDeleted?: boolean;
      filters?: Record<string, any>;
      userId?: string | Types.ObjectId;
      scope?: 'own' | 'all' | 'department';
      branchId?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 50,
      includeDeleted = false,
      filters = {},
      userId,
      scope = 'all',
      branchId
    } = options;

    const query: any = {
      module,
      entity,
      ...filters
    };

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    if (branchId) {
      query.branchId = branchId;
    }

    // Apply scope
    if (scope === 'own' && userId) {
      query.createdBy = userId;
    } else if (scope === 'department' && userId) {
      // Get user's department from User model
      const User = (await import('@/models/User')).default;
      const user = await User.findById(userId);
      if (user?.department) {
        // This would need a department field on records
        query.department = user.department;
      }
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      RecordModel.find(query)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RecordModel.countDocuments(query)
    ]);

    return {
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get single record
   */
  static async getRecord(
    recordId: string | Types.ObjectId,
    includeDeleted: boolean = false
  ) {
    const query: any = { _id: recordId };
    if (!includeDeleted) {
      query.isDeleted = false;
    }

    return RecordModel.findOne(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .populate('deletedBy', 'fullName email')
      .lean();
  }

  /**
   * Update record with concurrency control
   */
  static async updateRecord(
    recordId: string | Types.ObjectId,
    data: Map<string, any>,
    version: number,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string,
    socketId?: string
  ): Promise<IRecord> {
    const record = await RecordModel.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    // Validate fields
    const fields = await CustomFieldModel.find({
      module,
      entityId: entity,
      isEnabled: true
    });

    const errors: string[] = [];
    for (const field of fields) {
      const validation = FieldService.validateFieldValue(
        field,
        data.get(field.fieldKey)
      );
      if (!validation.valid) {
        errors.push(validation.error!);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Calculate changes for logging
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    for (const [key, value] of data) {
      if (JSON.stringify(record.data.get(key)) !== JSON.stringify(value)) {
        changes.push({
          field: key,
          oldValue: record.data.get(key),
          newValue: value
        });
      }
    }

    // Update with concurrency control
    const updatedRecord = await ConcurrencyService.updateWithLock(
      recordId,
      { data },
      version,
      userId,
      module,
      entity,
      socketId
    );

    // Log activity
    if (changes.length > 0) {
      await ActivityService.log({
        userId,
        module,
        entity,
        recordId,
        action: 'UPDATE',
        changes
      });
    }

    return updatedRecord;
  }

  /**
   * Soft delete record
   */
  static async deleteRecord(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string
  ) {
    const record = await RecordModel.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    record.isDeleted = true;
    record.deletedAt = new Date();
    record.deletedBy = userId as any;
    record.updatedBy = userId as any;
    await record.save();

    // Log activity - Fixed to include both old/new
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId,
      action: 'DELETE',
      changes: [{ 
        field: 'isDeleted', 
        oldValue: false,
        newValue: true 
      }]
    });

    return record;
  }

  /**
   * Restore soft-deleted record
   */
  static async restoreRecord(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string
  ) {
    const record = await RecordModel.findById(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    record.isDeleted = false;
    record.deletedAt = undefined;
    record.deletedBy = undefined;
    record.updatedBy = userId as any;
    await record.save();

    // Log activity
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId,
      action: 'RESTORE',
      changes: [{ 
        field: 'isDeleted', 
        oldValue: true,
        newValue: false 
      }]
    });

    return record;
  }

  /**
   * Bulk create records
   */
  static async bulkCreate(
    records: Array<{ data: Map<string, any> }>,
    module: 're' | 'expense', // Fixed type
    entity: string,
    userId: string | Types.ObjectId,
    branchId?: string
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; error: string }>
    };

    for (let i = 0; i < records.length; i++) {
      try {
        await this.createRecord(
          module,
          entity,
          records[i].data,
          userId,
          branchId
        );
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Search records
   */
  static async searchRecords(
    module: 're' | 'expense', // Fixed type
    entity: string,
    searchTerm: string,
    fields: string[],
    options: {
      page?: number;
      limit?: number;
      userId?: string | Types.ObjectId;
      branchId?: string;
    } = {}
  ) {
    const { page = 1, limit = 50, userId, branchId } = options;

    const query: any = {
      module,
      entity,
      isDeleted: false
    };

    if (branchId) {
      query.branchId = branchId;
    }

    if (userId) {
      query.createdBy = userId;
    }

    // Build text search
    const searchConditions = fields.map(field => ({
      [`data.${field}`]: { $regex: searchTerm, $options: 'i' }
    }));

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      RecordModel.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RecordModel.countDocuments(query)
    ]);

    return {
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default RecordService;