import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialPostTemplate from '@/models/SocialPostTemplate';
import { requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const templates = await SocialPostTemplate.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: templates.length, data: templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();
    const count = await SocialPostTemplate.countDocuments();
    const templateId = body.templateId || `TPL-${String(count + 1).padStart(3, '0')}`;
    const newTemplate = await SocialPostTemplate.create({ ...body, templateId });
    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

