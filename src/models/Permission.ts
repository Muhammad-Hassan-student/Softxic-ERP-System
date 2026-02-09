import mongoose, { Schema } from "mongoose"

export interface IPermission extends Document {
    code: string; // e.g.. "employee.read.salary", "analytics.view.dashboard"
    name: string;
    description?: string;
    module: string; // "employee", "payroll", "analytics", "sales" etc
    category: 'crud' | 'analytics' | 'system';
    isSensitive: boolean;
    dataScope?: 'self' | 'department' | 'all';
    metadata?: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date; 
}

const PermissionSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    }, 
    module: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['crud', 'analytics', 'system'],
        default: 'crud'
    },
    isSensitive: {
        type: Boolean,
        default: false
    },
    dataScope: {
        type: String,
        enum: ['self', 'department', 'all'],
        default: 'all'
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Index for efficient permission lookups
PermissionSchema.index({ module: 1, category: 1, isActive: 1});

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema)