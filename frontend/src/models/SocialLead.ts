import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLead extends Document {
  leadId: string;
  leadType: 'Vehicle' | 'Driver' | 'Vehicle Owner' | 'Transport Job' | 'Customer Enquiry' | 'Other';
  name: string;
  phone: string;
  vehicleType?: string;
  vehicleReg?: string;
  serviceAreas?: string;
  expectedRate?: number;
  sourcePlatform: 'Facebook' | 'WhatsApp' | 'Ikman' | 'Recommendation' | 'Other';
  sourceGroup?: string;
  postUrl?: string;
  status:
    | 'New'
    | 'Contacted'
    | 'Awaiting Response'
    | 'Negotiating'
    | 'Verified'
    | 'Converted'
    | 'Rejected';
  convertedTo?: 'Vehicle' | 'Driver' | 'Supplier' | 'Customer' | 'Booking';
  convertedRecordId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLeadSchema = new Schema<ISocialLead>(
  {
    leadId: { type: String, required: true, unique: true },
    leadType: {
      type: String,
      enum: ['Vehicle', 'Driver', 'Vehicle Owner', 'Transport Job', 'Customer Enquiry', 'Other'],
      default: 'Vehicle',
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String },
    vehicleReg: { type: String, uppercase: true },
    serviceAreas: { type: String },
    expectedRate: { type: Number, default: 0 },
    sourcePlatform: {
      type: String,
      enum: ['Facebook', 'WhatsApp', 'Ikman', 'Recommendation', 'Other'],
      default: 'Facebook',
    },
    sourceGroup: { type: String },
    postUrl: { type: String },
    status: {
      type: String,
      enum: [
        'New',
        'Contacted',
        'Awaiting Response',
        'Negotiating',
        'Verified',
        'Converted',
        'Rejected',
      ],
      default: 'New',
    },
    convertedTo: {
      type: String,
      enum: ['Vehicle', 'Driver', 'Supplier', 'Customer', 'Booking'],
    },
    convertedRecordId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

SocialLeadSchema.index({ phone: 1 });
SocialLeadSchema.index({ vehicleReg: 1 });

export default mongoose.models.SocialLead || mongoose.model<ISocialLead>('SocialLead', SocialLeadSchema);
