import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'manager' | 'accountant' | 'operations' | 'maintenance' | 'auditor' | 'customer';
  phone?: string;
  status: 'active' | 'inactive';
  customerId?: mongoose.Types.ObjectId;
  customerCompanyId?: mongoose.Types.ObjectId;
  emailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'accountant', 'operations', 'maintenance', 'auditor', 'customer'],
      default: 'operations',
    },
    phone: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerCompanyId: { type: Schema.Types.ObjectId, ref: 'CustomerCompany' },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
