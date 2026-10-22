import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketResponse {
  sender: string;
  senderRole: string;
  message: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  category: 'Quotation' | 'Booking' | 'Invoice' | 'Payment' | 'General';
  relatedReference?: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  responses: ITicketResponse[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketResponseSchema = new Schema<ITicketResponse>(
  {
    sender: { type: String, required: true },
    senderRole: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    category: {
      type: String,
      enum: ['Quotation', 'Booking', 'Invoice', 'Payment', 'General'],
      default: 'General',
    },
    relatedReference: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    responses: [TicketResponseSchema],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ ticketId: 1 });
SupportTicketSchema.index({ user: 1 });
SupportTicketSchema.index({ status: 1 });

export default mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
