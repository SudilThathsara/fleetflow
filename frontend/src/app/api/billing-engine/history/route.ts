import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ContractMonthlyBillingRun from '@/models/ContractMonthlyBillingRun';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const runs = await ContractMonthlyBillingRun.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: runs.length, data: runs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

