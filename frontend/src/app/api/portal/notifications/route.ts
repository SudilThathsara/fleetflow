import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const query: any = {
      $or: [{ recipientUser: auth.id }, { recipientRole: auth.role }],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    return NextResponse.json({ success: true, count: notifications.length, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { notificationId } = await req.json();

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } else {
      // Mark all user notifications as read
      await Notification.updateMany(
        { $or: [{ recipientUser: auth.id }, { recipientRole: auth.role }] },
        { read: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
