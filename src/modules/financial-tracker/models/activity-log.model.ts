import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  module: string;
  entity: string;
  recordId?: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'SUBMIT' | 'APPROVE' | 'REJECT';
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  module: { type: String, required: true, index: true },
  entity: { type: String, required: true, index: true },
  recordId: { type: Schema.Types.ObjectId, index: true },
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'SUBMIT', 'APPROVE', 'REJECT']
  },
  changes: [{
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: false
});

// Compound indexes for filtering
ActivityLogSchema.index({ module: 1, entity: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ recordId: 1, timestamp: -1 });

export default mongoose.models.ActivityLog || 
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema, 'financial_activity_logs');