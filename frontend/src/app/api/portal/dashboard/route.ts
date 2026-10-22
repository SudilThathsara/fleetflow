import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import QuotationRequest from '@/models/QuotationRequest';
import Quotation from '@/models/Quotation';
import Booking from '@/models/Booking';
import BookingRequest from '@/models/BookingRequest';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import SupportTicket from '@/models/SupportTicket';
import Notification from '@/models/Notification';
import Customer from '@/models/Customer';
import { requireCustomerAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = requireCustomerAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();

    // Find customer record
    let customer = null;
    if (user?.customerId) {
      customer = await Customer.findById(user.customerId);
    } else {
      customer = await Customer.findOne({ email: user?.email.toLowerCase() });
    }

    const customerIds = [];
    if (customer) customerIds.push(customer._id);

    // Filter queries
    const customerFilter = customerIds.length > 0 ? { $in: customerIds } : null;

    // 1. Quotation Requests
    const quoteRequests = await QuotationRequest.find({
      $or: [{ user: user?.id }, { email: user?.email.toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // 2. Formal Quotations
    const quotationFilter: any = {
      $or: [
        ...(customerFilter ? [{ customer: customerFilter }] : []),
        { customerEmail: user?.email.toLowerCase() },
      ],
    };
    const quotations = await Quotation.find(quotationFilter).sort({ createdAt: -1 }).limit(5);

    // 3. Bookings
    const bookingFilter: any = {
      $or: [
        ...(customerFilter ? [{ customer: customerFilter }] : []),
        { customerPhone: customer?.phone || 'none' },
      ],
    };
    const bookings = await Booking.find(bookingFilter)
      .populate('assignedVehicle', 'make model registrationNumber vehicleType')
      .sort({ createdAt: -1 })
      .limit(5);

    const bookingRequests = await BookingRequest.find({
      $or: [{ user: user?.id }, { customerEmail: user?.email.toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Invoices
    const invoiceFilter: any = {
      $or: [
        ...(customerFilter ? [{ customer: customerFilter }] : []),
        { customerPhone: customer?.phone || 'none' },
      ],
    };
    const invoices = await Invoice.find(invoiceFilter).sort({ createdAt: -1 }).limit(5);

    // Calculate invoice stats
    const allInvoices = await Invoice.find(invoiceFilter);
    const unpaidInvoices = allInvoices.filter((inv) => inv.balanceDue > 0 && inv.status !== 'Cancelled');
    const totalBalanceDue = unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    // 5. Support Tickets
    const supportTickets = await SupportTicket.find({ user: user?.id }).sort({ createdAt: -1 }).limit(5);
    const openTicketsCount = await SupportTicket.countDocuments({
      user: user?.id,
      status: { $in: ['Open', 'In Progress'] },
    });

    // 6. Notifications
    const notifications = await Notification.find({ recipientUser: user?.id }).sort({ createdAt: -1 }).limit(5);
    const unreadNotifications = await Notification.countDocuments({ recipientUser: user?.id, read: false });

    return NextResponse.json({
      success: true,
      data: {
        customer,
        stats: {
          activeBookingsCount: bookings.filter((b) => ['Confirmed', 'In Progress'].includes(b.status)).length,
          pendingQuotesCount: quoteRequests.filter((q) => q.status === 'Pending').length + quotations.filter((q) => q.status === 'Sent').length,
          unpaidInvoicesCount: unpaidInvoices.length,
          totalBalanceDue,
          openTicketsCount,
          unreadNotifications,
        },
        recent: {
          quotationRequests: quoteRequests,
          quotations,
          bookings,
          bookingRequests,
          invoices,
          supportTickets,
          notifications,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
