import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  name: string;
  description?: string;
  module: 're' | 'expense' | 'both';
  entity: string;
  config: {
    dateRange: {
      start: string;
      end: string;
      preset?: string;
    };
    groupBy: string;
    metrics: string[];
    filters: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    chartType: string;
    format: string;
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  name: { type: String, required: true },
  description: String,
  module: { 
    type: String, 
    enum: ['re', 'expense', 'both'],
    required: true 
  },
  entity: { type: String, required: true },
  config: {
    dateRange: {
      start: String,
      end: String,
      preset: String
    },
    groupBy: String,
    metrics: [String],
    filters: [{
      field: String,
      operator: String,
      value: Schema.Types.Mixed
    }],
    chartType: String,
    format: String
  },
  schedule: {
    enabled: { type: Boolean, default: false },
    frequency: { 
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    recipients: [String]
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

ReportSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.models.Report || 
  mongoose.model<IReport>('Report', ReportSchema, 'financial_reports');