import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string;
  customer: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  bookingSource: 'Direct' | 'Facebook' | 'WhatsApp' | 'Web' | 'Repeat Customer';
  pickupLocation: string;
  destination: string;
  pickupDate: Date;
  returnDate: Date;
  vehicleType: string;
  assignedVehicle?: mongoose.Types.ObjectId;
  assignedVehicleReg?: string;
  assignedDriver?: mongoose.Types.ObjectId;
  assignedDriverName?: string;
  agreedPrice: number;
  advanceReceived: number;
  expectedSupplierCost: number;
  expectedDriverCost: number;
  actualFuelCost?: number;
  actualOtherExpenses?: number;
  status:
    | 'Enquiry'
    | 'Quoted'
    | 'Confirmed'
    | 'Assigned'
    | 'In Progress'
    | 'Completed'
    | 'Invoiced'
    | 'Closed'
    | 'Cancelled';
  startOdometer?: number;
  endOdometer?: number;
  totalKm?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    bookingSource: {
      type: String,
      enum: ['Direct', 'Facebook', 'WhatsApp', 'Web', 'Repeat Customer'],
      default: 'Direct',
    },
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    vehicleType: { type: String, required: true },
    assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedVehicleReg: { type: String },
    assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    assignedDriverName: { type: String },
    agreedPrice: { type: Number, required: true, default: 0 },
    advanceReceived: { type: Number, default: 0 },
    expectedSupplierCost: { type: Number, default: 0 },
    expectedDriverCost: { type: Number, default: 0 },
    actualFuelCost: { type: Number, default: 0 },
    actualOtherExpenses: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'Enquiry',
        'Quoted',
        'Confirmed',
        'Assigned',
        'In Progress',
        'Completed',
        'Invoiced',
        'Closed',
        'Cancelled',
      ],
      default: 'Enquiry',
    },
    startOdometer: { type: Number },
    endOdometer: { type: Number },
    totalKm: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
