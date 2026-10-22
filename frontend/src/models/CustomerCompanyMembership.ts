import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerCompanyMembership extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerCompanyMembershipSchema = new Schema<ICustomerCompanyMembership>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'viewer'], default: 'viewer' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

CustomerCompanyMembershipSchema.index({ company: 1, user: 1 }, { unique: true });

export default mongoose.models.CustomerCompanyMembership ||
  mongoose.model<ICustomerCompanyMembership>('CustomerCompanyMembership', CustomerCompanyMembershipSchema);
