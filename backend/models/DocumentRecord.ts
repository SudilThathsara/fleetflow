import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentRecord extends Document {
  docId: string;
  targetType: 'Vehicle' | 'Driver';
  targetId: mongoose.Types.ObjectId;
  targetIdentifier: string; // Reg No or Driver Name
  documentType:
    | 'Insurance'
    | 'Revenue Licence'
    | 'Emission Test Certificate'
    | 'Fitness Certificate'
    | 'Driving Licence'
    | 'Permit'
    | 'Contract'
    | 'Other';
  referenceNumber: string;
  issueDate?: Date;
  expiryDate: Date;
  fileUrl?: string;
  notes?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRecordSchema = new Schema<IDocumentRecord>(
  {
    docId: { type: String, required: true, unique: true },
    targetType: { type: String, enum: ['Vehicle', 'Driver'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetIdentifier: { type: String, required: true },
    documentType: {
      type: String,
      enum: [
        'Insurance',
        'Revenue Licence',
        'Emission Test Certificate',
        'Fitness Certificate',
        'Driving Licence',
        'Permit',
        'Contract',
        'Other',
      ],
      required: true,
    },
    referenceNumber: { type: String, required: true },
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    fileUrl: { type: String },
    notes: { type: String },
    verificationStatus: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Verified' },
  },
  { timestamps: true }
);

DocumentRecordSchema.index({ expiryDate: 1 });

export default mongoose.models.DocumentRecord ||
  mongoose.model<IDocumentRecord>('DocumentRecord', DocumentRecordSchema);
