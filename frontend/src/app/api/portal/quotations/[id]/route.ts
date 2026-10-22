import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Quotation from '@/models/Quotation';
import Customer from '@/models/Customer';
import Notification from '@/models/Notification';
import { requireCustomerAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();

    const { action, notes } = await req.json();
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid quotation action.' }, { status: 400 });
    }

    const customer = await Customer.findOne({ email: user?.email.toLowerCase() });

    const quotation = await Quotation.findOne({
      _id: id,
      $or: [
        ...(customer ? [{ customer: customer._id }] : []),
        { customerEmail: user?.email.toLowerCase() },
      ],
    });

    if (!quotation) {
      return NextResponse.json({ success: false, message: 'Quotation not found or unauthorized.' }, { status: 404 });
    }

    const newStatus = action === 'accept' ? 'Accepted' : 'Rejected';
    quotation.status = newStatus;
    if (notes) {
      quotation.notes = (quotation.notes ? quotation.notes + '\n' : '') + `[Customer ${newStatus} on ${new Date().toISOString()}]: ${notes}`;
    }
    await quotation.save();

    // Notify operations/management
    await Notification.create({
      recipientRole: 'manager',
      title: `Quotation ${quotation.quotationNumber} ${newStatus}!`,
      message: `${user?.name} has ${newStatus.toLowerCase()} quotation ${quotation.quotationNumber} (LKR ${quotation.totalAmount.toLocaleString()}).`,
      type: 'quote_ready',
      link: '/quotations',
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} has been marked as ${newStatus}. Our team has been notified.`,
      data: quotation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
