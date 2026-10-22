import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';
import { requireCustomerAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const dbUser = await User.findById(user?.id).select('-passwordHash');
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const customer = await Customer.findOne({ email: dbUser.email });

    return NextResponse.json({
      success: true,
      data: {
        user: dbUser,
        customer,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { name, phone, billingAddress, currentPassword, newPassword } = await req.json();

    const dbUser = await User.findById(user?.id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update basic profile fields
    if (name) dbUser.name = name.trim();
    if (phone) dbUser.phone = phone.trim();

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: 'Current password is required to set a new password.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, message: 'New password must be at least 6 characters.' }, { status: 400 });
      }
      dbUser.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await dbUser.save();

    // Update customer entity
    const customer = await Customer.findOne({ email: dbUser.email });
    if (customer) {
      if (name) customer.name = name.trim();
      if (phone) customer.phone = phone.trim();
      if (billingAddress) customer.billingAddress = billingAddress.trim();
      await customer.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        emailVerified: dbUser.emailVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
