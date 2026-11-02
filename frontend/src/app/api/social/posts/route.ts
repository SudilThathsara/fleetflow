import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialPostDraft from '@/models/SocialPostDraft';
import { requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const posts = await SocialPostDraft.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: posts.length, data: posts });
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
    const count = await SocialPostDraft.countDocuments();
    const postId = body.postId || `POST-${String(count + 1).padStart(4, '0')}`;
    const newPost = await SocialPostDraft.create({ ...body, postId });
    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

