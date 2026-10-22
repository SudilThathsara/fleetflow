import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingRequest extends Document {
  requestId: string;
  user?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleCategory: string;
  pickupLocation: string;
  destination: string;
  pickupDate: Date;
  returnDate: Date;
  durationDays: number;
  driverPreference: string;
  fuelArrangement: string;
  passengerCount: number;
  additionalNotes?: string;
  status: 'Pending' | 'Approved' | 'Confirmed' | 'Declined';
  convertedBookingId?: mongoose.Types.ObjectId;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    vehicleCategory: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    durationDays: { type: Number, default: 1 },
    driverPreference: { type: String, default: 'With Professional Driver' },
    fuelArrangement: { type: String, default: 'Fuel Included' },
    passengerCount: { type: Number, default: 1 },
    additionalNotes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Confirmed', 'Declined'],
      default: 'Pending',
    },
    convertedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

BookingRequestSchema.index({ requestId: 1 });
BookingRequestSchema.index({ status: 1 });
BookingRequestSchema.index({ user: 1 });
BookingRequestSchema.index({ createdAt: -1 });

export default mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema);
