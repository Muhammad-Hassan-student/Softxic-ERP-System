// src/app/financial-tracker/models/analytics.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  entityId: mongoose.Types.ObjectId;
  type: 'view' | 'like' | 'comment' | 'share' | 'download';
  userId?: mongoose.Types.ObjectId;
  metadata?: any;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  entityId: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
  type: { type: String, enum: ['view', 'like', 'comment', 'share', 'download'], required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

AnalyticsSchema.index({ entityId: 1, type: 1, timestamp: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);