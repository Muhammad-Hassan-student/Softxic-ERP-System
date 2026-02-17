import mongoose, { Schema, Document } from 'mongoose';

export interface IRecord extends Document {
  module: string;
  entity: string;
  data: Map<string, any>;     // Dynamic fields data
  version: number;            // Optimistic locking
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  branchId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecordSchema = new Schema<IRecord>({
  module: { 
    type: String, 
    required: true, 
    enum: ['re', 'expense'],
    index: true
  },
  entity: { 
    type: String, 
    required: true,
    index: true
  },
  data: { 
    type: Map, 
    of: Schema.Types.Mixed,
    default: {}
  },
  version: { 
    type: Number, 
    default: 1,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft',
    index: true
  },
  branchId: { type: String, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date,
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Compound indexes for performance
RecordSchema.index({ module: 1, entity: 1, createdAt: -1 });
RecordSchema.index({ module: 1, entity: 1, isDeleted: 1 });
RecordSchema.index({ module: 1, entity: 1, status: 1 });
RecordSchema.index({ 'data.$**': 'text' }); // Text search on dynamic fields

export default mongoose.models.Record || 
  mongoose.model<IRecord>('Record', RecordSchema, 'financial_records');