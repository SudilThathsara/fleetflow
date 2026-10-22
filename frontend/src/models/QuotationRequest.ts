import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationRequest extends Document {
  requestId: string;
  user?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  customerType: 'individual' | 'corporate';
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  email: string;
  serviceCategory: string;
  vehicleCategory: string;
  numberOfVehicles: number;
  hireType: 'Monthly' | 'Daily' | 'Short-term';
  startDate: Date;
  endDate?: Date;
  contractDurationMonths?: number;
  serviceArea: string;
  estimatedKmPerMonth?: number;
  driverRequirement: string;
  fuelArrangement: string;
  overtimeRequirement?: string;
  additionalNotes?: string;
  status: 'Pending' | 'Under Review' | 'Quoted' | 'Declined' | 'Closed';
  convertedQuotationId?: mongoose.Types.ObjectId;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationRequestSchema = new Schema<IQuotationRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerType: { type: String, enum: ['individual', 'corporate'], default: 'individual' },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    serviceCategory: { type: String, required: true },
    vehicleCategory: { type: String, required: true },
    numberOfVehicles: { type: Number, default: 1 },
    hireType: { type: String, enum: ['Monthly', 'Daily', 'Short-term'], default: 'Monthly' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    contractDurationMonths: { type: Number },
    serviceArea: { type: String, required: true },
    estimatedKmPerMonth: { type: Number },
    driverRequirement: { type: String, default: 'Driver Provided' },
    fuelArrangement: { type: String, default: 'Company Provided' },
    overtimeRequirement: { type: String },
    additionalNotes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Quoted', 'Declined', 'Closed'],
      default: 'Pending',
    },
    convertedQuotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

QuotationRequestSchema.index({ requestId: 1 });
QuotationRequestSchema.index({ status: 1 });
QuotationRequestSchema.index({ user: 1 });
QuotationRequestSchema.index({ createdAt: -1 });

export default mongoose.models.QuotationRequest ||
  mongoose.model<IQuotationRequest>('QuotationRequest', QuotationRequestSchema);
