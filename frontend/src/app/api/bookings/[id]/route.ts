import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import RunningChartEntry from '@/models/RunningChartEntry';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: booking });
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

    const oldBooking = await Booking.findById(id);
    if (!oldBooking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Auto-calculate distance if start and end odometer are provided
    if (body.startOdometer && body.endOdometer) {
      body.totalKm = Math.max(0, Number(body.endOdometer) - Number(body.startOdometer));
    }

    const updated = await Booking.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    // Handle status transitions
    if (body.status === 'Completed' && oldBooking.status !== 'Completed') {
      // 1. Release vehicle and update odometer
      if (updated.assignedVehicle) {
        const vUpdate: any = { status: 'Available' };
        if (updated.endOdometer) {
          vUpdate.currentOdometer = updated.endOdometer;
        }
        await Vehicle.findByIdAndUpdate(updated.assignedVehicle, vUpdate);
      }
      // 2. Release driver
      if (updated.assignedDriver) {
        await Driver.findByIdAndUpdate(updated.assignedDriver, { status: 'Available' });
      }

      // 3. Create or sync RunningChartEntry
      if (updated.assignedVehicle && updated.assignedDriver && updated.startOdometer && updated.endOdometer) {
        const dateObj = new Date(updated.pickupDate);
        const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        const count = await RunningChartEntry.countDocuments();

        await RunningChartEntry.create({
          entryId: `RC-${String(count + 1).padStart(5, '0')}`,
          date: updated.pickupDate,
          monthYear,
          vehicle: updated.assignedVehicle,
          vehicleReg: updated.assignedVehicleReg || 'N/A',
          driver: updated.assignedDriver,
          driverName: updated.assignedDriverName || 'N/A',
          customerName: updated.customerName,
          bookingRef: updated._id,
          startLocation: updated.pickupLocation,
          destination: updated.destination,
          startOdometer: updated.startOdometer,
          endOdometer: updated.endOdometer,
          totalKm: updated.totalKm || (updated.endOdometer - updated.startOdometer),
          revenue: updated.agreedPrice || 0,
          fuelCost: updated.actualFuelCost || 0,
          otherExpenses: updated.actualOtherExpenses || 0,
          notes: `Auto-generated from completed booking ${updated.bookingId}`,
          status: 'Approved',
        });
      }
    } else if (body.status === 'Cancelled') {
      if (updated.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(updated.assignedVehicle, { status: 'Available' });
      }
      if (updated.assignedDriver) {
        await Driver.findByIdAndUpdate(updated.assignedDriver, { status: 'Available' });
      }
    }

    return NextResponse.json({ success: true, message: 'Booking updated successfully', data: updated });
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
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
