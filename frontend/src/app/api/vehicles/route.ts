import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vehicleId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (type) query.vehicleType = type;

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: vehicles.length, data: vehicles });
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

    // Check duplicate registration
    const existing = await Vehicle.findOne({
      registrationNumber: body.registrationNumber.trim().toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Vehicle with registration ${body.registrationNumber} already exists!` },
        { status: 400 }
      );
    }

    // Auto-generate vehicleId if not provided
    if (!body.vehicleId) {
      const count = await Vehicle.countDocuments();
      body.vehicleId = `VEH-${String(count + 1).padStart(4, '0')}`;
    }

    body.registrationNumber = body.registrationNumber.trim().toUpperCase();
    if (!body.nextServiceOdometer && body.currentOdometer) {
      body.nextServiceOdometer = Number(body.currentOdometer) + (Number(body.serviceIntervalKm) || 5000);
    }

    const vehicle = await Vehicle.create(body);
    return NextResponse.json({ success: true, message: 'Vehicle registered successfully', data: vehicle });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
