import { Types } from 'mongoose';
import ActivityLogModel, { IActivityLog } from '../models/activity-log.model';

export interface ActivityLogData {
  userId: string | Types.ObjectId;
  module: 're' | 'expense' | 'admin';  // Added 'admin' to fix type error
  entity: string;
  recordId?: string | Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'SUBMIT' | 'APPROVE' | 'REJECT';
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  ipAddress?: string;
  userAgent?: string;
}

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
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date()
      });

      await activityLog.save();

      // Emit real-time update for admin panel
      if (process.env.NODE_ENV !== 'test') {
        try {
          const { io } = await import('../lib/socket/server');
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

      return activityLog;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Get activity logs with filters
   */
  static async getLogs(
    filters: {
      userId?: string | Types.ObjectId;
      module?: string;
      entity?: string;
      action?: string;
      recordId?: string | Types.ObjectId;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const {
      userId,
      module,
      entity,
      action,
      recordId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const query: any = {};

    if (userId) query.userId = userId;
    if (module) query.module = module;
    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (recordId) query.recordId = recordId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLogModel.find(query)
        .populate('userId', 'fullName email profilePhoto')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLogModel.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get activity logs for a specific record
   */
  static async getRecordLogs(recordId: string | Types.ObjectId) {
    return ActivityLogModel.find({ recordId })
      .populate('userId', 'fullName email')
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(userId: string | Types.ObjectId, days: number = 30) {
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
  }

  /**
   * Get module activity statistics
   */
  static async getModuleStats(module: string, days: number = 30) {
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
  }

  /**
   * Get recent activities feed
   */
  static async getRecentActivities(limit: number = 20) {
    return ActivityLogModel.find()
      .populate('userId', 'fullName email profilePhoto')
      .populate('recordId', 'data')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Export activities to CSV
   */
  static async exportToCSV(filters: any = {}) {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    const csvRows = [];
    
    // Headers
    csvRows.push([
      'Timestamp',
      'User',
      'Module',
      'Entity',
      'Action',
      'Record ID',
      'Changes',
      'IP Address'
    ].join(','));

    // Data rows
    for (const log of logs) {
      const changesStr = log.changes
        ? log.changes.map((c: any) => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ')
        : '';

      csvRows.push([
        new Date(log.timestamp).toISOString(),
        `"${(log.userId as any)?.fullName || 'Unknown'}"`,
        log.module,
        log.entity,
        log.action,
        log.recordId || '',
        `"${changesStr}"`,
        log.ipAddress || ''
      ].join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Clean up old logs (archive/delete)
   */
  static async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLogModel.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return {
      deletedCount: result.deletedCount,
      cutoffDate
    };
  }

  /**
   * Get activity heatmap data
   */
  static async getActivityHeatmap(
    module?: string,
    entity?: string,
    months: number = 6
  ) {
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
  }

  /**
   * Get user ranking by activity
   */
  static async getUserRanking(
    module?: string,
    entity?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ) {
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
            $sum: { $cond: [{ $eq: ['$action', 'DELETE'] }, 1, 0] }
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
  }
}

export default ActivityService;