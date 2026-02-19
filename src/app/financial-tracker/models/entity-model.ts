import mongoose, { Schema, Document } from "mongoose";

export interface IEntity extends Document {
    module: string; // 're' | 'expense'
    entityKey: string; // 'dealer', 'fhh-client', 'cp-client'
    name: string; // Display name
    description: string;
    isEnabled: boolean;
    enableApproval: boolean;
    branchId?: string; // Multi-entity support
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date
}

const EntitySchema = new Schema<IEntity>({
    module: {
        type: String,
        required: true,
        enum: ['re', 'expense']  // ✅ FIXED: 'red' → 're'
    },
    entityKey: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }, 
    name: { type: String, required: true },
    description: String,
    isEnabled: { type: Boolean, default: true },
    enableApproval: { type: Boolean, default: false },
    branchId: { type: String, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
})

// Unique constraint per module + entityKey + branch
EntitySchema.index({ module: 1, entityKey: 1, branchId: 1 }, { unique: true });

export default mongoose.models.Entity || mongoose.model<IEntity>('Entity', EntitySchema, 'financial_entities')