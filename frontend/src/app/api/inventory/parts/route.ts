import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SparePart from '@/models/SparePart';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const query: any = {};
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { compatibleVehicles: { $regex: search, $options: 'i' } },
      ];
    }

    const parts = await SparePart.find(query).sort({ currentStock: 1, name: 1 });
    return NextResponse.json({ success: true, count: parts.length, data: parts });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const count = await SparePart.countDocuments();
    const partId = body.partId || `PRT-${String(count + 1).padStart(4, '0')}`;
    const newPart = await SparePart.create({ ...body, partId });
    return NextResponse.json({ success: true, data: newPart }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
