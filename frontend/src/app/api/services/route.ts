import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import VehicleService from '@/models/VehicleService';
import Vehicle from '@/models/Vehicle';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const category = searchParams.get('category');

    const query: any = {};
    if (vehicleId) query.vehicle = vehicleId;
    if (category) query.serviceCategory = category;

    const services = await VehicleService.find(query).sort({ serviceDate: -1 });
    return NextResponse.json({ success: true, count: services.length, data: services });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'maintenance', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.serviceId) {
      const count = await VehicleService.countDocuments();
      body.serviceId = `SRV-${String(count + 1).padStart(4, '0')}`;
    }

    body.totalCost = (Number(body.labourCost) || 0) + (Number(body.sparePartsCost) || 0) + (Number(body.otherCharges) || 0);

    const service = await VehicleService.create(body);

    // Update vehicle's service intervals and odometer
    if (body.vehicle) {
      const v = await Vehicle.findById(body.vehicle);
      if (v) {
        const updateData: any = {
          lastServiceOdometer: Number(body.odometerReading) || v.currentOdometer,
        };
        if (body.nextServiceOdometer) {
          updateData.nextServiceOdometer = Number(body.nextServiceOdometer);
        } else {
          updateData.nextServiceOdometer = (Number(body.odometerReading) || v.currentOdometer) + (v.serviceIntervalKm || 5000);
        }
        if (body.nextServiceDate) {
          updateData.nextServiceDate = new Date(body.nextServiceDate);
        }
        await Vehicle.findByIdAndUpdate(body.vehicle, updateData);
      }
    }

    return NextResponse.json({ success: true, message: 'Vehicle service record saved', data: service });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
