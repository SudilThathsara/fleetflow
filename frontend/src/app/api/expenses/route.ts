import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Expense from '@/models/Expense';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const vehicleId = searchParams.get('vehicleId');

    const query: any = {};
    if (category) query.category = category;
    if (vehicleId) query.vehicle = vehicleId;

    const expenses = await Expense.find(query).sort({ date: -1 });

    const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    return NextResponse.json({ success: true, count: expenses.length, totalExpense, data: expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.expenseId) {
      const count = await Expense.countDocuments();
      body.expenseId = `EXP-${String(count + 1).padStart(4, '0')}`;
    }

    body.amount = Number(body.amount) || 0;

    const expense = await Expense.create(body);
    return NextResponse.json({ success: true, message: 'Expense recorded successfully', data: expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
