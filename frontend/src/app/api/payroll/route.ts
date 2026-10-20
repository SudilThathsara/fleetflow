import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PayrollPeriod from '@/models/PayrollPeriod';

export async function GET() {
  try {
    await connectDB();
    const payrolls = await PayrollPeriod.find().sort({ monthYear: -1 });
    return NextResponse.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
