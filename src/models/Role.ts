import mongoose, { Schema, Document, HydratedDocument } from 'mongoose';

export interface IPermission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: IPermission[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type RoleDocument = HydratedDocument<IRole>



const PermissionSchema: Schema = new Schema({
  module: {
    type: String,
    required: true,
    enum: [
      'dashboard', 'employees', 'payments', 'inventory', 'vendors',
      'reports', 'users', 'roles', 'settings', 'tax', 'invoices'
    ],
  },
  create: { type: Boolean, default: false },
  read: { type: Boolean, default: true },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
});

const RoleSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    enum: ['admin', 'hr', 'employee', 'accounts', 'support', 'marketing'],
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [PermissionSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Default roles with permissions
RoleSchema.pre('save', async function (this: RoleDocument) {
  if (!this.isNew) return;

  const defaultPermissions: Record<string, IPermission[]> = {
    admin: [
      { module: 'dashboard', create: true, read: true, update: true, delete: true },
      { module: 'employees', create: true, read: true, update: true, delete: true },
      { module: 'payments', create: true, read: true, update: true, delete: true },
      { module: 'users', create: true, read: true, update: true, delete: true },
      { module: 'roles', create: true, read: true, update: true, delete: true },
    ],
    hr: [
      { module: 'dashboard', create: false, read: true, update: false, delete: false },
      { module: 'employees', create: true, read: true, update: true, delete: false },
    ],
    employee: [
      { module: 'dashboard', create: false, read: true, update: false, delete: false },
    ],
    accounts: [
      { module: 'dashboard', create: false, read: true, update: false, delete: false },
      { module: 'payments', create: true, read: true, update: true, delete: false },
    ],
  };

  if (this.name in defaultPermissions && this.permissions.length === 0) {
    this.permissions = defaultPermissions[this.name as keyof typeof defaultPermissions];
  }
});

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);