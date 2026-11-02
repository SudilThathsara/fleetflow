import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialLead from '@/models/SocialLead';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const leadType = searchParams.get('leadType') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleReg: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (leadType) query.leadType = leadType;

    const leads = await SocialLead.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();

    // Check duplicate lead by phone or vehicle registration
    const duplicateQuery: any = [];
    if (body.phone) duplicateQuery.push({ phone: body.phone.trim() });
    if (body.vehicleReg) duplicateQuery.push({ vehicleReg: body.vehicleReg.trim().toUpperCase() });

    if (duplicateQuery.length > 0) {
      const duplicate = await SocialLead.findOne({ $or: duplicateQuery });
      if (duplicate && !body.forceCreate) {
        return NextResponse.json({
          success: false,
          warning: true,
          message: `Potential duplicate lead found: ${duplicate.name} (${duplicate.leadId}) with phone: ${duplicate.phone}. Provide forceCreate=true to save anyway.`,
          duplicate,
        });
      }
    }

    if (!body.leadId) {
      const count = await SocialLead.countDocuments();
      body.leadId = `LEAD-${String(count + 1).padStart(4, '0')}`;
    }

    if (body.vehicleReg) body.vehicleReg = body.vehicleReg.trim().toUpperCase();

    const lead = await SocialLead.create(body);
    return NextResponse.json({ success: true, message: 'Social lead recorded successfully', data: lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
