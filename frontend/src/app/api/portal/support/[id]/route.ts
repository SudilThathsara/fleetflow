import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    // Check ownership if customer
    if (auth.role === 'customer' && ticket.user.toString() !== auth.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const isCustomer = auth.role === 'customer';
    ticket.responses.push({
      sender: auth.name,
      senderRole: isCustomer ? 'Customer' : 'Support Team',
      message: message.trim(),
      createdAt: new Date(),
      isInternal: false,
    });

    if (isCustomer && ticket.status === 'Resolved') {
      ticket.status = 'In Progress'; // reopen if customer replies
    }

    await ticket.save();

    // Notify counterpart
    if (isCustomer) {
      await Notification.create({
        recipientRole: 'operations',
        title: `Reply on Ticket ${ticket.ticketId}`,
        message: `${auth.name}: ${message.trim().slice(0, 80)}`,
        type: 'support',
      });
    } else {
      await Notification.create({
        recipientUser: ticket.user,
        title: `Reply on Ticket ${ticket.ticketId}`,
        message: `Support Team: ${message.trim().slice(0, 80)}`,
        type: 'support',
        link: '/portal/support',
      });
    }

    return NextResponse.json({ success: true, message: 'Reply sent successfully', data: ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
