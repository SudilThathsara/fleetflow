import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CompanySettings from '@/models/CompanySettings';
import WebsiteContent from '@/models/WebsiteContent';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({});
    }
    return NextResponse.json(
      { success: true, data: settings },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    const {
      companyName,
      tagline,
      phone,
      email,
      address,
      logoUrl,
      brNumber,
    } = body;

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create(body);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, body, { new: true });
    }

    if (!settings) {
      return NextResponse.json({ success: false, message: 'Company settings could not be saved' }, { status: 500 });
    }

    await WebsiteContent.findOneAndUpdate(
      { siteKey: 'default' },
      {
        $set: {
          ...(companyName !== undefined && { businessName: companyName }),
          ...(tagline !== undefined && { tagline }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { publicEmail: email }),
          ...(address !== undefined && { address }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(brNumber !== undefined && { brNumberPlaceholder: brNumber }),
        },
        $setOnInsert: { siteKey: 'default' },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, message: 'Company settings saved', data: settings },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
