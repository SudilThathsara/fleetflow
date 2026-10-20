import mongoose, { Schema, Document } from 'mongoose';

export interface IProject {
  _id?: any;
  projectId: string;
  name: string;
  customerCompany: mongoose.Types.ObjectId;
  companyName: string;
  location: string;
  projectManager: string;
  phone?: string;
  startDate: Date;
  endDate?: Date;
  assignedVehicles?: {
    vehicle: mongoose.Types.ObjectId;
    registrationNumber: string;
    vehicleType: string;
    ownershipType?: string;
  }[];
  assignedDrivers?: {
    driver: mongoose.Types.ObjectId;
    driverName: string;
    phone?: string;
  }[];
  billingPreferences?: string;
  status: 'Active' | 'On Hold' | 'Completed';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    projectManager: { type: String, required: true },
    phone: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    assignedVehicles: [
      {
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        registrationNumber: { type: String, required: true },
        vehicleType: { type: String },
        ownershipType: { type: String },
      },
    ],
    assignedDrivers: [
      {
        driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
        driverName: { type: String, required: true },
        phone: { type: String },
      },
    ],
    billingPreferences: { type: String, default: 'Monthly Consolidated Invoice with 3000 KM Allowance' },
    status: { type: String, enum: ['Active', 'On Hold', 'Completed'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
