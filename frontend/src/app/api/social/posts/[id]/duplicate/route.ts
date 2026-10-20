import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialPostDraft from '@/models/SocialPostDraft';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const original = await SocialPostDraft.findById(id);
    if (!original) return NextResponse.json({ success: false, message: 'Original post not found' }, { status: 404 });

    const count = await SocialPostDraft.countDocuments();
    const postId = `POST-${String(count + 1).padStart(4, '0')}`;

    const duplicateObj = original.toObject();
    delete duplicateObj._id;
    delete duplicateObj.createdAt;
    delete duplicateObj.updatedAt;

    duplicateObj.postId = postId;
    duplicateObj.title = `${original.title} (Copy)`;
    duplicateObj.status = 'Draft';
    duplicateObj.publishedUrl = '';
    duplicateObj.publishedAt = undefined;

    const duplicated = await SocialPostDraft.create(duplicateObj);
    return NextResponse.json({ success: true, message: 'Post duplicated successfully', data: duplicated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
