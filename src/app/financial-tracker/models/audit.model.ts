// src/app/financial-tracker/models/audit.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  entityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  changes?: any[];
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditSchema = new Schema<IAudit>({
  entityId: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  changes: [Schema.Types.Mixed],
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);