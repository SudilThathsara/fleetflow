import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteEnquiry extends Document {
  enquiryId: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType?: string;
  serviceCategory?: string;
  dateRange?: string;
  serviceArea?: string;
  message: string;
  source: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed';
  user?: mongoose.Types.ObjectId;
  ipAddress?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteEnquirySchema = new Schema<IWebsiteEnquiry>(
  {
    enquiryId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    vehicleType: { type: String },
    serviceCategory: { type: String },
    dateRange: { type: String },
    serviceArea: { type: String },
    message: { type: String, required: true },
    source: { type: String, default: 'Website Quick Enquiry' },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quoted', 'Closed'],
      default: 'New',
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

WebsiteEnquirySchema.index({ enquiryId: 1 });
WebsiteEnquirySchema.index({ status: 1 });
WebsiteEnquirySchema.index({ createdAt: -1 });

export default mongoose.models.WebsiteEnquiry ||
  mongoose.model<IWebsiteEnquiry>('WebsiteEnquiry', WebsiteEnquirySchema);
