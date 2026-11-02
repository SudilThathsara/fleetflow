import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SparePart from '@/models/SparePart';
import InventoryTransaction from '@/models/InventoryTransaction';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const part = await SparePart.findById(id);
    if (!part) return NextResponse.json({ success: false, message: 'Spare part not found' }, { status: 404 });
    const transactions = await InventoryTransaction.find({ part: part._id }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: { part, transactions } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'maintenance', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await SparePart.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Spare part not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const deleted = await SparePart.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Spare part not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Spare part deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

