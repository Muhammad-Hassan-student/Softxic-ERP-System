import mongoose, { Schema } from "mongoose";

export interface IEntity extends Document {
    module: string; // 're' | 'expense'
    entityKey: string; // 'dealer', 'fhh-client', 'cp-client'
    name: string; // Display name
    description: string;
    isEnabled: boolean;
    enableApproval: boolean;
    branchId?: string; // Multity-entity support
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date
}

const EntitySchema = new Schema<IEntity>({
    module: {
        type: String,
        requried: true,
        enum: ['red', 'expense']
    },
    entityKey: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }, 
    name: { type: String, required: true },
    description: String,
    enableApproval: { type: Boolean, default: false },
    branchId: { type: String, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
})

// Unique constraint per module + entitiyKey + branch
EntitySchema.index({ module: 1, entityKey: 1, branchId: 1 }, { unique: true } );

export default mongoose.models.Entity || mongoose.model<IEntity>('Entity', EntitySchema, 'financial_entities')