import mongoose, { Schema, Document } from 'mongoose';

export interface IServicePartUsed {
  part?: mongoose.Types.ObjectId;
  sku?: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  issuedFromInventory: boolean;
}

export interface IVehicleService {
  _id?: any;
  serviceId: string;
  vehicle: mongoose.Types.ObjectId;
  vehicleReg: string;
  serviceDate: Date;
  odometerReading: number;
  serviceCategory:
    | 'General service'
    | 'Engine oil change'
    | 'Oil and air filters'
    | 'Tyres and wheel alignment'
    | 'Brake system'
    | 'Battery'
    | 'Engine repairs'
    | 'Electrical repairs'
    | 'Body repairs'
    | 'Other';
  serviceDescription: string;
  workshopName: string;
  partsUsed?: IServicePartUsed[];
  labourCost: number;
  sparePartsCost: number;
  otherCharges: number;
  totalCost: number;
  invoiceReceiptRef?: string;
  nextServiceDate?: Date;
  nextServiceOdometer?: number;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ServicePartUsedSchema = new Schema<IServicePartUsed>(
  {
    part: { type: Schema.Types.ObjectId, ref: 'SparePart' },
    sku: { type: String },
    partName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitCost: { type: Number, required: true, default: 0 },
    totalCost: { type: Number, required: true, default: 0 },
    issuedFromInventory: { type: Boolean, default: true },
  },
  { _id: false }
);

const VehicleServiceSchema = new Schema<IVehicleService>(
  {
    serviceId: { type: String, required: true, unique: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    odometerReading: { type: Number, required: true },
    serviceCategory: {
      type: String,
      enum: [
        'General service',
        'Engine oil change',
        'Oil and air filters',
        'Tyres and wheel alignment',
        'Brake system',
        'Battery',
        'Engine repairs',
        'Electrical repairs',
        'Body repairs',
        'Other',
      ],
      default: 'General service',
    },
    serviceDescription: { type: String, required: true },
    workshopName: { type: String, required: true },
    partsUsed: [ServicePartUsedSchema],
    labourCost: { type: Number, default: 0 },
    sparePartsCost: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    invoiceReceiptRef: { type: String },
    nextServiceDate: { type: Date },
    nextServiceOdometer: { type: Number },
    status: { type: String, enum: ['Completed', 'In Progress', 'Scheduled'], default: 'Completed' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.VehicleService ||
  mongoose.model<IVehicleService>('VehicleService', VehicleServiceSchema);
