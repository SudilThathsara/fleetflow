import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Project from '@/models/Project';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const filter: any = {};
    if (companyId) filter.customerCompany = companyId;

    const projects = await Project.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();
    const count = await Project.countDocuments();
    const projectId = body.projectId || `PRJ-${String(count + 1).padStart(3, '0')}`;
    const newProject = await Project.create({ ...body, projectId });
    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

