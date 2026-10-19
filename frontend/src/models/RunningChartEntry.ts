import mongoose, { Schema, Document } from 'mongoose';

export interface IRunningChartEntry extends Document {
  entryId: string;
  date: Date;
  monthYear: string; // e.g. "2026-10"
  vehicle: mongoose.Types.ObjectId;
  vehicleReg: string;
  driver: mongoose.Types.ObjectId;
  driverName: string;
  customerName?: string;
  bookingRef?: mongoose.Types.ObjectId;
  startLocation: string;
  destination: string;
  startOdometer: number;
  endOdometer: number;
  totalKm: number;
  revenue: number;
  allowances: number;
  fuelCost: number;
  tollCharges: number;
  parkingCost: number;
  otherExpenses: number;
  notes?: string;
  status: 'Draft' | 'Approved' | 'Invoiced';
  createdAt: Date;
  updatedAt: Date;
}

const RunningChartEntrySchema = new Schema<IRunningChartEntry>(
  {
    entryId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    monthYear: { type: String, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, required: true },
    customerName: { type: String },
    bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking' },
    startLocation: { type: String, required: true },
    destination: { type: String, required: true },
    startOdometer: { type: Number, required: true },
    endOdometer: { type: Number, required: true },
    totalKm: { type: Number, required: true },
    revenue: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    tollCharges: { type: Number, default: 0 },
    parkingCost: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, enum: ['Draft', 'Approved', 'Invoiced'], default: 'Approved' },
  },
  { timestamps: true }
);

RunningChartEntrySchema.index({ vehicle: 1, date: -1 });
RunningChartEntrySchema.index({ monthYear: 1, vehicle: 1 });

export default mongoose.models.RunningChartEntry ||
  mongoose.model<IRunningChartEntry>('RunningChartEntry', RunningChartEntrySchema);
