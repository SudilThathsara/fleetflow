import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DocumentRecord from '@/models/DocumentRecord';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const expiringSoon = searchParams.get('expiringSoon');

    const query: any = {};
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;

    if (expiringSoon === 'true') {
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
      query.expiryDate = { $lte: thirtyDaysAhead };
    }

    const docs = await DocumentRecord.find(query).sort({ expiryDate: 1 });
    return NextResponse.json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    if (!body.docId) {
      const count = await DocumentRecord.countDocuments();
      body.docId = `DOC-${String(count + 1).padStart(4, '0')}`;
    }

    const doc = await DocumentRecord.create(body);
    return NextResponse.json({ success: true, message: 'Document saved successfully', data: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
