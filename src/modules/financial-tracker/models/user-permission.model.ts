import mongoose, { Schema, Document } from 'mongoose';

export interface IColumnPermission {
  view: boolean;
  edit: boolean;
}

export interface IEntityPermission {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: 'own' | 'all' | 'department';
  columns?: Map<string, IColumnPermission>; // fieldKey -> permissions
}

export interface IModulePermission {
  [entity: string]: IEntityPermission;
}

export interface IUserPermission extends Document {
  userId: mongoose.Types.ObjectId;
  permissions: {
    re: IModulePermission;
    expense: IModulePermission;
  };
  department?: string;
  branchId?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ColumnPermissionSchema = new Schema({
  view: { type: Boolean, default: true },
  edit: { type: Boolean, default: false }
}, { _id: false });

const EntityPermissionSchema = new Schema({
  access: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  scope: { 
    type: String, 
    enum: ['own', 'all', 'department'],
    default: 'own'
  },
  columns: { type: Map, of: ColumnPermissionSchema, default: {} }
}, { _id: false });

const UserPermissionSchema = new Schema<IUserPermission>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  permissions: {
    re: { type: Map, of: EntityPermissionSchema, default: {} },
    expense: { type: Map, of: EntityPermissionSchema, default: {} }
  },
  department: String,
  branchId: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export default mongoose.models.UserPermission || 
  mongoose.model<IUserPermission>('UserPermission', UserPermissionSchema, 'financial_user_permissions');