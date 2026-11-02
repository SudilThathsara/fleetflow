import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Supplier from '@/models/Supplier';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { supplierId: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: suppliers.length, data: suppliers });
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

    if (!body.supplierId) {
      const count = await Supplier.countDocuments();
      body.supplierId = `SUP-${String(count + 1).padStart(4, '0')}`;
    }

    const supplier = await Supplier.create(body);
    return NextResponse.json({ success: true, message: 'Supplier/Owner added successfully', data: supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
