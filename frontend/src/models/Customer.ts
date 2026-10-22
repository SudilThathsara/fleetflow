import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  billingAddress: string;
  customerCategory: 'Individual' | 'Corporate' | 'Travel Agent' | 'Government';
  outstandingBalance: number;
  notes?: string;
  status: 'Active' | 'Inactive';
  userId?: mongoose.Types.ObjectId;
  customerCompany?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    companyName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    billingAddress: { type: String, required: true },
    customerCategory: {
      type: String,
      enum: ['Individual', 'Corporate', 'Travel Agent', 'Government'],
      default: 'Corporate',
    },
    outstandingBalance: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany' },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
