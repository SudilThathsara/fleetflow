import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverSettlement extends Document {
  settlementId: string;
  driver: mongoose.Types.ObjectId;
  driverName: string;
  periodStart: Date;
  periodEnd: Date;
  grossEarnings: number;
  allowances: number;
  deductions: number;
  appliedAdvances: number;
  netPayable: number;
  paidAmount: number;
  remainingBalance: number;
  status: 'Draft' | 'Approved' | 'Partially Paid' | 'Paid' | 'Cancelled';
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque';
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSettlementSchema = new Schema<IDriverSettlement>(
  {
    settlementId: { type: String, required: true, unique: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    grossEarnings: { type: Number, required: true, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    appliedAdvances: { type: Number, default: 0 },
    netPayable: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Partially Paid', 'Paid', 'Cancelled'],
      default: 'Draft',
    },
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'] },
    paymentReference: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.DriverSettlement ||
  mongoose.model<IDriverSettlement>('DriverSettlement', DriverSettlementSchema);
