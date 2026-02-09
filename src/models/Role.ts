// lib/db/schemas/role.ts - ENHANCED
import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissionCodes: string[]; // Reference to permission codes
  isDefault: boolean;
  isActive: boolean;
  analyticsPermissions: string[]; // Separate analytics permissions
  dataAccessLevel: 'self' | 'department' | 'all';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Role name is required"],
    unique: true,
    trim: true,
    enum: ["admin", "hr", "employee", "accounts", "support", "sales", "finance"],
  },
  description: {
    type: String,
    trim: true,
  },
  permissionCodes: [{
    type: String,
    index: true,
  }],
  analyticsPermissions: [{
    type: String,
    index: true,
  }],
  dataAccessLevel: {
    type: String,
    enum: ['self', 'department', 'all'],
    default: 'self',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.models.Role || 
  mongoose.model<IRole>("Role", RoleSchema);