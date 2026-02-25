import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  recordId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: mongoose.Types.ObjectId; // For replies
  replies?: mongoose.Types.ObjectId[]; // For nested comments
  attachments?: string[]; // File URLs or IDs
  mentions?: string[]; // User IDs mentioned
  edited: boolean;
  editedAt?: Date;
  editedBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  reactions?: Map<string, string[]>; // reaction type -> user IDs
  metadata?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  recordId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Record', 
    required: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  userName: { type: String, required: true },
  userAvatar: String,
  content: { type: String, required: true },
  parentCommentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment',
    index: true 
  },
  replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  attachments: [String],
  mentions: [{ type: String }],
  edited: { type: Boolean, default: false },
  editedAt: Date,
  editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reactions: { type: Map, of: [String], default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes for faster queries
CommentSchema.index({ recordId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ mentions: 1 });
CommentSchema.index({ 'reactions.$**': 1 }); // Index on reaction keys

// Virtual for reply count
CommentSchema.virtual('replyCount').get(function() {
  return this.replies?.length || 0;
});

// Virtual for reaction summary
CommentSchema.virtual('reactionSummary').get(function() {
  const summary: Record<string, number> = {};
  if (this.reactions) {
    this.reactions.forEach((users, reaction) => {
      summary[reaction] = users.length;
    });
  }
  return summary;
});

export default mongoose.models.Comment || 
  mongoose.model<IComment>('Comment', CommentSchema, 'financial_comments');