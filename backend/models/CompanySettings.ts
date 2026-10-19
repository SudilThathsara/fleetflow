import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanySettings extends Document {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  vatNumber?: string;
  invoicePrefix: string;
  quotationPrefix: string;
  receiptPrefix: string;
  terms: string;
  bankAccountDetails: string;
  updatedAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: { type: String, default: 'FleetFlow Lanka (Pvt) Ltd' },
    tagline: { type: String, default: 'Enterprise Vehicle, Fleet & Transport Operations Management' },
    phone: { type: String, default: '+94 11 234 5678 / +94 77 123 4567' },
    email: { type: String, default: 'operations@fleetflowlanka.lk' },
    address: { type: String, default: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka' },
    currency: { type: String, default: 'LKR' },
    vatNumber: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'INV-2026-' },
    quotationPrefix: { type: String, default: 'QT-2026-' },
    receiptPrefix: { type: String, default: 'REC-2026-' },
    terms: {
      type: String,
      default:
        'All running charges are calculated based on official starting and ending odometer readings. Payment is due within 30 days of invoice date.',
    },
    bankAccountDetails: {
      type: String,
      default: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda',
    },
  },
  { timestamps: true }
);

export default mongoose.models.CompanySettings ||
  mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);
