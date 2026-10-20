import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPostDraft {
  _id?: any;
  postId: string;
  templateId?: string;
  title: string;
  vehicleType: string;
  hireType: string;
  rateText: string;
  kmAllowanceText: string;
  extraKmRateText: string;
  driverAvailability: string;
  fuelArrangement: string;
  location: string;
  destination?: string;
  eventDate?: string;
  contactNumber: string;
  companyName: string;
  specialConditions?: string;
  caption: string;
  imageTheme: 'Emerald' | 'Navy' | 'Ruby' | 'Amber' | 'Charcoal';
  bannerHeadline: string;
  badgeText: string;
  status: 'Draft' | 'Ready to Share' | 'Scheduled Internally' | 'Published' | 'Failed' | 'Archived';
  targetGroups?: string[];
  intendedPublicationDate?: Date;
  publishedUrl?: string;
  publishedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SocialPostDraftSchema = new Schema<ISocialPostDraft>(
  {
    postId: { type: String, required: true, unique: true },
    templateId: { type: String },
    title: { type: String, required: true },
    vehicleType: { type: String, required: true, default: 'Toyota Hilux 4x4 Double Cab' },
    hireType: { type: String, default: 'Monthly Corporate Hire' },
    rateText: { type: String, default: 'LKR 260,000 / month' },
    kmAllowanceText: { type: String, default: '3,000 KM Included / Month' },
    extraKmRateText: { type: String, default: 'LKR 110 per Extra KM' },
    driverAvailability: { type: String, default: 'Experienced Professional Driver' },
    fuelArrangement: { type: String, default: 'Customer Fuel / Reimbursed Fuel Options' },
    location: { type: String, default: 'Colombo & Island-wide Route' },
    destination: { type: String },
    eventDate: { type: String },
    contactNumber: { type: String, default: '+94 77 123 4567 / +94 71 987 6543' },
    companyName: { type: String, default: 'FleetFlow Lanka Tourism & Transport' },
    specialConditions: { type: String, default: 'Corporate long-term contract & 2-day short hire available' },
    caption: { type: String, required: true },
    imageTheme: {
      type: String,
      enum: ['Emerald', 'Navy', 'Ruby', 'Amber', 'Charcoal'],
      default: 'Emerald',
    },
    bannerHeadline: { type: String, default: 'DOUBLE CAB HIRE AVAILABLE' },
    badgeText: { type: String, default: '3,000 KM INCLUDED' },
    status: {
      type: String,
      enum: ['Draft', 'Ready to Share', 'Scheduled Internally', 'Published', 'Failed', 'Archived'],
      default: 'Draft',
    },
    targetGroups: [{ type: String }],
    intendedPublicationDate: { type: Date },
    publishedUrl: { type: String },
    publishedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SocialPostDraft ||
  mongoose.model<ISocialPostDraft>('SocialPostDraft', SocialPostDraftSchema);
