import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  description: string;
  vehicleType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  includedKm?: number;
  extraKmRate?: number;
  otHourlyRate?: number;
}

export interface IQuotation {
  _id?: any;
  quotationNumber: string;
  quotationType?: 'Monthly Annual Agreement' | 'Daily / 2-Day Tour Hire' | 'Standard Quotation';
  customer?: mongoose.Types.ObjectId;
  customerCompany?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  issueDate: Date;
  validUntil: Date;
  items: IQuotationItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  terms: string;
  notes?: string;
  driverArrangement?: string;
  fuelArrangement?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';
  createdAt?: Date;
  updatedAt?: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    quotationType: {
      type: String,
      enum: ['Monthly Annual Agreement', 'Daily / 2-Day Tour Hire', 'Standard Quotation'],
      default: 'Monthly Annual Agreement',
    },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    issueDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    items: [
      {
        description: { type: String, required: true },
        vehicleType: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
        includedKm: { type: Number, default: 3000 },
        extraKmRate: { type: Number, default: 100 },
        otHourlyRate: { type: Number, default: 600 },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    driverArrangement: { type: String, default: 'Experienced Professional Driver Included' },
    fuelArrangement: { type: String, default: 'Fuel Billed at Actuals or Customer Provides' },
    terms: {
      type: String,
      default: 'Annual Service Agreement terms apply. Standard 3,000 KM included per month. Excess KM billed at agreed rates.',
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Converted'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
