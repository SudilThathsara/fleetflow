import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import QuotationRequest from '@/models/QuotationRequest';
import Customer from '@/models/Customer';
import SocialLead from '@/models/SocialLead';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';
import { sendEmail, getEnquiryReceivedHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      customerType,
      name,
      companyName,
      contactPerson,
      phone,
      email,
      serviceCategory,
      vehicleCategory,
      numberOfVehicles,
      hireType,
      startDate,
      endDate,
      contractDurationMonths,
      serviceArea,
      estimatedKmPerMonth,
      driverRequirement,
      fuelArrangement,
      overtimeRequirement,
      additionalNotes,
    } = body;

    if (!name || !phone || !email || !serviceCategory || !vehicleCategory || !startDate || !serviceArea) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required quotation request details.' },
        { status: 400 }
      );
    }

    const auth = getAuthUser(req);
    let customerId = auth?.customerId;

    // If customer record not yet attached to auth user, look up or create
    if (auth && !customerId) {
      const cust = await Customer.findOne({ email: auth.email });
      if (cust) customerId = cust._id;
    }

    const count = await QuotationRequest.countDocuments();
    const requestId = `REQ-2026-${String(count + 1001).padStart(5, '0')}`;

    const newRequest = await QuotationRequest.create({
      requestId,
      user: auth?.id,
      customer: customerId,
      customerType: customerType || (companyName ? 'corporate' : 'individual'),
      name: name.trim(),
      companyName: companyName?.trim() || '',
      contactPerson: contactPerson?.trim() || name.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      serviceCategory,
      vehicleCategory,
      numberOfVehicles: Number(numberOfVehicles) || 1,
      hireType: hireType || 'Monthly',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      contractDurationMonths: contractDurationMonths ? Number(contractDurationMonths) : undefined,
      serviceArea: serviceArea.trim(),
      estimatedKmPerMonth: estimatedKmPerMonth ? Number(estimatedKmPerMonth) : 3000,
      driverRequirement: driverRequirement || 'Driver Provided',
      fuelArrangement: fuelArrangement || 'Company Provided',
      overtimeRequirement,
      additionalNotes: additionalNotes?.trim(),
      status: 'Pending',
    });

    // Sync to CRM SocialLead
    const leadCount = await SocialLead.countDocuments();
    const leadId = `LEAD-QT-${String(leadCount + 101).padStart(4, '0')}`;
    await SocialLead.create({
      leadId,
      leadSource: 'Web',
      sourcePlatform: 'Website Quotation Portal',
      customerName: companyName ? `${companyName} (${name})` : name,
      contactNumber: phone.trim(),
      leadCategory: 'Corporate Transport',
      interestType: `${numberOfVehicles || 1}x ${vehicleCategory} (${hireType || 'Monthly'})`,
      leadStatus: 'New',
      priority: 'High',
      inquiryNotes: `[Quotation Request: ${requestId}] Area: ${serviceArea} | Est. KM: ${estimatedKmPerMonth || 3000} | Start: ${startDate} | Notes: ${additionalNotes || 'N/A'}`,
    }).catch((e) => console.warn('Sync lead error:', e.message));

    // Notify staff
    await Notification.create({
      recipientRole: 'manager',
      title: `New Quotation Request: ${requestId}`,
      message: `${name} requested ${numberOfVehicles || 1}x ${vehicleCategory} for ${serviceArea}.`,
      type: 'quote_request',
      link: '/quotations',
    });

    // Send confirmation email
    const summary = `<strong>Request Reference:</strong> ${requestId}<br/><strong>Service:</strong> ${serviceCategory}<br/><strong>Vehicle Category:</strong> ${vehicleCategory} (${numberOfVehicles || 1} unit/s)<br/><strong>Hire Type:</strong> ${hireType || 'Monthly'}<br/><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}<br/><strong>Service Area:</strong> ${serviceArea}`;
    await sendEmail({
      to: email.trim(),
      subject: `Quotation Request Confirmed (${requestId}) — Tourism & Transport`,
      html: getEnquiryReceivedHtml(name, requestId, summary),
      type: 'enquiry_received',
    });

    return NextResponse.json({
      success: true,
      message: `Your quotation request ${requestId} has been submitted successfully! An official quotation will be generated and shared with you shortly.`,
      requestId,
      data: newRequest,
    });
  } catch (error: any) {
    console.error('Quotation request error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Quotation request failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (auth.role === 'customer') {
      // Customer sees only their own requests
      query.$or = [{ user: auth.id }, { email: auth.email.toLowerCase() }];
    }
    if (status) query.status = status;

    const requests = await QuotationRequest.find(query)
      .populate('convertedQuotationId')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

