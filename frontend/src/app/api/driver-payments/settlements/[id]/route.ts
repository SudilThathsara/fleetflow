import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DriverSettlement from '@/models/DriverSettlement';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const settlement = await DriverSettlement.findById(id);
    if (!settlement) {
      return NextResponse.json({ success: false, message: 'Settlement not found' }, { status: 404 });
    }

    if (body.addPayment) {
      const payAmount = Number(body.addPayment);
      settlement.paidAmount += payAmount;
      settlement.remainingBalance = Math.max(0, settlement.netPayable - settlement.paidAmount);
      if (settlement.remainingBalance === 0) {
        settlement.status = 'Paid';
      } else {
        settlement.status = 'Partially Paid';
      }
      if (body.paymentMethod) settlement.paymentMethod = body.paymentMethod;
      if (body.paymentReference) settlement.paymentReference = body.paymentReference;
      await settlement.save();
      return NextResponse.json({ success: true, message: 'Payment recorded against settlement', data: settlement });
    }

    const updated = await DriverSettlement.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, message: 'Settlement updated', data: updated });
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
    await DriverSettlement.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Settlement deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
