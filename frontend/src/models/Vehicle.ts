import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle {
  _id?: any;
  vehicleId: string;
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  manufacturingYear: number;
  color: string;
  fuelType: 'Diesel' | 'Petrol' | 'Hybrid' | 'Electric';
  seatingCapacity: number;
  currentOdometer: number;
  ownershipType: 'Business-owned' | 'Leased' | 'Rented' | 'Third-party or partner-owned';
  ownerSupplier?: mongoose.Types.ObjectId;
  ownerName?: string;
  defaultDriver?: mongoose.Types.ObjectId;
  defaultDriverName?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  hireRate?: number;
  serviceIntervalKm: number;
  lastServiceOdometer: number;
  nextServiceOdometer: number;
  nextServiceDate?: Date;
  status: 'Available' | 'Booked' | 'On Trip' | 'Under Maintenance' | 'Inactive' | 'Retired';
  notes?: string;
  isPublishedToFleet?: boolean;
  publicDescription?: string;
  publicPhotos?: string[];
  publicFeatures?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleId: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, required: true }, // Car, Van, Bus, Lorry, SUV, Tuk Tuk
    make: { type: String, required: true },
    model: { type: String, required: true },
    manufacturingYear: { type: Number, required: true },
    color: { type: String, default: 'White' },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Hybrid', 'Electric'], default: 'Diesel' },
    seatingCapacity: { type: Number, default: 4 },
    currentOdometer: { type: Number, required: true, default: 0 },
    ownershipType: {
      type: String,
      enum: ['Business-owned', 'Leased', 'Rented', 'Third-party or partner-owned'],
      default: 'Business-owned',
    },
    ownerSupplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    ownerName: { type: String },
    defaultDriver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    defaultDriverName: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number, default: 0 },
    hireRate: { type: Number, default: 0 },
    serviceIntervalKm: { type: Number, default: 5000 },
    lastServiceOdometer: { type: Number, default: 0 },
    nextServiceOdometer: { type: Number, default: 5000 },
    nextServiceDate: { type: Date },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'On Trip', 'Under Maintenance', 'Inactive', 'Retired'],
      default: 'Available',
    },
    notes: { type: String },
    isPublishedToFleet: { type: Boolean, default: false },
    publicDescription: { type: String },
    publicPhotos: [{ type: String }],
    publicFeatures: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
