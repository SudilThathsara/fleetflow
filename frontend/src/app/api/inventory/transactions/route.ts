import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import InventoryTransaction from '@/models/InventoryTransaction';
import { requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const transactions = await InventoryTransaction.find().sort({ date: -1 }).limit(100);
    return NextResponse.json({ success: true, count: transactions.length, data: transactions });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
