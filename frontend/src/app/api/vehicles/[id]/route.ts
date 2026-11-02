import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: vehicle });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.registrationNumber) {
      body.registrationNumber = body.registrationNumber.trim().toUpperCase();
      const existing = await Vehicle.findOne({
        registrationNumber: body.registrationNumber,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Registration number ${body.registrationNumber} is already used by another vehicle` },
          { status: 400 }
        );
      }
    }

    const updated = await Vehicle.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Vehicle updated successfully', data: updated });
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
    const deleted = await Vehicle.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
