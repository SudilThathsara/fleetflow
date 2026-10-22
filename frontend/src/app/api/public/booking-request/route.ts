import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';
import Booking from '@/models/Booking';
import Customer from '@/models/Customer';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';
import { sendEmail, getBookingStatusHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      vehicleCategory,
      pickupLocation,
      destination,
      pickupDate,
      returnDate,
      driverPreference,
      fuelArrangement,
      passengerCount,
      additionalNotes,
    } = body;

    if (!customerName || !customerPhone || !customerEmail || !vehicleCategory || !pickupLocation || !destination || !pickupDate || !returnDate) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required booking request fields.' },
        { status: 400 }
      );
    }

    const auth = getAuthUser(req);
    let customerId = auth?.customerId;

    // Find or create customer
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
    } else {
      customer = await Customer.findOne({ email: customerEmail.toLowerCase().trim() });
      if (!customer) {
        const custCount = await Customer.countDocuments();
        customer = await Customer.create({
          customerId: `CUST-${String(custCount + 101).padStart(4, '0')}`,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.toLowerCase().trim(),
          billingAddress: pickupLocation.trim(),
          customerCategory: 'Individual',
          status: 'Active',
          outstandingBalance: 0,
        });
      }
    }

    const count = await BookingRequest.countDocuments();
    const requestId = `BREQ-2026-${String(count + 1001).padStart(5, '0')}`;

    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);
    const durationDays = Math.max(1, Math.ceil((rDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 1. Create BookingRequest
    const newRequest = await BookingRequest.create({
      requestId,
      user: auth?.id,
      customer: customer?._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      vehicleCategory,
      pickupLocation: pickupLocation.trim(),
      destination: destination.trim(),
      pickupDate: pDate,
      returnDate: rDate,
      durationDays,
      driverPreference: driverPreference || 'With Professional Driver',
      fuelArrangement: fuelArrangement || 'Fuel Included',
      passengerCount: Number(passengerCount) || 1,
      additionalNotes: additionalNotes?.trim(),
      status: 'Pending',
    });

    // 2. Connect to operational Booking collection as 'Enquiry'
    const bCount = await Booking.countDocuments();
    const bookingId = `BK-${new Date().getFullYear()}-${String(bCount + 101).padStart(4, '0')}`;

    const opBooking = await Booking.create({
      bookingId,
      customer: customer._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      bookingSource: 'Web',
      pickupLocation: pickupLocation.trim(),
      destination: destination.trim(),
      pickupDate: pDate,
      returnDate: rDate,
      vehicleType: vehicleCategory,
      agreedPrice: 0, // Staff determines rate upon confirmation
      advanceReceived: 0,
      expectedSupplierCost: 0,
      expectedDriverCost: 0,
      status: 'Enquiry',
      notes: `[Booking Request Ref: ${requestId}] ${additionalNotes || ''} | Duration: ${durationDays} days | Driver: ${driverPreference || 'Included'}`,
    });

    // Link booking ID
    newRequest.convertedBookingId = opBooking._id;
    await newRequest.save();

    // 3. Notify Operations Staff
    await Notification.create({
      recipientRole: 'operations',
      title: `New Online Booking Request: ${requestId}`,
      message: `${customerName} requested ${vehicleCategory} from ${pickupLocation} to ${destination} (${durationDays} days).`,
      type: 'booking_request',
      link: '/bookings',
    });

    // 4. Send Confirmation Email
    const details = `<strong>Request ID:</strong> ${requestId}<br/><strong>Vehicle:</strong> ${vehicleCategory}<br/><strong>Pickup:</strong> ${pickupLocation} on ${pDate.toLocaleString()}<br/><strong>Destination:</strong> ${destination}<br/><strong>Status:</strong> Pending Operations Verification`;
    await sendEmail({
      to: customerEmail.trim(),
      subject: `Booking Request Received (${requestId}) — Lanka Premier Transport`,
      html: getBookingStatusHtml(customerName, requestId, 'Pending Verification', details),
      type: 'booking_received',
    });

    return NextResponse.json({
      success: true,
      message: `Your booking request ${requestId} has been submitted! Our fleet dispatch will verify vehicle availability and confirm your reservation shortly.`,
      requestId,
      bookingId,
      data: newRequest,
    });
  } catch (error: any) {
    console.error('Booking request error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Booking request failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthUser(req);
    const query: any = {};
    if (auth && auth.role === 'customer') {
      query.$or = [{ user: auth.id }, { customerEmail: auth.email.toLowerCase() }];
    }

    const requests = await BookingRequest.find(query)
      .populate('convertedBookingId')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
