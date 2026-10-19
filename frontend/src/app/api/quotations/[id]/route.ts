import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Quotation from '@/models/Quotation';
import Booking from '@/models/Booking';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ success: false, message: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations', 'accountant']);
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

    // Convert quotation to booking
    if (body.convertToBooking) {
      const q = await Quotation.findById(id);
      if (!q) return NextResponse.json({ success: false, message: 'Quotation not found' }, { status: 404 });

      const bCount = await Booking.countDocuments();
      const newBooking = await Booking.create({
        bookingId: `BK-${String(bCount + 1).padStart(4, '0')}`,
        customer: q.customer,
        customerName: q.customerName,
        customerPhone: q.customerPhone,
        bookingSource: 'Direct',
        pickupLocation: 'Colombo',
        destination: q.items[0]?.description || 'Tour Route',
        pickupDate: new Date(),
        returnDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        vehicleType: q.items[0]?.vehicleType || 'Car',
        agreedPrice: q.totalAmount,
        status: 'Confirmed',
        notes: `Converted from Quotation ${q.quotationNumber}`,
      });

      q.status = 'Converted';
      await q.save();

      return NextResponse.json({
        success: true,
        message: 'Quotation converted into Booking successfully',
        booking: newBooking,
      });
    }

    const updated = await Quotation.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, message: 'Quotation updated', data: updated });
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
    await Quotation.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Quotation deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
