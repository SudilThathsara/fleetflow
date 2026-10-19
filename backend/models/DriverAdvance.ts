import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverAdvance extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  { timestamps: true }
);

export default mongoose.models.DriverAdvance ||
  mongoose.model<IDriverAdvance>('DriverAdvance', DriverAdvanceSchema);
