import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialGroup extends Document {
  groupId: string;
  name: string;
  platform: 'Facebook' | 'WhatsApp' | 'Telegram' | 'Ikman' | 'Other';
  url: string;
  area: string;
  category: 'Transport & Hire' | 'Drivers Job Forum' | 'Vehicle Sales & Rent' | 'Tour & Travel' | 'General';
  postingRules?: string;
  memberCount?: number;
  lastPostedDate?: Date;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialGroupSchema = new Schema<ISocialGroup>(
  {
    groupId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    platform: {
      type: String,
      enum: ['Facebook', 'WhatsApp', 'Telegram', 'Ikman', 'Other'],
      default: 'Facebook',
    },
    url: { type: String, required: true },
    area: { type: String, default: 'Colombo & Western Province' },
    category: {
      type: String,
      enum: ['Transport & Hire', 'Drivers Job Forum', 'Vehicle Sales & Rent', 'Tour & Travel', 'General'],
      default: 'Transport & Hire',
    },
    postingRules: { type: String },
    memberCount: { type: Number, default: 0 },
    lastPostedDate: { type: Date },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SocialGroup ||
  mongoose.model<ISocialGroup>('SocialGroup', SocialGroupSchema);
