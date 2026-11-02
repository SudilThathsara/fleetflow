import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Quotation from '@/models/Quotation';
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
    if (user?.email) {
      orConditions.push({ customerEmail: user.email.toLowerCase() });
    }

    const query: any = orConditions.length > 0 ? { $or: orConditions } : { _id: null };

    const quotations = await Quotation.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: quotations.length, data: quotations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
