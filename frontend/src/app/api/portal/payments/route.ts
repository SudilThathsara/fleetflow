import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Customer from '@/models/Customer';
import { requireCustomerAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    let customer = null;
    if (user?.customerId) {
      customer = await Customer.findById(user.customerId);
    }
    if (!customer && user?.email) {
      customer = await Customer.findOne({ email: user.email.toLowerCase() });
    }

    const orConditions: any[] = [];
    if (customer) {
      orConditions.push({ customer: customer._id });
    }
    if (user?.name) {
      orConditions.push({ customerName: user.name });
    }

    const query: any = orConditions.length > 0 ? { $or: orConditions } : { _id: null };

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    return NextResponse.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
