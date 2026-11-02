import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Driver from '@/models/Driver';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const driver = await Driver.findById(id);
    if (!driver) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: driver });
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

    const updated = await Driver.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Driver updated successfully', data: updated });
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
    const deleted = await Driver.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
