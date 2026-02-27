// src/app/financial-tracker/services/activity-service.ts
import { Types } from 'mongoose';
import ActivityLogModel, { IActivityLog } from '../models/activity-log.model';

// ==================== TYPES ====================
export type ActivityAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'DELETE_PERMANENT' 
  | 'RESTORE' 
  | 'SUBMIT' 
  | 'APPROVE' 
  | 'REJECT'
  | 'BULK_CREATE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT';

export type ActivityModule = 're' | 'expense' | 'admin' | 'auth' | 'system';

export interface ActivityLogData {
  userId: string | Types.ObjectId;
  module: ActivityModule;
  entity: string;
  recordId?: string | Types.ObjectId;
  action: ActivityAction;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;  // Make timestamp optional
}

export interface ActivityFilters {
  userId?: string | Types.ObjectId;
  module?: ActivityModule;
  entity?: string;
  action?: ActivityAction;
  recordId?: string | Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivitySummary {
  action: string;
  module: string;
  daily: Array<{ date: string; count: number }>;
  total: number;
}

export interface UserRanking {
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  userDepartment?: string;
  totalActivities: number;
  creates: number;
  updates: number;
  deletes: number;
  lastActive: Date;
}

// ==================== MAIN SERVICE ====================
class ActivityService {
  /**
   * Log an activity
   */
  static async log(data: ActivityLogData): Promise<IActivityLog> {
    try {
      const activityLog = new ActivityLogModel({
        userId: data.userId,
        module: data.module,
        entity: data.entity,
        recordId: data.recordId,
        action: data.action,
        changes: data.changes || [],
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: data.timestamp || new Date()
      });

      await activityLog.save();

      // Emit real-time update for admin panel (non-blocking)
      this.emitSocketEvent(activityLog).catch(() => {});

      return activityLog;
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
      // Don't throw - activity logging shouldn't break the main flow
      return null as any;
    }
  }

  /**
   * Emit socket event for real-time updates
   */
  private static async emitSocketEvent(activityLog: IActivityLog) {
    if (process.env.NODE_ENV === 'test') return;
    
    try {
      const { io } = await import('../lib/socket/server').catch(() => ({ io: null }));
      if (io) {
        io.to('admin:activity').emit('newActivity', {
          id: activityLog._id,
          userId: activityLog.userId,
          module: activityLog.module,
          entity: activityLog.entity,
          action: activityLog.action,
          timestamp: activityLog.timestamp
        });
      }
    } catch (error) {
      // Socket not initialized, ignore
    }
  }

  /**
   * Get activity logs with filters
   */
  static async getLogs(filters: ActivityFilters = {}) {
    try {
      const {
        userId,
        module,
        entity,
        action,
        recordId,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50
      } = filters;

      const query: any = {};

      if (userId) query.userId = userId;
      if (module) query.module = module;
      if (entity) query.entity = entity;
      if (action) query.action = action;
      if (recordId) query.recordId = recordId;

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
      }

      // Text search
      if (search) {
        query.$or = [
          { 'metadata.message': { $regex: search, $options: 'i' } },
          { entity: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        ActivityLogModel.find(query)
          .populate('userId', 'fullName email profilePhoto')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        ActivityLogModel.countDocuments(query).exec()
      ]);

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      };

    } catch (error) {
      console.error('❌ Error fetching activity logs:', error);
      throw error;
    }
  }

  /**
   * Get activity logs for a specific record
   */
  static async getRecordLogs(recordId: string | Types.ObjectId) {
    try {
      return ActivityLogModel.find({ recordId })
        .populate('userId', 'fullName email')
        .sort({ timestamp: -1 })
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error fetching record logs:', error);
      throw error;
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(
    userId: string | Types.ObjectId, 
    days: number = 30
  ): Promise<ActivitySummary[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const summary = await ActivityLogModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId.toString()),
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              action: '$action',
              module: '$module',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              action: '$_id.action',
              module: '$_id.module'
            },
            daily: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        },
        {
          $project: {
            _id: 0,
            action: '$_id.action',
            module: '$_id.module',
            daily: 1,
            total: 1
          }
        },
        { $sort: { module: 1, action: 1 } }
      ]);

      return summary;
    } catch (error) {
      console.error('❌ Error getting user activity summary:', error);
      throw error;
    }
  }

  /**
   * Get module activity statistics
   */
  static async getModuleStats(module: ActivityModule, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await ActivityLogModel.aggregate([
        {
          $match: {
            module,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              entity: '$entity',
              action: '$action',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              entity: '$_id.entity',
              action: '$_id.action'
            },
            daily: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        },
        {
          $group: {
            _id: '$_id.entity',
            actions: {
              $push: {
                action: '$_id.action',
                daily: '$daily',
                total: '$total'
              }
            },
            totalActivities: { $sum: '$total' }
          }
        },
        {
          $project: {
            _id: 0,
            entity: '$_id',
            actions: 1,
            totalActivities: 1
          }
        },
        { $sort: { entity: 1 } }
      ]);

      return stats;
    } catch (error) {
      console.error('❌ Error getting module stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activities feed
   */
  static async getRecentActivities(limit: number = 20) {
    try {
      return ActivityLogModel.find()
        .populate('userId', 'fullName email profilePhoto')
        .populate('recordId', 'data')
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
        .exec();
    } catch (error) {
      console.error('❌ Error getting recent activities:', error);
      throw error;
    }
  }


/**
 * Export activities to CSV
 */
static async exportToCSV(filters: ActivityFilters = {}): Promise<string> {
  try {
    // Get logs with larger limit for export
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    const csvRows: string[] = [];
    
    // Headers
    csvRows.push([
      'Timestamp',
      'User',
      'Module',
      'Entity',
      'Action',
      'Record ID',
      'Changes',
      'IP Address',
      'User Agent',
      'Metadata'
    ].join(','));

    // Data rows
    for (const log of logs) {
      // Format changes as string
      const changesStr = log.changes && log.changes.length > 0
        ? log.changes.map((c: any) => 
            `${c.field}: ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)}`
          ).join('; ')
        : '';

      // Format metadata as JSON string
      const metadataStr = log.metadata 
        ? JSON.stringify(log.metadata).replace(/"/g, '""')
        : '';

      // Escape fields that might contain commas
      const row = [
        `"${new Date(log.timestamp).toISOString()}"`,
        `"${(log.userId as any)?.fullName || 'Unknown'}"`,
        `"${log.module}"`,
        `"${log.entity || ''}"`,
        `"${log.action}"`,
        `"${log.recordId || ''}"`,
        `"${changesStr.replace(/"/g, '""')}"`,
        `"${log.ipAddress || ''}"`,
        `"${log.userAgent || ''}"`,
        `"${metadataStr}"`
      ].join(',');

      csvRows.push(row);
    }

    return csvRows.join('\n');
  } catch (error) {
    console.error('❌ Error exporting to CSV:', error);
    throw new Error('Failed to export activities to CSV');
  }
}

  /**
   * Clean up old logs (archive/delete)
   */
  static async cleanupOldLogs(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await ActivityLogModel.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return {
        deletedCount: result.deletedCount,
        cutoffDate
      };
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
      throw error;
    }
  }

  /**
   * Get activity heatmap data
   */
  static async getActivityHeatmap(
    module?: ActivityModule,
    entity?: string,
    months: number = 6
  ) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const match: any = {
        timestamp: { $gte: startDate }
      };
      if (module) match.module = module;
      if (entity) match.entity = entity;

      const heatmap = await ActivityLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            hour: '$_id.hour',
            count: 1
          }
        },
        { $sort: { date: 1, hour: 1 } }
      ]);

      return heatmap;
    } catch (error) {
      console.error('❌ Error getting activity heatmap:', error);
      throw error;
    }
  }

  /**
   * Get user ranking by activity
   */
  static async getUserRanking(
    module?: ActivityModule,
    entity?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<UserRanking[]> {
    try {
      const match: any = {};
      if (module) match.module = module;
      if (entity) match.entity = entity;
      if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
      }

      const ranking = await ActivityLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$userId',
            totalActivities: { $sum: 1 },
            creates: {
              $sum: { $cond: [{ $eq: ['$action', 'CREATE'] }, 1, 0] }
            },
            updates: {
              $sum: { $cond: [{ $eq: ['$action', 'UPDATE'] }, 1, 0] }
            },
            deletes: {
              $sum: { 
                $cond: [{ 
                  $in: ['$action', ['DELETE', 'DELETE_PERMANENT']] 
                }, 1, 0] 
              }
            },
            lastActive: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userName: '$user.fullName',
            userEmail: '$user.email',
            userRole: '$user.role',
            userDepartment: '$user.department',
            totalActivities: 1,
            creates: 1,
            updates: 1,
            deletes: 1,
            lastActive: 1
          }
        },
        { $sort: { totalActivities: -1 } },
        { $limit: limit }
      ]);

      return ranking;
    } catch (error) {
      console.error('❌ Error getting user ranking:', error);
      throw error;
    }
  }

  /**
   * Get activity timeline for a specific period
   */
  static async getTimeline(
    module?: ActivityModule,
    entity?: string,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
    days: number = 30
  ) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const match: any = {
        timestamp: { $gte: startDate }
      };
      if (module) match.module = module;
      if (entity) match.entity = entity;

      let groupId: any;
      switch (interval) {
        case 'hour':
          groupId = {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' }
          };
          break;
        case 'day':
          groupId = {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          };
          break;
        case 'week':
          groupId = {
            year: { $year: '$timestamp' },
            week: { $week: '$timestamp' }
          };
          break;
        case 'month':
          groupId = {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          };
          break;
      }

      const timeline = await ActivityLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: groupId,
            count: { $sum: 1 },
            actions: { $addToSet: '$action' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ]);

      return timeline;
    } catch (error) {
      console.error('❌ Error getting timeline:', error);
      throw error;
    }
  }
}

export default ActivityService;