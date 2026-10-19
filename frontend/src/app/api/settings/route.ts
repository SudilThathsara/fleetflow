import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CompanySettings from '@/models/CompanySettings';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({});
    }
    return NextResponse.json({ success: true, data: settings });
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

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create(body);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, body, { new: true });
    }

    return NextResponse.json({ success: true, message: 'Company settings saved', data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
