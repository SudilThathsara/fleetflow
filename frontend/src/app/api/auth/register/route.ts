import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import Notification from '@/models/Notification';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, getVerificationEmailHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, phone, companyName, billingAddress } = body;

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide full name, email, phone number, and password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token (expiring in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 1. Create Customer record in existing Customer collection
    const customerCount = await Customer.countDocuments();
    const customerId = `CUST-${String(customerCount + 101).padStart(4, '0')}`;
    
    const newCustomer = await Customer.create({
      customerId,
      name: name.trim(),
      companyName: companyName?.trim() || '',
      phone: phone.trim(),
      email: cleanEmail,
      billingAddress: billingAddress?.trim() || 'Standard Delivery / Pickup Address',
      customerCategory: companyName ? 'Corporate' : 'Individual',
      status: 'Active',
      outstandingBalance: 0,
    });

    // 2. Create User record with role strictly forced to 'customer'
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'customer', // strictly customer - never admin
      phone: phone.trim(),
      status: 'active',
      customerId: newCustomer._id,
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    // Link customer to user
    newCustomer.userId = newUser._id;
    await newCustomer.save();

    // 3. Create Welcome Notification
    await Notification.create({
      recipientUser: newUser._id,
      title: 'Welcome to Tourism & Transport!',
      message: 'Your customer portal account is ready. You can request quotations, track vehicle hires, and view invoices.',
      type: 'enquiry',
      link: '/portal',
    });

    // 4. Send Verification Email
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`;
    
    await sendEmail({
      to: cleanEmail,
      subject: 'Verify Your Customer Account — Tourism & Transport',
      html: getVerificationEmailHtml(name.trim(), verifyUrl),
      type: 'verification',
    });

    return NextResponse.json({
      success: true,
      message: 'Customer account registered successfully! A verification link has been sent to your email address.',
      userId: newUser._id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Registration failed' }, { status: 500 });
  }
}
