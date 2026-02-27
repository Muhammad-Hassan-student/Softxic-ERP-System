// src/app/financial-tracker/models/attachment.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttachment extends Document {
  // Core fields
  recordId: mongoose.Types.ObjectId;
  fieldKey?: string;
  
  // File info
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  fileKey?: string;
  thumbnailUrl?: string;
  
  // Media specific
  dimensions?: {
    width?: number;
    height?: number;
  };
  duration?: number;
  
  // Metadata
  description?: string;
  tags: string[];
  
  // Tracking
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByUser: string;
  version: number;
  
  // Stats
  downloads: number;
  views: number;
  
  // Security
  isPublic: boolean;
  
  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  
  // Extensibility
  metadata?: Map<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Define statics interface
export interface IAttachmentModel extends Model<IAttachment> {
  findByRecord(recordId: string): Promise<IAttachment[]>;
  findByField(recordId: string, fieldKey: string): Promise<IAttachment[]>;
  getStorageStats(recordId?: string): Promise<{
    totalSize: number;
    totalFiles: number;
    images: number;
    documents: number;
  }>;
}

const AttachmentSchema = new Schema<IAttachment>({
  // Core fields
  recordId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Record', 
    required: true,
    index: true 
  },
  fieldKey: { 
    type: String,
    index: true 
  },
  
  // File info
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: String,
  thumbnailUrl: String,
  
  // Media specific
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number,
  
  // Metadata
  description: String,
  tags: [String],
  
  // Tracking
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  uploadedByUser: { type: String, required: true },
  version: { type: Number, default: 1 },
  
  // Stats
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  // Security
  isPublic: { type: Boolean, default: false },
  
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Extensibility
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================

// Compound indexes for better performance
AttachmentSchema.index({ recordId: 1, fieldKey: 1 });
AttachmentSchema.index({ recordId: 1, createdAt: -1 });
AttachmentSchema.index({ uploadedBy: 1, createdAt: -1 });
AttachmentSchema.index({ fileType: 1 });
AttachmentSchema.index({ tags: 1 });
AttachmentSchema.index({ isDeleted: 1 });

// ============================================
// VIRTUALS
// ============================================

// File size in human readable format
AttachmentSchema.virtual('sizeFormatted').get(function(this: IAttachment) {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// File extension
AttachmentSchema.virtual('extension').get(function(this: IAttachment) {
  return this.fileName.split('.').pop()?.toLowerCase() || '';
});

// File type categories
AttachmentSchema.virtual('isImage').get(function(this: IAttachment) {
  return this.fileType.startsWith('image/');
});

AttachmentSchema.virtual('isVideo').get(function(this: IAttachment) {
  return this.fileType.startsWith('video/');
});

AttachmentSchema.virtual('isAudio').get(function(this: IAttachment) {
  return this.fileType.startsWith('audio/');
});

AttachmentSchema.virtual('isDocument').get(function(this: IAttachment) {
  const docTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'text/plain',
    'application/json'
  ];
  return docTypes.includes(this.fileType);
});

// ============================================
// MIDDLEWARE
// ============================================

// Auto-update timestamps - FIXED: removed 'next' parameter
AttachmentSchema.pre('save', function(this: IAttachment) {
  this.updatedAt = new Date();
});

// ============================================
// METHODS
// ============================================

// Soft delete
AttachmentSchema.methods.softDelete = async function(this: IAttachment, userId: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = new mongoose.Types.ObjectId(userId);
  return this.save();
};

// Increment download count
AttachmentSchema.methods.incrementDownloads = async function(this: IAttachment) {
  this.downloads += 1;
  return this.save();
};

// Increment view count
AttachmentSchema.methods.incrementViews = async function(this: IAttachment) {
  this.views += 1;
  return this.save();
};

// ============================================
// STATICS
// ============================================

// Find by record
AttachmentSchema.statics.findByRecord = function(recordId: string) {
  return this.find({ recordId, isDeleted: false }).sort({ createdAt: -1 });
};

// Find by field
AttachmentSchema.statics.findByField = function(recordId: string, fieldKey: string) {
  return this.find({ recordId, fieldKey, isDeleted: false });
};

// Get storage stats
AttachmentSchema.statics.getStorageStats = async function(recordId?: string) {
  const match: any = { isDeleted: false };
  if (recordId) {
    match.recordId = new mongoose.Types.ObjectId(recordId);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    { 
      $group: {
        _id: null,
        totalSize: { $sum: '$fileSize' },
        totalFiles: { $sum: 1 },
        images: { 
          $sum: { 
            $cond: [{ $regexMatch: { input: '$fileType', regex: /^image/ } }, 1, 0] 
          } 
        },
        documents: { 
          $sum: { 
            $cond: [{ 
              $in: [
                '$fileType', 
                ['application/pdf', 'application/msword', 'text/plain', 'application/json']
              ] 
            }, 1, 0] 
          } 
        }
      }
    }
  ]);
  
  return stats[0] || { totalSize: 0, totalFiles: 0, images: 0, documents: 0 };
};

const AttachmentModel = (mongoose.models.Attachment as IAttachmentModel) || 
  mongoose.model<IAttachment, IAttachmentModel>('Attachment', AttachmentSchema, 'financial_attachments');

export default AttachmentModel;