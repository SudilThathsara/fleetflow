import mongoose, { Schema, Document } from 'mongoose';

export interface IContractBillingLine {
  vehicle: mongoose.Types.ObjectId;
  registrationNumber: string;
  vehicleCategory: string;
  monthlyBasicHire: number;
  includedKm: number; // default 3000
  actualKm: number;
  billableExtraKm: number; // Math.max(0, actualKm - includedKm)
  extraKmRate: number;
  extraKmCharge: number;
  approvedOtHours: number;
  otRate: number;
  otCharge: number;
  fuelCharge: number;
  driverCharge: number;
  additionalCharges: number;
  lineSubtotal: number;
  notes?: string;
}

export interface IContractMonthlyBillingRun {
  _id?: any;
  billingRunId: string;
  contract: mongoose.Types.ObjectId;
  contractNumber: string;
  customerCompany: mongoose.Types.ObjectId;
  companyName: string;
  project: mongoose.Types.ObjectId;
  projectName: string;
  billingMonth: string; // e.g., '2026-04'
  rateVersionUsed: number;
  vehicleLines: IContractBillingLine[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Approved' | 'Invoiced';
  generatedInvoiceId?: mongoose.Types.ObjectId;
  generatedInvoiceNumber?: string;
  warnings?: string[];
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContractBillingLineSchema = new Schema<IContractBillingLine>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    registrationNumber: { type: String, required: true },
    vehicleCategory: { type: String, default: 'Double Cab' },
    monthlyBasicHire: { type: Number, required: true },
    includedKm: { type: Number, required: true, default: 3000 },
    actualKm: { type: Number, required: true, default: 0 },
    billableExtraKm: { type: Number, required: true, default: 0 },
    extraKmRate: { type: Number, required: true, default: 0 },
    extraKmCharge: { type: Number, required: true, default: 0 },
    approvedOtHours: { type: Number, default: 0 },
    otRate: { type: Number, default: 0 },
    otCharge: { type: Number, default: 0 },
    fuelCharge: { type: Number, default: 0 },
    driverCharge: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    lineSubtotal: { type: Number, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const ContractMonthlyBillingRunSchema = new Schema<IContractMonthlyBillingRun>(
  {
    billingRunId: { type: String, required: true, unique: true },
    contract: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    contractNumber: { type: String, required: true },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    projectName: { type: String, required: true },
    billingMonth: { type: String, required: true },
    rateVersionUsed: { type: Number, default: 1 },
    vehicleLines: [ContractBillingLineSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Draft', 'Approved', 'Invoiced'], default: 'Draft' },
    generatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    generatedInvoiceNumber: { type: String },
    warnings: [{ type: String }],
    approvedBy: { type: String },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ContractMonthlyBillingRun ||
  mongoose.model<IContractMonthlyBillingRun>('ContractMonthlyBillingRun', ContractMonthlyBillingRunSchema);
