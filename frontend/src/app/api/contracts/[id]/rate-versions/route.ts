import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contract from '@/models/Contract';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const contract = await Contract.findById(id);
    if (!contract) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });

    const newVersionNum = (contract.rateVersions?.length || 1) + 1;
    const newVersion = {
      ...body,
      version: newVersionNum,
      effectiveFrom: body.effectiveFrom || new Date(),
      createdAt: new Date(),
    };

    contract.rateVersions.push(newVersion);
    contract.rateCard = newVersion;
    await contract.save();

    return NextResponse.json({ success: true, message: `Rate version ${newVersionNum} added successfully`, data: contract });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
