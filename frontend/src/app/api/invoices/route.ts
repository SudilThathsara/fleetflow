import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const invoices = await Invoice.find(query).sort({ issueDate: -1 });
    return NextResponse.json({ success: true, count: invoices.length, data: invoices });
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

    if (!body.invoiceNumber) {
      const count = await Invoice.countDocuments();
      body.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    if (body.items && Array.isArray(body.items)) {
      body.subtotal = body.items.reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        0
      );
      body.totalAmount = Math.max(0, body.subtotal - (Number(body.discount) || 0) + (Number(body.taxAmount) || 0));
    }

    body.paidAmount = Number(body.paidAmount) || 0;
    body.balanceDue = Math.max(0, body.totalAmount - body.paidAmount);

    if (body.balanceDue === 0 && body.totalAmount > 0) {
      body.status = 'Paid';
    } else if (body.paidAmount > 0) {
      body.status = 'Partially Paid';
    } else {
      body.status = 'Issued';
    }

    const invoice = await Invoice.create(body);

    // Update customer's outstanding balance
    if (body.customer && body.balanceDue > 0) {
      await Customer.findByIdAndUpdate(body.customer, {
        $inc: { outstandingBalance: body.balanceDue },
      });
    }

    return NextResponse.json({ success: true, message: 'Invoice created successfully', data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
