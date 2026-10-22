import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';
import { signToken, getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: cleanEmail });

    // Auto-create super admin if no users exist in database yet
    const count = await User.countDocuments();
    if (count === 0 && cleanEmail === 'admin@fleetflow.lk') {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        name: 'Super Administrator',
        email: 'admin@fleetflow.lk',
        passwordHash,
        role: 'super_admin',
        phone: '+94 77 123 4567',
        status: 'active',
        emailVerified: true,
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials. Please verify your email and password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials. Please verify your email and password.' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ success: false, message: 'This account has been deactivated. Please contact support.' }, { status: 403 });
    }

    // Determine redirect destination based on role
    const isCustomer = user.role === 'customer';
    const redirectUrl = isCustomer ? '/portal' : '/dashboard';

    const token = signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      customerId: user.customerId?.toString(),
      customerCompanyId: user.customerCompanyId?.toString(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      redirectUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        customerId: user.customerId,
        customerCompanyId: user.customerCompanyId,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ success: true, user: auth });
}
