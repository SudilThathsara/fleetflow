import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanySettings extends Document {
  companyName: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  vatNumber?: string;
  brNumber?: string;
  invoicePrefix: string;
  quotationPrefix: string;
  receiptPrefix: string;
  terms: string;
  bankAccountDetails: string;

  // Sri Lanka Statutory EPF & ETF Configuration
  epfEmployeeRate: number;        // Default: 8 (%)
  epfEmployerRate: number;        // Default: 12 (%)
  etfEmployerRate: number;        // Default: 3 (%)
  epfRegistrationNumber?: string; // e.g. "EPF/C/94821"
  etfRegistrationNumber?: string; // e.g. "ETF/L/38291"
  maxAdvanceDeductionPerMonth: number; // Default: 10000 (LKR)
  normalWorkingHoursPerDay: number;    // Default: 8

  updatedAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: { type: String, default: 'FleetFlow Lanka (Pvt) Ltd' },
    tagline: { type: String, default: 'Enterprise Vehicle, Fleet & Transport Operations Management' },
    logoUrl: { type: String, default: '' },
    phone: { type: String, default: '+94 11 234 5678 / +94 77 123 4567' },
    email: { type: String, default: 'operations@fleetflowlanka.lk' },
    address: { type: String, default: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka' },
    currency: { type: String, default: 'LKR' },
    vatNumber: { type: String, default: 'VAT-10928374-7000' },
    brNumber: { type: String, default: 'PV-98765/2024' },
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
      default: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: FleetFlow Lanka (Pvt) Ltd',
    },

    // Statutory EPF/ETF Defaults
    epfEmployeeRate: { type: Number, default: 8 },
    epfEmployerRate: { type: Number, default: 12 },
    etfEmployerRate: { type: Number, default: 3 },
    epfRegistrationNumber: { type: String, default: 'EPF/C/94821' },
    etfRegistrationNumber: { type: String, default: 'ETF/L/38291' },
    maxAdvanceDeductionPerMonth: { type: Number, default: 10000 },
    normalWorkingHoursPerDay: { type: Number, default: 8 },
  },
  { timestamps: true }
);

export default mongoose.models.CompanySettings ||
  mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);
