import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientUser?: mongoose.Types.ObjectId;
  recipientRole?: string;
  title: string;
  message: string;
  type: 'enquiry' | 'quote_request' | 'quote_ready' | 'booking_request' | 'booking_confirmed' | 'invoice' | 'payment' | 'support';
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUser: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['enquiry', 'quote_request', 'quote_ready', 'booking_request', 'booking_confirmed', 'invoice', 'payment', 'support'],
      default: 'enquiry',
    },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientUser: 1, read: 1 });
NotificationSchema.index({ recipientRole: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
