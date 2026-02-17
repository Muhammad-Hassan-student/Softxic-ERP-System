import { Types } from 'mongoose';
import RecordModel, { IRecord } from '../models/record.model';
import ApprovalLogModel from '../models/approval-log.model';
import EntityModel from '../models/entity-model';
import PermissionService from './permission-service';
import ActivityService from './activity-service';
import { RecordSocketHandler } from '../lib/socket/handlers/record.handler';

class ApprovalService {
  /**
   * Check if entity has approval workflow enabled
   */
  static async isApprovalEnabled(module: string, entity: string): Promise<boolean> {
    const entityDoc = await EntityModel.findOne({ module, entityKey: entity });
    return entityDoc?.enableApproval || false;
  }

  /**
   * Submit record for approval
   */
  static async submitForApproval(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string
  ): Promise<IRecord> {
    const record = await RecordModel.findById(recordId);
    
    if (!record) {
      throw new Error('Record not found');
    }

    // Only creator can submit
    if (record.createdBy.toString() !== userId.toString()) {
      throw new Error('Only creator can submit for approval');
    }

    // Must be in draft status
    if (record.status !== 'draft') {
      throw new Error(`Cannot submit record in ${record.status} status`);
    }

    // Update status
    record.status = 'submitted';
    record.updatedBy = userId as any;
    await record.save();

    // Log approval action
    await ApprovalLogModel.create({
      recordId: record._id,
      action: 'SUBMIT',
      fromStatus: 'draft',
      toStatus: 'submitted',
      userId
    });

    // Activity log
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId: record._id,
      action: 'SUBMIT',
      changes: [{ field: 'status', oldValue: 'draft', newValue: 'submitted' }]
    });

    // Real-time notification
    RecordSocketHandler.emitRecordUpdated(module, entity, record, [
      { field: 'status', oldValue: 'draft', newValue: 'submitted' }
    ]);

    return record;
  }

  /**
   * Approve record
   */
  static async approve(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string,
    comment?: string
  ): Promise<IRecord> {
    const record = await RecordModel.findById(recordId);
    
    if (!record) {
      throw new Error('Record not found');
    }

    // Check approver permissions
    const canApprove = await PermissionService.canEdit(userId, module, entity, record.createdBy.toString());
    if (!canApprove) {
      throw new Error('Not authorized to approve');
    }

    // Must be in submitted status
    if (record.status !== 'submitted') {
      throw new Error(`Cannot approve record in ${record.status} status`);
    }

    // Update status
    const oldStatus = record.status;
    record.status = 'approved';
    record.updatedBy = userId as any;
    await record.save();

    // Log approval action
    await ApprovalLogModel.create({
      recordId: record._id,
      action: 'APPROVE',
      fromStatus: oldStatus,
      toStatus: 'approved',
      comment,
      userId
    });

    // Activity log
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId: record._id,
      action: 'APPROVE',
      changes: [{ field: 'status', oldValue: oldStatus, newValue: 'approved' }]
    });

    // Real-time notification
    RecordSocketHandler.emitRecordUpdated(module, entity, record, [
      { field: 'status', oldValue: oldStatus, newValue: 'approved' }
    ]);

    return record;
  }

  /**
   * Reject record
   */
  static async reject(
    recordId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    module: 're' | 'expense', // Fixed type
    entity: string,
    comment: string
  ): Promise<IRecord> {
    const record = await RecordModel.findById(recordId);
    
    if (!record) {
      throw new Error('Record not found');
    }

    // Check approver permissions
    const canApprove = await PermissionService.canEdit(userId, module, entity, record.createdBy.toString());
    if (!canApprove) {
      throw new Error('Not authorized to reject');
    }

    // Must be in submitted status
    if (record.status !== 'submitted') {
      throw new Error(`Cannot reject record in ${record.status} status`);
    }

    // Update status
    const oldStatus = record.status;
    record.status = 'rejected';
    record.updatedBy = userId as any;
    await record.save();

    // Log approval action
    await ApprovalLogModel.create({
      recordId: record._id,
      action: 'REJECT',
      fromStatus: oldStatus,
      toStatus: 'rejected',
      comment,
      userId
    });

    // Activity log
    await ActivityService.log({
      userId,
      module,
      entity,
      recordId: record._id,
      action: 'REJECT',
      changes: [{ field: 'status', oldValue: oldStatus, newValue: 'rejected' }]
    });

    // Real-time notification
    RecordSocketHandler.emitRecordUpdated(module, entity, record, [
      { field: 'status', oldValue: oldStatus, newValue: 'rejected' }
    ]);

    return record;
  }

  /**
   * Get approval history for record
   */
  static async getApprovalHistory(recordId: string | Types.ObjectId) {
    return ApprovalLogModel.find({ recordId })
      .sort({ timestamp: -1 })
      .populate('userId', 'fullName email')
      .lean();
  }
}

export default ApprovalService;