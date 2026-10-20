import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  driverId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  nic: string;
  address: string;
  emergencyContact?: string;
  drivingLicenceNumber: string;
  licenceCategory: string;
  licenceExpiryDate: Date;
  employmentType: 'Full-time' | 'Contract' | 'Daily' | 'Commission';
  joiningDate: Date;
  defaultPaymentMethod: 'Daily rate' | 'Monthly salary' | 'Per trip' | 'Per kilometre' | 'Commission-based';
  defaultRate: number;
  basicSalary: number;
  overtimeHourlyRate: number;
  fixedAllowances: number;
  epfNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  epfApplicable: boolean;
  etfApplicable: boolean;
  assignedVehicle?: mongoose.Types.ObjectId;
  assignedVehicleReg?: string;
  status: 'Available' | 'Assigned' | 'On Trip' | 'On Leave' | 'Temporarily Unavailable' | 'Inactive';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    driverId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    nic: { type: String, required: true },
    address: { type: String, required: true },
    emergencyContact: { type: String },
    drivingLicenceNumber: { type: String, required: true },
    licenceCategory: { type: String, default: 'Heavy Vehicle' },
    licenceExpiryDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Contract', 'Daily', 'Commission'],
      default: 'Full-time',
    },
    joiningDate: { type: Date, default: Date.now },
    defaultPaymentMethod: {
      type: String,
      enum: ['Daily rate', 'Monthly salary', 'Per trip', 'Per kilometre', 'Commission-based'],
      default: 'Monthly salary',
    },
    defaultRate: { type: Number, default: 3500 },
    basicSalary: { type: Number, default: 65000 },
    overtimeHourlyRate: { type: Number, default: 450 },
    fixedAllowances: { type: Number, default: 5000 },
    epfNumber: { type: String, default: '' },
    bankName: { type: String, default: 'Commercial Bank of Ceylon' },
    bankAccountNumber: { type: String, default: '' },
    bankBranch: { type: String, default: 'Colombo' },
    epfApplicable: { type: Boolean, default: true },
    etfApplicable: { type: Boolean, default: true },
    assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedVehicleReg: { type: String },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'On Trip', 'On Leave', 'Temporarily Unavailable', 'Inactive'],
      default: 'Available',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);
