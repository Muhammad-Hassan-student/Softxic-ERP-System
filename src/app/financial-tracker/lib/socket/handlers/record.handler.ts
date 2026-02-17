import { io } from '../server';
import { IRecord } from '../../../models/record.model';

export class RecordSocketHandler {
  /**
   * Emit record created event
   */
  static emitRecordCreated(module: string, entity: string, record: IRecord) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordCreated', {
      recordId: record._id,
      data: record.data,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      version: record.version,
      status: record.status
    });

    // Also emit to admin room for monitoring
    io.to('admin:activity').emit('activity', {
      type: 'CREATE',
      module,
      entity,
      recordId: record._id,
      timestamp: new Date()
    });
  }

  /**
   * Emit record updated event
   */
  static emitRecordUpdated(
    module: string, 
    entity: string, 
    record: IRecord, 
    changes: any[]
  ) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordUpdated', {
      recordId: record._id,
      data: record.data,
      changes,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt,
      version: record.version,
      status: record.status
    });

    // Emit to admin room
    io.to('admin:activity').emit('activity', {
      type: 'UPDATE',
      module,
      entity,
      recordId: record._id,
      changes,
      timestamp: new Date()
    });
  }

  /**
   * Emit record deleted event
   */
  static emitRecordDeleted(module: string, entity: string, recordId: string) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordDeleted', {
      recordId,
      deletedAt: new Date()
    });

    io.to('admin:activity').emit('activity', {
      type: 'DELETE',
      module,
      entity,
      recordId,
      timestamp: new Date()
    });
  }

  /**
   * Emit record restored event
   */
  static emitRecordRestored(module: string, entity: string, recordId: string) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordRestored', {
      recordId,
      restoredAt: new Date()
    });

    io.to('admin:activity').emit('activity', {
      type: 'RESTORE',
      module,
      entity,
      recordId,
      timestamp: new Date()
    });
  }

  /**
   * Emit record status changed event (for approval workflow)
   */
  static emitStatusChanged(
    module: string,
    entity: string,
    recordId: string,
    oldStatus: string,
    newStatus: string,
    userId: string
  ) {
    const room = `${module}:${entity}`;
    io.to(room).emit('statusChanged', {
      recordId,
      oldStatus,
      newStatus,
      updatedBy: userId,
      timestamp: new Date()
    });

    io.to('admin:activity').emit('activity', {
      type: 'STATUS_CHANGE',
      module,
      entity,
      recordId,
      oldStatus,
      newStatus,
      timestamp: new Date()
    });
  }

  /**
   * Emit version conflict event
   */
  static emitConflict(
    module: string,
    entity: string,
    socketId: string,
    recordId: string,
    latestRecord: any
  ) {
    io.to(socketId).emit('versionConflict', {
      recordId,
      latestRecord,
      message: 'This record was updated by another user. Please refresh.'
    });
  }

  /**
   * Emit bulk operation progress
   */
  static emitBulkProgress(
    module: string,
    entity: string,
    operationId: string,
    processed: number,
    total: number,
    status: 'processing' | 'completed' | 'failed'
  ) {
    const room = `${module}:${entity}`;
    io.to(room).emit('bulkProgress', {
      operationId,
      processed,
      total,
      status,
      progress: Math.round((processed / total) * 100)
    });
  }

  /**
   * Emit notification to specific user
   */
  static emitUserNotification(userId: string, notification: any) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Emit dashboard update
   */
  static emitDashboardUpdate(module: string, data: any) {
    io.to(`dashboard:${module}`).emit('dashboardUpdate', data);
  }
}