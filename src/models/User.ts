import mongoose, { Schema, Document, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  // Login Credentials
  rollNo: string; // Unique for employees
  fullName: string;
  cnic: string;
  password: string;
  email?: string;
  mobile: string;
  alternateMobile?: string; // Family member mobile
  
  // Personal Information
  profilePhoto?: string; // Cloudinary URL
  fatherName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  
  // Academic/Qualifications
  qualification: {
    academic: string;
    other: string;
  };
  reference?: string;
  
  // Job Information
  jobTitle: string;
  department: string;
  responsibility: string;
  timing: string; // e.g., "9:00 AM - 5:00 PM"
  monthOff: string; // e.g., "Sunday"
  dateOfJoining: Date;
  salary: number;
  incentive: number;
  taxDeduction: boolean;
  taxAmount: number;
  
  // Status
  status: 'active' | 'inactive' | 'terminated';
  terminationDate?: Date;
  terminationReason?: string;


  role: string; // Role name
  directPermissions?: string[]; // Override permissions
  dataScopes: {
    department: string;
    canAccessAllDepartments: boolean;
    accessibleDepartments?: string[];
  };
  
  // Analytics access tracking
  lastAnalyticsAccess?: Date;
  analyticsPreferences?: {
    defaultDashboard?: string;
    charttype?: string[];
    refreshInterval?: number;
  }

  // System Fields
  createdBy: mongoose.Types.ObjectId; // Who created this user
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRollNo(): Promise<string>;
}

type UserDocument = HydratedDocument<IUser>;


const UserSchema: Schema = new Schema({
  // Login Credentials
  rollNo: {
    type: String,
    unique: true,
    sparse: true, // Allows null for non-employees
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Please enter valid CNIC (XXXXX-XXXXXXX-X)'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{11}$/, 'Please enter a valid 11-digit mobile number'],
  },
  alternateMobile: {
    type: String,
    match: [/^[0-9]{11}$/, 'Please enter a valid 11-digit mobile number'],
  },
  
  // Personal Information
  profilePhoto: {
    type: String,
  },
  fatherName: {
    type: String,
    required: [true, "Father's name is required"],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
  },
  maritalStatus: {
    type: String,
    required: [true, 'Marital status is required'],
    enum: ['single', 'married', 'divorced', 'widowed'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  
  // Academic/Qualifications
  qualification: {
    academic: {
      type: String,
      required: [true, 'Academic qualification is required'],
      trim: true,
    },
    other: {
      type: String,
      trim: true,
    },
  },
  reference: {
    type: String,
    trim: true,
  },
  
  // Job Information
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['hr', 'finance', 'sales', 'support', 'marketing', 'it', 'operations', 'admin'],
  },
  responsibility: {
    type: String,
    required: [true, 'Responsibility is required'],
    trim: true,
  },
  timing: {
    type: String,
    required: [true, 'Timing is required'],
    trim: true,
  },
  monthOff: {
    type: String,
    required: [true, 'Month off is required'],
    trim: true,
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required'],
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative'],
  },
  incentive: {
    type: Number,
    required: [true, 'Incentive is required'],
    default: 0,
    min: [0, 'Incentive cannot be negative'],
  },
  taxDeduction: {
    type: Boolean,
    required: [true, 'Tax deduction status is required'],
    default: false,
  },
  taxAmount: {
    type: Number,
    required: [true, 'Tax amount is required'],
    default: 0,
    min: [0, 'Tax amount cannot be negative'],
  },
  
  // Status
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
  },
  terminationDate: {
    type: Date,
  },
  terminationReason: {
    type: String,
    trim: true,
  },
  
  // System Fields
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'hr', 'employee', 'accounts', 'support', 'sales', 'finance'],
    default: 'employee',
  },
  directPermissions: [{
    type: String,
    index: true
  }],
  dataScopes: {
    department: {
      type: String,
      enum: ['hr', 'finance', 'sales', 'support', 'marketing', 'it', 'operations', 'admin']
    }, 
    canAccessAllDepartments: {
      type: Boolean,
      default: false
    },
    accessibleDepartments: [{
      type: String
    }],
 
  },
  lastAnalyticsAccess: Date,
  analyticsPreference: {
    defaultDashboard: String,
    chartTypes: [String],
    refreshInterval: {
      type: Number,
      default: 300, // 5 minutes
    }
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Generate roll number for employees
UserSchema.methods.generateRollNo = async function(): Promise<string> {
  if (this.role !== 'employee') return '';
  
  const year = new Date().getFullYear().toString().slice(-2);
  const departmentCode = this.department.toUpperCase().substring(0, 3);
  
  // Count employees in same department this year
  const count = await mongoose.models.User.countDocuments({
    role: 'employee',
    department: this.department,
    dateOfJoining: { $gte: new Date(`${year}-01-01`) },
  });
  
  const sequence = (count + 1).toString().padStart(3, '0');
  return `EMP-${departmentCode}-${year}-${sequence}`;
};

// Pre-save hook
UserSchema.pre('save', async function (this: UserDocument) {
  // Generate roll number for new employees
  if (this.isNew && this.role === 'employee' && !this.rollNo) {
    if (this.generateRollNo) {
      this.rollNo = await this.generateRollNo();
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('save', async function (this: any) {
  // Ensure only one admin exists
  if (this.role === 'admin' && this.isNew) {
    const adminCount = await mongoose.models.User.countDocuments({ 
      role: 'admin', 
      isActive: true 
    });

    if (adminCount > 0) {
      throw new Error('Only one admin is allowed in the system');
    }
  }
});



// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);