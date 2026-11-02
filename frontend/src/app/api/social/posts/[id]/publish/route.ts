import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialPostDraft from '@/models/SocialPostDraft';
import { requireStaffAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const { publishedUrl } = await req.json();
    const post = await SocialPostDraft.findById(id);
    if (!post) return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });

    post.status = 'Published';
    post.publishedUrl = publishedUrl;
    post.publishedAt = new Date();
    await post.save();

    return NextResponse.json({ success: true, message: 'Publication verified and status updated', data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
