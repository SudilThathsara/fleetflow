import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomerCompany from '@/models/CustomerCompany';
import Project from '@/models/Project';
import Contract from '@/models/Contract';
import Invoice from '@/models/Invoice';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const company = await CustomerCompany.findById(id);
    if (!company) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    const projects = await Project.find({ customerCompany: company._id });
    const contracts = await Contract.find({ customerCompany: company._id });
    const invoices = await Invoice.find({ customerCompany: company._id });
    return NextResponse.json({ success: true, data: { company, projects, contracts, invoices } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await CustomerCompany.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await CustomerCompany.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Company deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
