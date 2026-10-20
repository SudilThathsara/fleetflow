import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollEntry {
  driver: mongoose.Types.ObjectId;
  driverName: string;
  epfNumber?: string;
  employmentType: string;
  basicSalary: number;
  attendanceDays: number;
  overtimeHours: number;
  overtimeEarnings: number;
  allowances: number;
  grossEarnings: number;
  qualifyingEarnings: number; // Base for EPF/ETF (Basic + eligible allowances)
  employeeEpfRate: number;    // 8%
  employeeEpfDeduction: number; // 8% * qualifyingEarnings
  employerEpfRate: number;    // 12%
  employerEpfContribution: number; // 12% * qualifyingEarnings
  employerEtfRate: number;    // 3%
  employerEtfContribution: number; // 3% * qualifyingEarnings
  advancesDeducted: number;
  otherDeductions: number;
  netSalary: number;           // Gross - 8% EPF - Advances - Deductions
  totalEmployerCost: number;   // Gross + 12% EPF + 3% ETF
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentReference?: string;
  paymentDate?: Date;
  notes?: string;
}

export interface IPayrollPeriod {
  _id?: any;
  payrollId: string;
  monthYear: string; // e.g. "2026-04"
  status: 'Draft' | 'Approved' | 'Finalized' | 'Paid';
  entries: IPayrollEntry[];
  totalGross: number;
  totalEmployeeEpf: number;
  totalEmployerEpf: number;
  totalEmployerEtf: number;
  totalAdvancesDeducted: number;
  totalNetSalary: number;
  totalEmployerCost: number;
  totalPaid: number;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PayrollEntrySchema = new Schema<IPayrollEntry>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, required: true },
    epfNumber: { type: String, default: '' },
    employmentType: { type: String, default: 'Full-time' },
    basicSalary: { type: Number, required: true, default: 0 },
    attendanceDays: { type: Number, default: 26 },
    overtimeHours: { type: Number, default: 0 },
    overtimeEarnings: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    grossEarnings: { type: Number, required: true, default: 0 },
    qualifyingEarnings: { type: Number, required: true, default: 0 },
    employeeEpfRate: { type: Number, default: 8 },
    employeeEpfDeduction: { type: Number, default: 0 },
    employerEpfRate: { type: Number, default: 12 },
    employerEpfContribution: { type: Number, default: 0 },
    employerEtfRate: { type: Number, default: 3 },
    employerEtfContribution: { type: Number, default: 0 },
    advancesDeducted: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    totalEmployerCost: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
    paymentReference: { type: String },
    paymentDate: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const PayrollPeriodSchema = new Schema<IPayrollPeriod>(
  {
    payrollId: { type: String, required: true, unique: true },
    monthYear: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Approved', 'Finalized', 'Paid'], default: 'Draft' },
    entries: [PayrollEntrySchema],
    totalGross: { type: Number, default: 0 },
    totalEmployeeEpf: { type: Number, default: 0 },
    totalEmployerEpf: { type: Number, default: 0 },
    totalEmployerEtf: { type: Number, default: 0 },
    totalAdvancesDeducted: { type: Number, default: 0 },
    totalNetSalary: { type: Number, default: 0 },
    totalEmployerCost: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PayrollPeriod ||
  mongoose.model<IPayrollPeriod>('PayrollPeriod', PayrollPeriodSchema);
