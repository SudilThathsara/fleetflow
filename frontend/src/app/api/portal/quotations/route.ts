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
    const customer = await Customer.findOne({ email: user?.email.toLowerCase() });

    const query: any = {
      $or: [
        ...(customer ? [{ customer: customer._id }] : []),
        { customerEmail: user?.email.toLowerCase() },
      ],
    };

    const quotations = await Quotation.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: quotations.length, data: quotations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
