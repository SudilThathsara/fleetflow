import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import Notification from '@/models/Notification';
import { requireCustomerAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const tickets = await SupportTicket.find({ user: user?.id }).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { category, relatedReference, subject, message, priority } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, message: 'Subject and message are required.' }, { status: 400 });
    }

    const count = await SupportTicket.countDocuments();
    const ticketId = `TCK-2026-${String(count + 101).padStart(4, '0')}`;

    const newTicket = await SupportTicket.create({
      ticketId,
      user: user?.id,
      customerName: user?.name,
      customerEmail: user?.email,
      category: category || 'General',
      relatedReference,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'Medium',
      status: 'Open',
      responses: [
        {
          sender: user?.name,
          senderRole: 'Customer',
          message: message.trim(),
          createdAt: new Date(),
          isInternal: false,
        },
      ],
    });

    // Notify support & operations staff
    await Notification.create({
      recipientRole: 'operations',
      title: `New Support Ticket: ${ticketId}`,
      message: `[${category || 'General'}] ${subject} from ${user?.name}.`,
      type: 'support',
      link: `/portal/support`,
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket ${ticketId} created successfully. Our team will review your message promptly.`,
      data: newTicket,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
