import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  vehicleReg?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  // Enhanced snapshot fields for monthly agreements & variable charges
  chargeType?: 'Monthly Basic Hire' | 'Extra Kilometres' | 'Overtime' | 'Fuel' | 'Driver' | 'Daily Hire' | 'Other';
  includedKm?: number;
  actualKm?: number;
  billableExtraKm?: number;
  extraKmRate?: number;
  otHours?: number;
  otRate?: number;
}

export interface IInvoice {
  _id?: any;
  invoiceNumber: string;
  invoiceType?: 'Monthly Agreement' | 'Daily / Short-term Hire' | 'Standard';
  customer?: mongoose.Types.ObjectId;
  customerCompany?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  project?: mongoose.Types.ObjectId;
  projectName?: string;
  contract?: mongoose.Types.ObjectId;
  contractNumber?: string;
  billingMonth?: string; // e.g. "2026-04"
  bookingRef?: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentTerms: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    vehicleReg: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    chargeType: {
      type: String,
      enum: ['Monthly Basic Hire', 'Extra Kilometres', 'Overtime', 'Fuel', 'Driver', 'Daily Hire', 'Other'],
      default: 'Monthly Basic Hire',
    },
    includedKm: { type: Number, default: 0 },
    actualKm: { type: Number, default: 0 },
    billableExtraKm: { type: Number, default: 0 },
    extraKmRate: { type: Number, default: 0 },
    otHours: { type: Number, default: 0 },
    otRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: {
      type: String,
      enum: ['Monthly Agreement', 'Daily / Short-term Hire', 'Standard'],
      default: 'Monthly Agreement',
    },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerCompany: { type: Schema.Types.ObjectId, ref: 'CustomerCompany' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    contract: { type: Schema.Types.ObjectId, ref: 'Contract' },
    contractNumber: { type: String },
    billingMonth: { type: String },
    bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking' },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Issued',
    },
    paymentTerms: { type: String, default: 'Net 15 days. Payable by Bank Transfer or Cheque.' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
