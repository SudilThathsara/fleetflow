import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired password reset token. Please request a new link.' },
        { status: 400 }
      );
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
