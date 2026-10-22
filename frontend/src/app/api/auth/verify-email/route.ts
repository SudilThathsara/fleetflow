import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ success: false, message: 'Invalid or missing verification credentials.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: cleanEmail,
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token. Please request a new verification link.' },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your email address has been successfully verified! You can now log in to access your portal.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
