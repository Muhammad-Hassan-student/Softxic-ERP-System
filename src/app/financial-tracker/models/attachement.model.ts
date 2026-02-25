import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment extends Document {
  recordId: mongoose.Types.ObjectId;
  fieldKey?: string; // Which field this attachment belongs to
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  fileKey?: string; // S3 or cloud storage key
  thumbnailUrl?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
  duration?: number; // For audio/video
  isPublic: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedByUser: string; // User name for quick access
  description?: string;
  tags?: string[];
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  metadata?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
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
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: String,
  thumbnailUrl: String,
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number,
  isPublic: { type: Boolean, default: false },
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  uploadedByUser: { type: String, required: true },
  description: String,
  tags: [String],
  version: { type: Number, default: 1 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Compound indexes for better performance
AttachmentSchema.index({ recordId: 1, fieldKey: 1 });
AttachmentSchema.index({ recordId: 1, createdAt: -1 });
AttachmentSchema.index({ uploadedBy: 1, createdAt: -1 });
AttachmentSchema.index({ fileType: 1 });
AttachmentSchema.index({ tags: 1 });

// Virtual for file size in human readable format
AttachmentSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
AttachmentSchema.virtual('extension').get(function() {
  return this.fileName.split('.').pop()?.toLowerCase() || '';
});

// Virtual for is image
AttachmentSchema.virtual('isImage').get(function() {
  return this.fileType.startsWith('image/');
});

// Virtual for is video
AttachmentSchema.virtual('isVideo').get(function() {
  return this.fileType.startsWith('video/');
});

// Virtual for is audio
AttachmentSchema.virtual('isAudio').get(function() {
  return this.fileType.startsWith('audio/');
});

// Virtual for is document
AttachmentSchema.virtual('isDocument').get(function() {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
  return docTypes.includes(this.fileType);
});

export default mongoose.models.Attachment || 
  mongoose.model<IAttachment>('Attachment', AttachmentSchema, 'financial_attachments');