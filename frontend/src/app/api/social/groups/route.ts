import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialGroup from '@/models/SocialGroup';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || '';

    const query: any = {};
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { area: { $regex: search, $options: 'i' } }];
    }
    if (platform) query.platform = platform;

    const groups = await SocialGroup.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: groups.length, data: groups });
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

    if (!body.groupId) {
      const count = await SocialGroup.countDocuments();
      body.groupId = `GRP-${String(count + 1).padStart(4, '0')}`;
    }

    const group = await SocialGroup.create(body);
    return NextResponse.json({ success: true, message: 'Social media group saved', data: group });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
