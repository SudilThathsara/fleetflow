import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Quotation from '@/models/Quotation';
import CompanySettings from '@/models/CompanySettings';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const quotations = await Quotation.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: quotations.length, data: quotations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.quotationNumber) {
      const count = await Quotation.countDocuments();
      const settings = await CompanySettings.findOne();
      body.quotationNumber = `${settings?.quotationPrefix || `QT-${new Date().getFullYear()}-`}${String(count + 1).padStart(4, '0')}`;
    }

    if (body.items && Array.isArray(body.items)) {
      body.subtotal = body.items.reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        0
      );
      body.totalAmount = Math.max(0, body.subtotal - (Number(body.discount) || 0) + (Number(body.taxAmount) || 0));
    }

    const quotation = await Quotation.create(body);
    return NextResponse.json({ success: true, message: 'Quotation generated successfully', data: quotation });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
