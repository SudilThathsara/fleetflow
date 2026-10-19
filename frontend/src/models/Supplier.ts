import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  supplierId: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  rateType: 'Per Day' | 'Per Km' | 'Per Month' | 'Percentage';
  serviceAreas?: string;
  bankDetails?: string;
  outstandingPayable: number;
  notes?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    supplierId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: { type: String, required: true },
    rateType: {
      type: String,
      enum: ['Per Day', 'Per Km', 'Per Month', 'Percentage'],
      default: 'Per Day',
    },
    serviceAreas: { type: String },
    bankDetails: { type: String },
    outstandingPayable: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
