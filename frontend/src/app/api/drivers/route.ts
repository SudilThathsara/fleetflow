import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Driver from '@/models/Driver';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
        { driverId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: drivers.length, data: drivers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.driverId) {
      const count = await Driver.countDocuments();
      body.driverId = `DRV-${String(count + 1).padStart(4, '0')}`;
    }

    const driver = await Driver.create(body);
    return NextResponse.json({ success: true, message: 'Driver registered successfully', data: driver });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
