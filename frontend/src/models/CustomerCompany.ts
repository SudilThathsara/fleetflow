import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerCompany {
  _id?: any;
  companyId: string;
  name: string;
  registeredName?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  billingAddress: string;
  taxNumber?: string;
  brNumber?: string;
  invoicePreferences?: 'Consolidated' | 'Per-Vehicle' | 'Detailed';
  paymentTerms?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerCompanySchema = new Schema<ICustomerCompany>(
  {
    companyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    registeredName: { type: String },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    billingAddress: { type: String, required: true },
    taxNumber: { type: String },
    brNumber: { type: String },
    invoicePreferences: { type: String, enum: ['Consolidated', 'Per-Vehicle', 'Detailed'], default: 'Consolidated' },
    paymentTerms: { type: String, default: '15 Days from Invoice Date' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.CustomerCompany || mongoose.model<ICustomerCompany>('CustomerCompany', CustomerCompanySchema);
