import mongoose, { Schema, Document } from 'mongoose';

export interface IModuleUser extends Document {
  fullName: string;
  email: string;
  mobile?: string;
  password: string;
  module: 're' | 'expense';
  entities: string[];
  permissions: {
    [entity: string]: {
      access: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      scope: 'own' | 'all';
    }
  };
  isActive: boolean;
  lastLogin?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleUserSchema = new Schema<IModuleUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: String,
  password: { type: String, required: true, select: false },
  module: { type: String, enum: ['re', 'expense'], required: true },
  entities: [{ type: String }],
  permissions: { type: Map, of: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

ModuleUserSchema.index({ email: 1 });
ModuleUserSchema.index({ module: 1 });

export default mongoose.models.ModuleUser || 
  mongoose.model<IModuleUser>('ModuleUser', ModuleUserSchema, 'module_users');