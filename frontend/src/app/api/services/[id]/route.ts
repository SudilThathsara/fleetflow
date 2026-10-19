import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import VehicleService from '@/models/VehicleService';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'maintenance']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.labourCost !== undefined || body.sparePartsCost !== undefined || body.otherCharges !== undefined) {
      body.totalCost = (Number(body.labourCost) || 0) + (Number(body.sparePartsCost) || 0) + (Number(body.otherCharges) || 0);
    }

    const updated = await VehicleService.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Service record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Service updated successfully', data: updated });
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
    const deleted = await VehicleService.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Service record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Service record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
