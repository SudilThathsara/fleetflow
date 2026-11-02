import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PayrollPeriod from '@/models/PayrollPeriod';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const payrolls = await PayrollPeriod.find().sort({ monthYear: -1 });
    return NextResponse.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

