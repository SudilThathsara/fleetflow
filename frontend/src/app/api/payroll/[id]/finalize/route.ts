import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PayrollPeriod from '@/models/PayrollPeriod';
import DriverAdvance from '@/models/DriverAdvance';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const period = await PayrollPeriod.findById(id);
    if (!period) return NextResponse.json({ success: false, message: 'Payroll period not found' }, { status: 404 });

    period.status = 'Finalized';
    period.approvedAt = new Date();
    period.approvedBy = body.approvedBy || 'Admin';

    // Apply advance deductions in DriverAdvance ledger
    for (const entry of period.entries) {
      if (entry.advancesDeducted > 0) {
        const advances = await DriverAdvance.find({ driver: entry.driver, remainingBalance: { $gt: 0 } });
        let toDeduct = entry.advancesDeducted;
        for (const adv of advances) {
          if (toDeduct <= 0) break;
          const ded = Math.min(adv.remainingBalance, toDeduct);
          adv.appliedAmount += ded;
          adv.remainingBalance -= ded;
          if (adv.remainingBalance === 0) adv.status = 'Fully Applied';
          else adv.status = 'Partially Applied';
          adv.repayments.push({
            date: new Date(),
            amount: ded,
            payrollMonth: period.monthYear,
            notes: `Deducted via Payroll ${period.monthYear}`,
          });
          await adv.save();
          toDeduct -= ded;
        }
      }
    }

    await period.save();
    return NextResponse.json({ success: true, message: 'Payroll period finalized and advance ledgers updated', data: period });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
