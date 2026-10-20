import mongoose, { Schema, Document } from 'mongoose';

export interface IContractRateVersion {
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  monthlyBasicHireRate: number; // e.g., LKR 250,000
  includedMonthlyKm: number;    // default 3,000 km
  extraKmRate: number;          // e.g., LKR 100/km
  driverServiceIncluded: boolean; // true = included, false = charged extra
  driverMonthlyRate: number;
  fuelIncluded: boolean;        // true = included, false = reimbursed/billed
  fuelReimbursementMethod: string;
  normalWorkingHours: number;   // default 8 or 10 hours
  overtimeHourlyRate: number;   // e.g., LKR 600/hr
  additionalCharges: number;
  changeReason?: string;
  approvedBy?: string;
  createdAt?: Date;
}

export interface IContractVehicleAssignment {
  vehicle: mongoose.Types.ObjectId;
  registrationNumber: string;
  vehicleCategory: string; // 'Double Cab', 'Van', 'Car', 'SUV'
  ownershipType: string;   // 'Business-owned', 'External Supplier'
  supplier?: mongoose.Types.ObjectId;
  supplierName?: string;
}

export interface IContract {
  _id?: any;
  contractId: string;
  contractNumber: string;
  customerCompany: mongoose.Types.ObjectId;
  companyName: string;
  project: mongoose.Types.ObjectId;
  projectName: string;
  startDate: Date;
  endDate: Date;
  status: 'Active' | 'Pending Renewal' | 'Expired' | 'Terminated';
  assignedVehicles: IContractVehicleAssignment[];
  rateCard: IContractRateVersion;
  rateVersions: IContractRateVersion[];
  paymentTerms?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContractRateVersionSchema = new Schema<IContractRateVersion>(
  {
    version: { type: Number, required: true, default: 1 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date },
    monthlyBasicHireRate: { type: Number, required: true, default: 250000 },
    includedMonthlyKm: { type: Number, required: true, default: 3000 },
    extraKmRate: { type: Number, required: true, default: 100 },
    driverServiceIncluded: { type: Boolean, default: true },
    driverMonthlyRate: { type: Number, default: 0 },
    fuelIncluded: { type: Boolean, default: false },
    fuelReimbursementMethod: { type: String, default: 'Customer Provides Fuel or Reimbursed at Actuals' },
    normalWorkingHours: { type: Number, default: 8 },
    overtimeHourlyRate: { type: Number, default: 600 },
    additionalCharges: { type: Number, default: 0 },
    changeReason: { type: String },
    approvedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ContractVehicleAssignmentSchema = new Schema<IContractVehicleAssignment>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    registrationNumber: { type: String, required: true },
    vehicleCategory: { type: String, required: true, default: 'Double Cab' },
    ownershipType: { type: String, default: 'Business-owned' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
  },
  { _id: false }
);

const ContractSchema = new Schema<IContract>(
  {
    contractId: { type: String, required: true, unique: true },
    contractNumber: { type: String, required: true, unique: true },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    projectName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Pending Renewal', 'Expired', 'Terminated'], default: 'Active' },
    assignedVehicles: [ContractVehicleAssignmentSchema],
    rateCard: { type: ContractRateVersionSchema, required: true },
    rateVersions: [ContractRateVersionSchema],
    paymentTerms: { type: String, default: 'Monthly billing, payment due within 15 days of invoice date.' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
