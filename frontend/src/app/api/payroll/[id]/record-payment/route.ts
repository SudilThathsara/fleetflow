import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PayrollPeriod from '@/models/PayrollPeriod';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { driverId, amount, paymentReference, notes } = await req.json();

    const period = await PayrollPeriod.findById(id);
    if (!period) return NextResponse.json({ success: false, message: 'Payroll period not found' }, { status: 404 });

    const entry = period.entries.find((e: any) => e.driver.toString() === driverId);
    if (!entry) return NextResponse.json({ success: false, message: 'Driver entry not found in this payroll' }, { status: 404 });

    const payAmt = Number(amount);
    entry.amountPaid = (entry.amountPaid || 0) + payAmt;
    entry.remainingBalance = Math.max(0, entry.netSalary - entry.amountPaid);
    entry.paymentReference = paymentReference || 'Bank Transfer';
    entry.paymentDate = new Date();
    entry.notes = notes;

    if (entry.remainingBalance === 0) entry.paymentStatus = 'Paid';
    else if (entry.amountPaid > 0) entry.paymentStatus = 'Partially Paid';

    period.totalPaid = period.entries.reduce((s: number, e: any) => s + (e.amountPaid || 0), 0);
    if (period.entries.every((e: any) => e.paymentStatus === 'Paid')) {
      period.status = 'Paid';
    }

    await period.save();
    return NextResponse.json({ success: true, message: 'Salary payment recorded successfully', data: period });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
