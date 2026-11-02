import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Project from '@/models/Project';
import Contract from '@/models/Contract';
import RunningChartEntry from '@/models/RunningChartEntry';
import { requireAuth, requireStaffAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireStaffAuth(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    const contracts = await Contract.find({ project: project._id });
    const runningCharts = await RunningChartEntry.find({ project: project._id });
    return NextResponse.json({ success: true, data: { project, contracts, runningCharts } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Project.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

