import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import CompanySettings from '@/models/CompanySettings';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const invoiceId = searchParams.get('invoiceId');

    const query: any = {};
    if (customerId) query.customer = customerId;
    if (invoiceId) query.invoice = invoiceId;

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    return NextResponse.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.receiptNumber) {
      const count = await Payment.countDocuments();
      const settings = await CompanySettings.findOne();
      body.receiptNumber = `${settings?.receiptPrefix || `REC-${new Date().getFullYear()}-`}${String(count + 1).padStart(4, '0')}`;
    }

    const payAmount = Number(body.amount) || 0;
    const payment = await Payment.create(body);

    // Apply to invoice
    if (body.invoice) {
      const inv = await Invoice.findById(body.invoice);
      if (inv) {
        inv.paidAmount += payAmount;
        inv.balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);
        if (inv.balanceDue === 0) inv.status = 'Paid';
        else inv.status = 'Partially Paid';
        await inv.save();
      }
    }

    // Apply to customer's outstanding balance
    if (body.customer) {
      await Customer.findByIdAndUpdate(body.customer, {
        $inc: { outstandingBalance: -payAmount },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment received and receipt generated successfully',
      data: payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
