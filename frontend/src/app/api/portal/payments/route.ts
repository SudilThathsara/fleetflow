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
    const customer = await Customer.findOne({ email: user?.email.toLowerCase() });

    const query: any = {};
    if (customer) {
      query.customer = customer._id;
    } else {
      query.customerName = user?.name;
    }

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    return NextResponse.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
