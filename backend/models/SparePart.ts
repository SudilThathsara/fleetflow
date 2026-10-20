import mongoose, { Schema, Document } from 'mongoose';

export interface ISparePart {
  _id?: any;
  partId: string;
  sku: string;
  name: string;
  category: 'Lubricants & Fluids' | 'Filters' | 'Braking System' | 'Tyres & Wheels' | 'Suspension' | 'Electrical & Battery' | 'Engine Parts' | 'General';
  brand: string;
  partNumber?: string;
  compatibleVehicles: string; // e.g. "Toyota Hilux Vigo, Revo, Hiace KDH"
  unitOfMeasure: 'Liters' | 'Units' | 'Sets' | 'Bottles' | 'Pcs' | 'Pairs';
  currentStock: number;
  minStockLevel: number;
  reorderQuantity: number;
  unitCost: number;
  preferredSupplier?: mongoose.Types.ObjectId;
  supplierName?: string;
  storageLocation?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SparePartSchema = new Schema<ISparePart>(
  {
    partId: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Lubricants & Fluids', 'Filters', 'Braking System', 'Tyres & Wheels', 'Suspension', 'Electrical & Battery', 'Engine Parts', 'General'],
      default: 'General',
    },
    brand: { type: String, required: true },
    partNumber: { type: String },
    compatibleVehicles: { type: String, required: true, default: 'All Fleet Models' },
    unitOfMeasure: { type: String, enum: ['Liters', 'Units', 'Sets', 'Bottles', 'Pcs', 'Pairs'], default: 'Units' },
    currentStock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 2 },
    reorderQuantity: { type: Number, default: 5 },
    unitCost: { type: Number, required: true, default: 0 },
    preferredSupplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    storageLocation: { type: String, default: 'Main Garage Shelf A-1' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SparePart || mongoose.model<ISparePart>('SparePart', SparePartSchema);
