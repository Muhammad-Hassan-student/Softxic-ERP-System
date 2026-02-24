// src/app/financial-tracker/models/permission-template.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPermissionTemplate extends Document {
  name: string;
  description: string;
  permissions: {
    re: Record<string, any>;
    expense: Record<string, any>;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionTemplateSchema = new Schema<IPermissionTemplate>({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: {
    re: { type: Map, of: Schema.Types.Mixed, default: {} },
    expense: { type: Map, of: Schema.Types.Mixed, default: {} }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export default mongoose.models.PermissionTemplate || 
  mongoose.model<IPermissionTemplate>('PermissionTemplate', PermissionTemplateSchema, 'financial_permission_templates');