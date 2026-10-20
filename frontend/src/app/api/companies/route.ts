import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomerCompany from '@/models/CustomerCompany';

export async function GET() {
  try {
    await connectDB();
    const companies = await CustomerCompany.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: companies.length, data: companies });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const count = await CustomerCompany.countDocuments();
    const companyId = body.companyId || `COMP-${String(count + 1).padStart(3, '0')}`;
    const newCompany = await CustomerCompany.create({ ...body, companyId });
    return NextResponse.json({ success: true, data: newCompany }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
