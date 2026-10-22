import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
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
        ...(user?.customerCompanyId ? [{ customerCompany: user.customerCompanyId }] : []),
        { customerPhone: customer?.phone || 'none' },
      ],
    };

    const invoices = await Invoice.find(query).sort({ issueDate: -1 });
    return NextResponse.json({ success: true, count: invoices.length, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
