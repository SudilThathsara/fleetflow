import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction {
  _id?: any;
  transactionId: string;
  part: mongoose.Types.ObjectId;
  sku: string;
  partName: string;
  type: 'PURCHASE_RECEIPT' | 'ISSUED_TO_SERVICE' | 'RETURNED_TO_STOCK' | 'ADJUSTMENT' | 'DAMAGED_LOST';
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock: number;
  newStock: number;
  vehicle?: mongoose.Types.ObjectId;
  vehicleReg?: string;
  serviceJob?: mongoose.Types.ObjectId;
  reference?: string;
  date: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    part: { type: Schema.Types.ObjectId, ref: 'SparePart', required: true },
    sku: { type: String, required: true },
    partName: { type: String, required: true },
    type: {
      type: String,
      enum: ['PURCHASE_RECEIPT', 'ISSUED_TO_SERVICE', 'RETURNED_TO_STOCK', 'ADJUSTMENT', 'DAMAGED_LOST'],
      required: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true, default: 0 },
    totalCost: { type: Number, required: true, default: 0 },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleReg: { type: String },
    serviceJob: { type: Schema.Types.ObjectId, ref: 'VehicleService' },
    reference: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.InventoryTransaction ||
  mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
