import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WebsiteEnquiry from '@/models/WebsiteEnquiry';
import SocialLead from '@/models/SocialLead';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';
import { sendEmail, getEnquiryReceivedHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, email, vehicleType, serviceCategory, dateRange, serviceArea, message, source } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Please provide your name, phone number, and enquiry message.' },
        { status: 400 }
      );
    }

    // Rate limiting / Spam protection check (simple check)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Generate unique enquiry ID
    const count = await WebsiteEnquiry.countDocuments();
    const enquiryId = `ENQ-2026-${String(count + 1001).padStart(5, '0')}`;

    // Link user if authenticated
    const auth = getAuthUser(req);

    // 1. Create Website Enquiry
    const enquiry = await WebsiteEnquiry.create({
      enquiryId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.toLowerCase().trim() || '',
      vehicleType: vehicleType || 'General Vehicle Hire',
      serviceCategory: serviceCategory || 'General Transport Enquiry',
      dateRange: dateRange || '',
      serviceArea: serviceArea || '',
      message: message.trim(),
      source: source || 'Website Quick Enquiry',
      status: 'New',
      user: auth?.id,
      ipAddress: ip,
    });

    // 2. Connect to existing CRM SocialLead module
    const leadCount = await SocialLead.countDocuments();
    const leadId = `LEAD-WEB-${String(leadCount + 101).padStart(4, '0')}`;

    await SocialLead.create({
      leadId,
      leadSource: 'Web',
      sourcePlatform: 'Website Contact',
      sourceGroupOrPage: 'Official Website Enquiry Portal',
      customerName: name.trim(),
      contactNumber: phone.trim(),
      leadCategory: serviceCategory?.includes('Corporate') || serviceCategory?.includes('Monthly') ? 'Corporate Transport' : 'Tour / Trip',
      interestType: vehicleType || 'Vehicle Hire',
      estimatedBudget: 0,
      leadStatus: 'New',
      priority: 'High',
      inquiryNotes: `[Ref: ${enquiryId}] ${message.trim()}${serviceArea ? ` | Area: ${serviceArea}` : ''}${dateRange ? ` | Dates: ${dateRange}` : ''}`,
    }).catch((e) => console.warn('Sync to SocialLead warning:', e.message));

    // 3. Notify Operations & Managers
    await Notification.create({
      recipientRole: 'operations',
      title: `New Website Enquiry: ${enquiryId}`,
      message: `${name} requested ${vehicleType || 'vehicle hire'} (${phone}).`,
      type: 'enquiry',
      link: '/social-leads',
    });

    // 4. Send Confirmation Email if email provided
    if (email) {
      const summary = `<strong>Name:</strong> ${name}<br/><strong>Phone:</strong> ${phone}<br/><strong>Service:</strong> ${serviceCategory || 'Transport'}<br/><strong>Vehicle:</strong> ${vehicleType || 'Not specified'}<br/><strong>Details:</strong> ${message}`;
      await sendEmail({
        to: email.trim(),
        subject: `Enquiry Received (${enquiryId}) — Tourism & Transport`,
        html: getEnquiryReceivedHtml(name, enquiryId, summary),
        type: 'enquiry_received',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been received successfully! Our operations desk will contact you promptly.',
      enquiryId,
    });
  } catch (error: any) {
    console.error('Enquiry error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Submission failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    // Customer can see their own enquiries; staff can see all
    const query: any = {};
    if (auth.role === 'customer') {
      query.$or = [{ user: auth.id }, { email: auth.email?.toLowerCase() }];
    }

    const enquiries = await WebsiteEnquiry.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

