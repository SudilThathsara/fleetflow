import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Please enter your account email address.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Neutral response whether user exists or not (prevent email enumeration)
    if (user && user.status === 'active') {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

      await sendEmail({
        to: cleanEmail,
        subject: 'Password Reset Request — Lanka Premier Transport',
        html: getPasswordResetEmailHtml(user.name, resetUrl),
        type: 'password_reset',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
