import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ContractMonthlyBillingRun from '@/models/ContractMonthlyBillingRun';

export async function GET() {
  try {
    await connectDB();
    const runs = await ContractMonthlyBillingRun.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: runs.length, data: runs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
