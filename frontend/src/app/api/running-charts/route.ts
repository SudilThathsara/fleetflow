import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RunningChartEntry from '@/models/RunningChartEntry';
import Vehicle from '@/models/Vehicle';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const monthYear = searchParams.get('monthYear'); // e.g. "2026-10"
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');

    const query: any = {};
    if (monthYear) query.monthYear = monthYear;
    if (vehicleId) query.vehicle = vehicleId;
    if (driverId) query.driver = driverId;

    const entries = await RunningChartEntry.find(query).sort({ date: -1 });

    // Compute aggregations
    const totals = entries.reduce(
      (acc, curr) => {
        acc.totalKm += curr.totalKm || 0;
        acc.totalRevenue += curr.revenue || 0;
        acc.totalFuelCost += curr.fuelCost || 0;
        acc.totalAllowances += curr.allowances || 0;
        acc.totalTolls += curr.tollCharges || 0;
        acc.totalParking += curr.parkingCost || 0;
        acc.totalOtherExpenses += curr.otherExpenses || 0;
        return acc;
      },
      {
        totalKm: 0,
        totalRevenue: 0,
        totalFuelCost: 0,
        totalAllowances: 0,
        totalTolls: 0,
        totalParking: 0,
        totalOtherExpenses: 0,
      }
    );

    const netOperationalProfit =
      totals.totalRevenue -
      (totals.totalFuelCost +
        totals.totalAllowances +
        totals.totalTolls +
        totals.totalParking +
        totals.totalOtherExpenses);

    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
      summary: {
        ...totals,
        netOperationalProfit,
      },
    });
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

    const startOdo = Number(body.startOdometer);
    const endOdo = Number(body.endOdometer);

    if (endOdo < startOdo) {
      return NextResponse.json(
        { success: false, message: 'Validation error: End odometer reading cannot be less than start odometer reading!' },
        { status: 400 }
      );
    }

    body.totalKm = endOdo - startOdo;

    const entryDate = new Date(body.date || Date.now());
    body.monthYear = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

    if (!body.entryId) {
      const count = await RunningChartEntry.countDocuments();
      body.entryId = `RC-${String(count + 1).padStart(5, '0')}`;
    }

    const entry = await RunningChartEntry.create(body);

    // Update vehicle's current odometer if new entry's end odometer is higher
    if (body.vehicle) {
      const v = await Vehicle.findById(body.vehicle);
      if (v && endOdo > v.currentOdometer) {
        await Vehicle.findByIdAndUpdate(body.vehicle, { currentOdometer: endOdo });
      }
    }

    return NextResponse.json({ success: true, message: 'Running chart entry recorded', data: entry });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
