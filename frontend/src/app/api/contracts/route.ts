import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contract from '@/models/Contract';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const contracts = await Contract.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: contracts.length, data: contracts });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();
    const count = await Contract.countDocuments();
    const contractId = body.contractId || `CNT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const rateCard = body.rateCard || {
      version: 1,
      effectiveFrom: body.startDate || new Date(),
      monthlyBasicHireRate: 250000,
      includedMonthlyKm: 3000,
      extraKmRate: 100,
      driverServiceIncluded: true,
      fuelIncluded: false,
      normalWorkingHours: 8,
      overtimeHourlyRate: 600,
    };
    const newContract = await Contract.create({
      ...body,
      contractId,
      rateCard,
      rateVersions: [rateCard],
    });
    return NextResponse.json({ success: true, data: newContract }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

