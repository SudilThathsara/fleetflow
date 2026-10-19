import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
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
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { assignedVehicleReg: { $regex: search, $options: 'i' } },
        { assignedDriverName: { $regex: search, $options: 'i' } },
        { pickupLocation: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const bookings = await Booking.find(query).sort({ pickupDate: -1 });
    return NextResponse.json({ success: true, count: bookings.length, data: bookings });
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

    if (!body.bookingId) {
      const count = await Booking.countDocuments();
      body.bookingId = `BK-${String(count + 1).padStart(4, '0')}`;
    }

    // Vehicle conflict check if vehicle assigned
    if (body.assignedVehicle && body.pickupDate && body.returnDate) {
      const conflict = await Booking.findOne({
        assignedVehicle: body.assignedVehicle,
        status: { $in: ['Confirmed', 'Assigned', 'In Progress'] },
        $or: [
          { pickupDate: { $lte: new Date(body.returnDate) }, returnDate: { $gte: new Date(body.pickupDate) } },
        ],
      });
      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            message: `Conflict detected: Assigned vehicle is already booked on ${conflict.bookingId} (${new Date(
              conflict.pickupDate
            ).toLocaleDateString()} to ${new Date(conflict.returnDate).toLocaleDateString()})`,
          },
          { status: 400 }
        );
      }
    }

    const booking = await Booking.create(body);

    // If vehicle assigned and status in Confirmed / Assigned, update vehicle status
    if (body.assignedVehicle && ['Confirmed', 'Assigned'].includes(booking.status)) {
      await Vehicle.findByIdAndUpdate(body.assignedVehicle, { status: 'Booked' });
    }
    if (body.assignedDriver && ['Confirmed', 'Assigned'].includes(booking.status)) {
      await Driver.findByIdAndUpdate(body.assignedDriver, { status: 'Assigned' });
    }

    return NextResponse.json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
