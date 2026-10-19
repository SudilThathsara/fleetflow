import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  expenseId: string;
  category:
    | 'Fuel'
    | 'Driver wages and allowances'
    | 'Third-party vehicle hire'
    | 'Maintenance'
    | 'Insurance'
    | 'Licence and permit costs'
    | 'Tolls and parking'
    | 'Office expenses'
    | 'Telephone and internet'
    | 'Equipment'
    | 'Other operating expenses';
  description: string;
  amount: number;
  date: Date;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  vehicle?: mongoose.Types.ObjectId;
  vehicleReg?: string;
  driver?: mongoose.Types.ObjectId;
  driverName?: string;
  supplier?: mongoose.Types.ObjectId;
  supplierName?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseId: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: [
        'Fuel',
        'Driver wages and allowances',
        'Third-party vehicle hire',
        'Maintenance',
        'Insurance',
        'Licence and permit costs',
        'Tolls and parking',
        'Office expenses',
        'Telephone and internet',
        'Equipment',
        'Other operating expenses',
      ],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'], default: 'Cash' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleReg: { type: String },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    driverName: { type: String },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    receiptNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
