import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DocumentRecord from '@/models/DocumentRecord';
import { requireAuth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    await DocumentRecord.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Document removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
