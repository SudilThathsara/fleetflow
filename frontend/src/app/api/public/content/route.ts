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

    // Company settings are the single source of truth for shared identity/contact fields.
    const settings = await CompanySettings.findOne();
    if (settings) {
      content.businessName = settings.companyName || content.businessName;
      content.tagline = settings.tagline || content.tagline;
      content.phone = settings.phone || content.phone;
      content.publicEmail = settings.email || content.publicEmail;
      content.address = settings.address || content.address;
      content.brNumberPlaceholder = settings.brNumber || content.brNumberPlaceholder;
      content.logoUrl = settings.logoUrl || '';
      await content.save();
    }

    return NextResponse.json(
      { success: true, data: content },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
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

    await CompanySettings.findOneAndUpdate(
      {},
      {
        $set: {
          ...(body.businessName !== undefined && { companyName: body.businessName }),
          ...(body.tagline !== undefined && { tagline: body.tagline }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.publicEmail !== undefined && { email: body.publicEmail }),
          ...(body.address !== undefined && { address: body.address }),
          ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
          ...(body.brNumberPlaceholder !== undefined && { brNumber: body.brNumberPlaceholder }),
        },
        $setOnInsert: { currency: 'LKR' },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Website content updated successfully',
        data: updated,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
