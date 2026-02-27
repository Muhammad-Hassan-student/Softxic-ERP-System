// src/app/financial-tracker/services/record-service.ts
import { Types } from 'mongoose';
import RecordModel, { IRecord } from '../models/record.model';
import CustomFieldModel from '../models/custom-field.model';
import PermissionService from './permission-service';
import ActivityService from './activity-service';
import ConcurrencyService from './concurrency.service';
import FieldService from './field-service';
import RedisCache from '@/app/financial-tracker/lib/cache/redis';  // ✅ Default import
import logger from '@/app/financial-tracker/lib/logger';  // ✅ Fixed import path

// ==================== TYPES ====================
export interface GetRecordsOptions {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
  filters?: Record<string, any>;
  userId?: string | Types.ObjectId;
  scope?: 'own' | 'all' | 'department';
  branchId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  status?: string[];
  search?: string;
}

export interface BulkCreateResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string; data?: any }>;
  createdIds?: string[];
}

export interface RecordStats {
  total: number;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
  byDate: Array<{ date: string; count: number }>;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  recentActivity: number;
}

// ==================== CACHE KEYS ====================
const CACHE_TTL = 300; // 5 minutes

// ==================== MAIN SERVICE ====================
class RecordService {
  /**
   * Create new record with validation and activity logging
   */
  static async createRecord(
    module: 're' | 'expense',
    entity: string,
    data: Map<string, any>,
    userId: string | Types.ObjectId,
    branchId?: string
  ): Promise<IRecord> {
    const startTime = Date.now();
    
    try {
      // Validate required parameters
      if (!module || !entity || !data) {
        throw new Error('Module, entity, and data are required');
      }

      // Get all enabled fields for this entity
      const fields = await CustomFieldModel.find({
        module,
        entityId: entity,
        isEnabled: true
      }).lean();

      // Validate each field
      const errors: string[] = [];
      const validatedData = new Map<string, any>();

      for (const field of fields) {
        const value = data.get(field.fieldKey);
        
        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field.label} (${field.fieldKey}) is required`);
          continue;
        }

        // Validate field value
        const validation = FieldService.validateFieldValue(field, value);
        if (!validation.valid) {
          errors.push(validation.error || `Invalid value for ${field.label}`);
          continue;
        }

        // Apply default value if needed
        if ((value === undefined || value === null) && field.defaultValue !== undefined) {
          validatedData.set(field.fieldKey, field.defaultValue);
        } else {
          validatedData.set(field.fieldKey, value);
        }
      }

      // Check for extra fields not in schema
      for (const [key] of data) {
        if (!fields.some(f => f.fieldKey === key)) {
          errors.push(`Unknown field: ${key}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join('; ')}`);
      }

      // Create record with concurrency control
      const record = await ConcurrencyService.createWithLock(
        validatedData,
        module,
        entity,
        userId,
        branchId
      );

      // Log activity with proper typing
      await ActivityService.log({
        userId: userId.toString(),
        module,
        entity,
        recordId: record._id,
        action: 'CREATE',
        changes: [{
          field: 'record',
          oldValue: null,
          newValue: {
            id: record._id,
            data: Object.fromEntries(validatedData)
          }
        }],
        metadata: {
          module,
          entity,
          branchId
        }
      });

      // Invalidate caches
      await this.invalidateCaches(module, entity);

      logger.info('Record created', {
        recordId: record._id,
        module,
        entity,
        userId,
        duration: Date.now() - startTime
      });

      return record;

    } catch (error) {
      logger.error('Error creating record:', { error, module, entity, userId });
      throw error;
    }
  }

  /**
   * Get records with advanced filtering and pagination
   */
  static async getRecords(
    module: 're' | 'expense',
    entity: string,
    options: GetRecordsOptions = {}
  ) {
    const startTime = Date.now();
    
    try {
      const {
        page = 1,
        limit = 50,
        includeDeleted = false,
        filters = {},
        userId,
        scope = 'all',
        branchId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate,
        minAmount,
        maxAmount,
        tags,
        status,
        search
      } = options;

      // Build base query
      const query: any = {
        module,
        entity,
        ...filters
      };

      // Soft delete filter
      if (!includeDeleted) {
        query.isDeleted = { $ne: true };
      }

      // Branch filter
      if (branchId) {
        query.branchId = branchId;
      }

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      // Amount range filter
      if (minAmount !== undefined || maxAmount !== undefined) {
        query['data.amount'] = {};
        if (minAmount !== undefined) query['data.amount'].$gte = minAmount;
        if (maxAmount !== undefined) query['data.amount'].$lte = maxAmount;
      }

      // Tags filter
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      // Status filter
      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Apply scope-based filtering
      await this.applyScopeFilter(query, scope, userId);

      // Build sort
      const sort: any = {};
      if (sortBy === 'amount') {
        sort['data.amount'] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      const skip = (page - 1) * limit;

      // Execute queries in parallel for performance
      const [records, total] = await Promise.all([
        RecordModel.find(query)
          .populate('createdBy', 'fullName email avatar')
          .populate('updatedBy', 'fullName email')
          .populate('deletedBy', 'fullName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        RecordModel.countDocuments(query).exec()
      ]);

      // Transform records for frontend
      const transformedRecords = records.map(record => ({
        ...record,
        data: record.data ? Object.fromEntries(record.data) : {},
        id: record._id
      }));

      logger.debug('Records fetched', {
        module,
        entity,
        count: records.length,
        total,
        duration: Date.now() - startTime
      });

      return {
        records: transformedRecords,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      };

    } catch (error) {
      logger.error('Error fetching records:', { error, module, entity });
      throw error;
    }
  }

  /**
   * Get single record by ID
   */
  static async getRecord(
    recordId: string | Types.ObjectId,
    includeDeleted: boolean = false
  ) {
    try {
      const query: any = { _id: recordId };
      if (!includeDeleted) {
        query.isDeleted = { $ne: true };
      }

      const record = await RecordModel.findOne(query)
        .populate('createdBy', 'fullName email avatar')
        .populate('updatedBy', 'fullName email')
        .populate('deletedBy', 'fullName email')
        .lean()
        .exec();

      if (!record) {
        return null;
      }

      return {
        ...record,
        data: record.data ? Object.fromEntries(record.data) : {},
        id: record._id
      };

    } catch (error) {
      logger.error('Error fetching record:', { error, recordId });
      throw error;
    }
  }

  /**
   * Update record with concurrency control
   */
  static async updateRecord(
    recordId: string | Types.ObjectId,
    data: Map<string, any>,
    version: number,
    userId: string | Types.ObjectId,
    module: 're' | 'expense',
    entity: string,
    socketId?: string
  ): Promise<IRecord> {
    const startTime = Date.now();
    
    try {
      // Get existing record
      const record = await RecordModel.findById(recordId);
      if (!record) {
        throw new Error('Record not found');
      }

      // Check if deleted
      if (record.isDeleted) {
        throw new Error('Cannot update deleted record');
      }

      // Get fields for validation
      const fields = await CustomFieldModel.find({
        module,
        entityId: entity,
        isEnabled: true
      }).lean();

      // Validate fields
      const errors: string[] = [];
      const validatedData = new Map<string, any>();

      for (const field of fields) {
        const value = data.get(field.fieldKey);
        
        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field.label} (${field.fieldKey}) is required`);
          continue;
        }

        // Validate field value
        const validation = FieldService.validateFieldValue(field, value);
        if (!validation.valid) {
          errors.push(validation.error || `Invalid value for ${field.label}`);
          continue;
        }

        validatedData.set(field.fieldKey, value);
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join('; ')}`);
      }

      // Calculate changes for logging
      const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
      for (const [key, value] of validatedData) {
        const oldValue = record.data.get(key);
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          changes.push({
            field: key,
            oldValue,
            newValue: value
          });
        }
      }

      // Check for removed fields
      for (const [key] of record.data) {
        if (!validatedData.has(key) && fields.some(f => f.fieldKey === key)) {
          changes.push({
            field: key,
            oldValue: record.data.get(key),
            newValue: undefined
          });
        }
      }

      if (changes.length === 0) {
        return record; // No changes
      }

      // Update with concurrency control
      const updatedRecord = await ConcurrencyService.updateWithLock(
        recordId,
        { data: validatedData },
        version,
        userId,
        module,
        entity,
        socketId
      );

      // Log activity
      await ActivityService.log({
        userId: userId.toString(),
        module,
        entity,
        recordId,
        action: 'UPDATE',
        changes,
        metadata: {
          version: version + 1,
          socketId
        }
      });

      // Invalidate caches
      await this.invalidateCaches(module, entity, recordId.toString());

      logger.info('Record updated', {
        recordId,
        module,
        entity,
        changes: changes.length,
        duration: Date.now() - startTime
      });

      return updatedRecord;

    } catch (error) {
      logger.error('Error updating record:', { error, recordId, module, entity });
      throw error;
    }
  }

  /**
   * Soft delete record
   */
  static async deleteRecord(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense',
    entity: string,
    permanent: boolean = false
  ) {
    const startTime = Date.now();
    
    try {
      const record = await RecordModel.findById(recordId);
      if (!record) {
        throw new Error('Record not found');
      }

      if (permanent) {
        // Permanent delete
        await RecordModel.deleteOne({ _id: recordId });
        
        await ActivityService.log({
          userId: userId.toString(),
          module,
          entity,
          recordId,
          action: 'DELETE_PERMANENT',
          changes: [{
            field: 'record',
            oldValue: { id: recordId, data: Object.fromEntries(record.data) },
            newValue: null
          }]
        });

        logger.info('Record permanently deleted', { recordId, module, entity });

      } else {
        // Soft delete
        record.isDeleted = true;
        record.deletedAt = new Date();
        record.deletedBy = userId as any;
        record.updatedBy = userId as any;
        await record.save();

        await ActivityService.log({
          userId: userId.toString(),
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

        logger.info('Record soft deleted', { recordId, module, entity });
      }

      // Invalidate caches
      await this.invalidateCaches(module, entity, recordId.toString());

      return { success: true, permanent };

    } catch (error) {
      logger.error('Error deleting record:', { error, recordId, module, entity });
      throw error;
    }
  }

  /**
   * Restore soft-deleted record
   */
  static async restoreRecord(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense',
    entity: string
  ) {
    try {
      const record = await RecordModel.findById(recordId);
      if (!record) {
        throw new Error('Record not found');
      }

      if (!record.isDeleted) {
        throw new Error('Record is not deleted');
      }

      record.isDeleted = false;
      record.deletedAt = undefined;
      record.deletedBy = undefined;
      record.updatedBy = userId as any;
      await record.save();

      await ActivityService.log({
        userId: userId.toString(),
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

      // Invalidate caches
      await this.invalidateCaches(module, entity, recordId.toString());

      logger.info('Record restored', { recordId, module, entity });

      return record;

    } catch (error) {
      logger.error('Error restoring record:', { error, recordId, module, entity });
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  static async bulkCreate(
    records: Array<{ data: Map<string, any> }>,
    module: 're' | 'expense',
    entity: string,
    userId: string | Types.ObjectId,
    branchId?: string
  ): Promise<BulkCreateResult> {
    const results: BulkCreateResult = {
      success: 0,
      failed: 0,
      errors: [],
      createdIds: []
    };

    const createdIds: string[] = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const record = await this.createRecord(
          module,
          entity,
          records[i].data,
          userId,
          branchId
        );
        results.success++;
        createdIds.push(record._id.toString());
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          error: error.message,
          data: Object.fromEntries(records[i].data)
        });
      }
    }

    results.createdIds = createdIds;

    // Log bulk operation
    await ActivityService.log({
      userId: userId.toString(),
      module,
      entity,
      action: 'BULK_CREATE',
      changes: [{
        field: 'bulk',
        oldValue: null,
        newValue: {
          total: records.length,
          success: results.success,
          failed: results.failed,
          ids: createdIds
        }
      }]
    });

    // Invalidate caches
    await this.invalidateCaches(module, entity);

    logger.info('Bulk create completed', {
      module,
      entity,
      total: records.length,
      success: results.success,
      failed: results.failed
    });

    return results;
  }


  /**
   * Search records across fields
   */
  static async searchRecords(
    module: 're' | 'expense',
    entity: string,
    searchTerm: string,
    fields: string[],
    options: {
      page?: number;
      limit?: number;
      userId?: string | Types.ObjectId;
      branchId?: string;
      includeDeleted?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 50, userId, branchId, includeDeleted = false } = options;

    const query: any = {
      module,
      entity
    };

    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    if (branchId) {
      query.branchId = branchId;
    }

    if (userId) {
      query.createdBy = userId;
    }

    const searchConditions: any[] = [];

    // Add text search conditions for each field
    fields.forEach(field => {
      searchConditions.push({
        [`data.${field}`]: { $regex: searchTerm, $options: 'i' }
      });
    });

    // Handle _id search separately with proper typing
    if (Types.ObjectId.isValid(searchTerm)) {
      searchConditions.push({ 
        _id: new Types.ObjectId(searchTerm)
      });
    }

    // Add to query if we have any conditions
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
        .lean()
        .exec(),
      RecordModel.countDocuments(query).exec()
    ]);

    const transformedRecords = records.map(record => ({
      ...record,
      data: record.data ? Object.fromEntries(record.data) : {},
      id: record._id
    }));

    return {
      records: transformedRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    };
  }

  /**
   * Get record statistics
   */
  static async getStats(
    module: 're' | 'expense',
    entity: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RecordStats> {
    const match: any = {
      module,
      entity,
      isDeleted: { $ne: true }
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const [stats] = await RecordModel.aggregate([
      { $match: match },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
          ],
          byModule: [
            { $group: { _id: '$module', count: { $sum: 1 } } },
            { $project: { module: '$_id', count: 1, _id: 0 } }
          ],
          byDate: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
          ],
          amounts: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: { $ifNull: ['$data.amount', 0] } },
                avgAmount: { $avg: { $ifNull: ['$data.amount', 0] } },
                minAmount: { $min: { $ifNull: ['$data.amount', 0] } },
                maxAmount: { $max: { $ifNull: ['$data.amount', 0] } }
              }
            }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ]);

    const byStatus: Record<string, number> = {};
    stats.byStatus.forEach((item: any) => {
      byStatus[item.status] = item.count;
    });

    const byModule: Record<string, number> = {};
    stats.byModule.forEach((item: any) => {
      byModule[item.module] = item.count;
    });

    const byDate = stats.byDate.map((item: any) => ({
      date: item._id,
      count: item.count
    }));

    const amounts = stats.amounts[0] || {
      totalAmount: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };

    // Get recent activity count
    const recentActivity = await RecordModel.countDocuments({
      ...match,
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      total: stats.total[0]?.count || 0,
      byStatus,
      byModule,
      byDate,
      totalAmount: amounts.totalAmount,
      avgAmount: amounts.avgAmount,
      minAmount: amounts.minAmount,
      maxAmount: amounts.maxAmount,
      recentActivity
    };
  }

  /**
   * Apply scope-based filtering
   */
  private static async applyScopeFilter(
    query: any,
    scope: 'own' | 'all' | 'department',
    userId?: string | Types.ObjectId
  ) {
    if (scope === 'own' && userId) {
      query.createdBy = userId;
    } else if (scope === 'department' && userId) {
      // Get user's department
      const User = (await import('@/models/User')).default;
      const user = await User.findById(userId).select('department').lean();
      if (user?.department) {
        query.department = user.department;
      }
    }
  }

  /**
   * Invalidate caches
   */
  private static async invalidateCaches(
    module: string,
    entity: string,
    recordId?: string
  ) {
    try {
      // ✅ Use RedisCache static methods directly
      await RedisCache.delPattern(`records:${module}:${entity}:*`);
      await RedisCache.del(RedisCache.analyticsKey(module, entity, 'day'));
      await RedisCache.del(RedisCache.analyticsKey(module, entity, 'week'));
      await RedisCache.del(RedisCache.analyticsKey(module, entity, 'month'));
      
      // Invalidate specific record cache
      if (recordId) {
        await RedisCache.del(RedisCache.recordKey(recordId));
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      // Don't throw - cache invalidation shouldn't break the main flow
    }
  }

  /**
   * Get record with caching
   */
  static async getRecordCached(
    recordId: string | Types.ObjectId,
    includeDeleted: boolean = false
  ) {
    const cacheKey = RedisCache.recordKey(recordId.toString());

    // Try cache first
    const cached = await RedisCache.get<any>(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { cacheKey });
      return cached;
    }

    logger.debug('Cache miss', { cacheKey });

    // Get from database
    const record = await this.getRecord(recordId, includeDeleted);
    
    if (record) {
      await RedisCache.set(cacheKey, record, 300);  // 5 minutes TTL
    }

    return record;
  }

  /**
   * Get records with caching
   */
  static async getRecordsCached(
    module: 're' | 'expense',
    entity: string,
    options: GetRecordsOptions = {}
  ) {
    const { page = 1 } = options;
    const cacheKey = RedisCache.recordsKey(module, entity, page);

    // Try cache first
    const cached = await RedisCache.get<any>(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { cacheKey });
      return cached;
    }

    logger.debug('Cache miss', { cacheKey });

    // Get from database
    const result = await this.getRecords(module, entity, options);
    
    // Cache with TTL
    await RedisCache.set(cacheKey, result, 300);  // 5 minutes TTL

    return result;
  }

  /**
   * Cache multiple records at once
   */
  static async cacheMultipleRecords(records: any[]) {
    const keyValuePairs: Record<string, any> = {};
    
    records.forEach(record => {
      keyValuePairs[RedisCache.recordKey(record._id)] = record;
    });
    
    // Set all records in cache with 5 minute TTL
    await RedisCache.mset(keyValuePairs, 300);
  }

  /**
   * Get multiple records from cache
   */
  static async getMultipleRecords(recordIds: string[]) {
    const keys = recordIds.map(id => RedisCache.recordKey(id));
    const records = await RedisCache.mget<any>(keys);
    return records.filter(r => r !== null);
  }

  /**
   * Clear all cache for testing/maintenance
   */
  static async clearAllCache() {
    await RedisCache.flush();
    logger.info('All cache cleared');
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    return await RedisCache.getStats();
  }
}

export default RecordService;