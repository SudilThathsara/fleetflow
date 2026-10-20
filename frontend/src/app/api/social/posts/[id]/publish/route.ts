import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialPostDraft from '@/models/SocialPostDraft';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
