// src/app/financial-tracker/models/version.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IVersion extends Document {
  entityId: mongoose.Types.ObjectId;
  number: number;
  data: any;
  changes: any[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VersionSchema = new Schema<IVersion>({
  entityId: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
  number: { type: Number, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  changes: [Schema.Types.Mixed],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

VersionSchema.index({ entityId: 1, number: -1 });

export default mongoose.models.Version || mongoose.model<IVersion>('Version', VersionSchema);