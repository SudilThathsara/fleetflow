import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DriverAdvance from '@/models/DriverAdvance';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');

    const query: any = {};
    if (driverId) query.driver = driverId;

    const advances = await DriverAdvance.find(query).sort({ date: -1 });
    return NextResponse.json({ success: true, count: advances.length, data: advances });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.advanceId) {
      const count = await DriverAdvance.countDocuments();
      body.advanceId = `ADV-${String(count + 1).padStart(4, '0')}`;
    }

    body.amount = Number(body.amount) || 0;
    body.appliedAmount = 0;
    body.remainingBalance = body.amount;

    const advance = await DriverAdvance.create(body);
    return NextResponse.json({ success: true, message: 'Driver advance recorded', data: advance });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
