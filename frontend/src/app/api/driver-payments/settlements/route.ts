import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DriverSettlement from '@/models/DriverSettlement';
import DriverAdvance from '@/models/DriverAdvance';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');

    const query: any = {};
    if (driverId) query.driver = driverId;
    if (status) query.status = status;

    const settlements = await DriverSettlement.find(query).sort({ periodEnd: -1 });
    return NextResponse.json({ success: true, count: settlements.length, data: settlements });
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

    if (!body.settlementId) {
      const count = await DriverSettlement.countDocuments();
      body.settlementId = `SETTLE-${String(count + 1).padStart(4, '0')}`;
    }

    const gross = Number(body.grossEarnings) || 0;
    const allowances = Number(body.allowances) || 0;
    const deductions = Number(body.deductions) || 0;
    const appliedAdvances = Number(body.appliedAdvances) || 0;

    // Net payable formula
    body.netPayable = Math.max(0, gross + allowances - deductions - appliedAdvances);
    body.paidAmount = Number(body.paidAmount) || 0;
    body.remainingBalance = Math.max(0, body.netPayable - body.paidAmount);

    if (body.remainingBalance === 0 && body.paidAmount > 0) {
      body.status = 'Paid';
    } else if (body.paidAmount > 0) {
      body.status = 'Partially Paid';
    }

    const settlement = await DriverSettlement.create(body);

    // If advances were applied, update remaining balance of advances for this driver
    if (appliedAdvances > 0 && body.driver) {
      let unallocated = appliedAdvances;
      const advances = await DriverAdvance.find({
        driver: body.driver,
        remainingBalance: { $gt: 0 },
      }).sort({ date: 1 });

      for (const adv of advances) {
        if (unallocated <= 0) break;
        const deduct = Math.min(adv.remainingBalance, unallocated);
        adv.appliedAmount += deduct;
        adv.remainingBalance -= deduct;
        if (adv.remainingBalance === 0) adv.status = 'Fully Applied';
        else adv.status = 'Partially Applied';
        await adv.save();
        unallocated -= deduct;
      }
    }

    return NextResponse.json({ success: true, message: 'Driver settlement calculated and recorded', data: settlement });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
