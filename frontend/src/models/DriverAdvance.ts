import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvanceRepayment {
  date: Date;
  amount: number;
  payrollMonth?: string;
  notes?: string;
}

export interface IDriverAdvance {
  _id?: any;
  advanceId: string;
  driver: mongoose.Types.ObjectId;
  driverName: string;
  date: Date;
  amount: number;
  appliedAmount: number;
  remainingBalance: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  reason: string;
  status: 'Pending' | 'Approved' | 'Partially Applied' | 'Fully Applied';
  repayments?: IAdvanceRepayment[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdvanceRepaymentSchema = new Schema<IAdvanceRepayment>(
  {
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    payrollMonth: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const DriverAdvanceSchema = new Schema<IDriverAdvance>(
  {
    advanceId: { type: String, required: true, unique: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    appliedAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'], default: 'Cash' },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Partially Applied', 'Fully Applied'],
      default: 'Approved',
    },
    repayments: [AdvanceRepaymentSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.DriverAdvance ||
  mongoose.model<IDriverAdvance>('DriverAdvance', DriverAdvanceSchema);
