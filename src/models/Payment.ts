import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeRollNo: string;

  // Payment Information
  amount: number;
  paymentMode: "bank" | "cash" | "loan" | "advance" | "other";
  paymentDetails?: string;
  bankName?: string;
  accountNumber?: string;
  transactionId?: string;

  // Screenshot/Proof
  screenshotUrl?: string;

  // Auto-generated fields
  slipNo: string;
  paymentDate: Date;
  receiptDate: Date;

  // Loan/Advance Details
  loanType?: "personal" | "emergency" | "medical" | "other";
  loanAmount?: number;
  previousLoanBalance?: number;
  newLoanBalance?: number;
  advanceDeduction?: boolean;
  advanceAmount?: number;

  // Status
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentStatus: "paid" | "partially_paid" | "unpaid";

  // Tax Information
  taxDeducted: boolean;
  taxAmount?: number;

  // Created by
  createdBy: mongoose.Types.ObjectId;
  createdByRole: string;

  // System fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeRollNo: {
      type: String,
      required: true,
    },

    // Payment Information
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["bank", "cash", "loan", "advance", "other"],
    },
    paymentDetails: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    transactionId: {
      type: String,
    },

    // Screenshot
    screenshotUrl: {
      type: String,
    },

    // Auto-generated fields
    slipNo: {
      type: String,
      required: true,
      unique: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receiptDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Loan/Advance Details
    loanType: {
      type: String,
      enum: ["personal", "emergency", "medical", "other"],
    },
    loanAmount: {
      type: Number,
      min: 0,
    },
    previousLoanBalance: {
      type: Number,
      min: 0,
      default: 0,
    },
    newLoanBalance: {
      type: Number,
      min: 0,
      default: 0,
    },
    advanceDeduction: {
      type: Boolean,
      default: false,
    },
    advanceAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partially_paid", "unpaid"],
      default: "unpaid",
    },

    // Tax Information
    taxDeducted: {
      type: Boolean,
      default: false,
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Created by
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },

    // System fields
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate slip number before save
PaymentSchema.pre("save", async function (this: IPayment) {
  if (!this.slipNo) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await mongoose.models.Payment.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    this.slipNo = `PAY-${year}${month}-${sequence}`;
  }
});

// Calculate loan balance
PaymentSchema.methods.calculateLoanBalance = function () {
  if (this.paymentMode === "loan") {
    this.newLoanBalance =
      (this.previousLoanBalance || 0) + (this.loanAmount || 0);
  }
};

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
