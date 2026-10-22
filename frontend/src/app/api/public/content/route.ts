import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WebsiteContent from '@/models/WebsiteContent';
import CompanySettings from '@/models/CompanySettings';
import { requireStaffAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let content = await WebsiteContent.findOne({ siteKey: 'default' });
    if (!content) {
      // Seed default content
      content = await WebsiteContent.create({ siteKey: 'default' });
    }

    // Sync company branding settings if present
    const settings = await CompanySettings.findOne();
    if (settings) {
      if (settings.companyName && !content.businessName) content.businessName = settings.companyName;
      if (settings.phone && !content.phone) content.phone = settings.phone;
      if (settings.email && !content.publicEmail) content.publicEmail = settings.email;
      if (settings.address && !content.address) content.address = settings.address;
      if (settings.logoUrl && !content.logoUrl) content.logoUrl = settings.logoUrl;
    }

    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    const updated = await WebsiteContent.findOneAndUpdate(
      { siteKey: 'default' },
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Website content updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
