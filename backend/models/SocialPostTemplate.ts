import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPostTemplate {
  _id?: any;
  templateId: string;
  title: string;
  category:
    | 'Double Cab Availability'
    | 'Van Availability'
    | 'Vehicle Hire Advertisements'
    | 'Driver Recruitment'
    | 'Vehicle Requirements'
    | 'Driver Requirements'
    | 'Tourism & Travel Services'
    | 'Transport Jobs'
    | 'Monthly Corporate Hire'
    | 'Daily 2-Day Tour Hire';
  vehicleType: string;
  defaultRate: string;
  defaultAllowance: string;
  defaultCaptionTemplate: string;
  bannerHeadline: string;
  badgeText: string;
  imageTheme: 'Emerald' | 'Navy' | 'Ruby' | 'Amber' | 'Charcoal';
  status: 'Active' | 'Archived';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SocialPostTemplateSchema = new Schema<ISocialPostTemplate>(
  {
    templateId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Double Cab Availability',
        'Van Availability',
        'Vehicle Hire Advertisements',
        'Driver Recruitment',
        'Vehicle Requirements',
        'Driver Requirements',
        'Tourism & Travel Services',
        'Transport Jobs',
        'Monthly Corporate Hire',
        'Daily 2-Day Tour Hire',
      ],
      required: true,
      default: 'Double Cab Availability',
    },
    vehicleType: { type: String, required: true, default: 'Toyota Hilux Double Cab' },
    defaultRate: { type: String, default: 'LKR 250,000 / month' },
    defaultAllowance: { type: String, default: '3,000 KM Included / Month' },
    defaultCaptionTemplate: {
      type: String,
      default:
        '🚗 {companyName} — Available for Immediate Hire!\n\n🔹 Vehicle: {vehicleType}\n🔹 Rate: {rateText}\n🔹 Included Mileage: {kmAllowanceText}\n🔹 Location: {location}\n🔹 Driver & Fuel: Professional Driver Provided\n\n📞 Call/WhatsApp: {contactNumber}\n🌐 FleetFlow Lanka Tourism & Transport Services',
    },
    bannerHeadline: { type: String, default: 'PREMIUM DOUBLE CAB HIRE' },
    badgeText: { type: String, default: '3,000 KM INCLUDED' },
    imageTheme: {
      type: String,
      enum: ['Emerald', 'Navy', 'Ruby', 'Amber', 'Charcoal'],
      default: 'Emerald',
    },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SocialPostTemplate ||
  mongoose.model<ISocialPostTemplate>('SocialPostTemplate', SocialPostTemplateSchema);
