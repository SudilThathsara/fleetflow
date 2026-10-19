import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.items && Array.isArray(body.items)) {
      body.subtotal = body.items.reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        0
      );
      body.totalAmount = Math.max(0, body.subtotal - (Number(body.discount) || 0) + (Number(body.taxAmount) || 0));
    }

    if (body.paidAmount !== undefined || body.totalAmount !== undefined) {
      const inv = await Invoice.findById(id);
      const total = body.totalAmount !== undefined ? Number(body.totalAmount) : inv.totalAmount;
      const paid = body.paidAmount !== undefined ? Number(body.paidAmount) : inv.paidAmount;
      body.balanceDue = Math.max(0, total - paid);
      if (body.balanceDue === 0) body.status = 'Paid';
      else if (paid > 0) body.status = 'Partially Paid';
    }

    const updated = await Invoice.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, message: 'Invoice updated', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const invoice = await Invoice.findById(id);
    if (invoice && invoice.customer && invoice.balanceDue > 0) {
      await Customer.findByIdAndUpdate(invoice.customer, {
        $inc: { outstandingBalance: -invoice.balanceDue },
      });
    }
    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
