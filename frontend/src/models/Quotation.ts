import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  description: string;
  vehicleType: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  customer: mongoose.Types.ObjectId;
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
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
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
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    terms: { type: String, default: '50% advance upon confirmation. Balance due on trip completion.' },
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
