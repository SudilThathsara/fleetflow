import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RunningChartEntry from '@/models/RunningChartEntry';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.startOdometer && body.endOdometer) {
      const startOdo = Number(body.startOdometer);
      const endOdo = Number(body.endOdometer);
      if (endOdo < startOdo) {
        return NextResponse.json(
          { success: false, message: 'End odometer cannot be less than start odometer' },
          { status: 400 }
        );
      }
      body.totalKm = endOdo - startOdo;
    }

    const updated = await RunningChartEntry.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Entry updated successfully', data: updated });
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
    const deleted = await RunningChartEntry.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
