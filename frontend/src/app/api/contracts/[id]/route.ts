import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contract from '@/models/Contract';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const contract = await Contract.findById(id);
    if (!contract) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: contract });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Contract.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
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
    const deleted = await Contract.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

