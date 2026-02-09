import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'denied' | 'error' | 'security_incident';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userRole: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    index: true,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    index: true,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ['success', 'denied', 'error', 'security_incident'],
    default: 'success',
    index: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });
AuditLogSchema.index({ userRole: 1, createdAt: -1 });

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ userRole: 1, status: 1, createdAt: -1 });

// TTL index for automatic cleanup (keep logs for 90 days for production)
AuditLogSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60 
});

export default mongoose.models.AuditLog || 
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

