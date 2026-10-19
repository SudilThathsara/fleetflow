import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SocialLead from '@/models/SocialLead';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Supplier from '@/models/Supplier';
import Customer from '@/models/Customer';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const lead = await SocialLead.findById(id);
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const lead = await SocialLead.findById(id);
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });

    // Handle lead conversion
    if (body.convertTo) {
      const convertType = body.convertTo; // 'Vehicle' | 'Driver' | 'Supplier' | 'Customer'

      if (convertType === 'Vehicle') {
        const vCount = await Vehicle.countDocuments();
        const newVehicle = await Vehicle.create({
          vehicleId: `VEH-${String(vCount + 1).padStart(4, '0')}`,
          registrationNumber: lead.vehicleReg || `NP-${Math.floor(1000 + Math.random() * 9000)}`,
          vehicleType: lead.vehicleType || 'Car',
          make: 'Toyota',
          model: 'Axio',
          manufacturingYear: 2018,
          currentOdometer: 50000,
          ownershipType: 'Third-party or partner-owned',
          hireRate: lead.expectedRate || 0,
          status: 'Available',
          notes: `Converted from lead ${lead.leadId}. Source: ${lead.sourcePlatform} / ${lead.sourceGroup || ''}`,
        });

        lead.status = 'Converted';
        lead.convertedTo = 'Vehicle';
        lead.convertedRecordId = newVehicle.vehicleId;
        await lead.save();

        return NextResponse.json({
          success: true,
          message: 'Lead successfully converted to Vehicle',
          convertedRecord: newVehicle,
        });
      }

      if (convertType === 'Driver') {
        const dCount = await Driver.countDocuments();
        const newDriver = await Driver.create({
          driverId: `DRV-${String(dCount + 1).padStart(4, '0')}`,
          fullName: lead.name,
          phone: lead.phone,
          nic: '199000000000',
          address: lead.serviceAreas || 'Colombo',
          drivingLicenceNumber: 'B0000000',
          licenceExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          defaultRate: lead.expectedRate || 2500,
          status: 'Available',
          notes: `Converted from lead ${lead.leadId}`,
        });

        lead.status = 'Converted';
        lead.convertedTo = 'Driver';
        lead.convertedRecordId = newDriver.driverId;
        await lead.save();

        return NextResponse.json({
          success: true,
          message: 'Lead successfully converted to Driver',
          convertedRecord: newDriver,
        });
      }

      if (convertType === 'Supplier') {
        const sCount = await Supplier.countDocuments();
        const newSupplier = await Supplier.create({
          supplierId: `SUP-${String(sCount + 1).padStart(4, '0')}`,
          name: lead.name,
          phone: lead.phone,
          address: lead.serviceAreas || 'Western Province',
          rateType: 'Per Day',
          serviceAreas: lead.serviceAreas,
          status: 'Active',
          notes: `Converted from lead ${lead.leadId}`,
        });

        lead.status = 'Converted';
        lead.convertedTo = 'Supplier';
        lead.convertedRecordId = newSupplier.supplierId;
        await lead.save();

        return NextResponse.json({
          success: true,
          message: 'Lead successfully converted to Vehicle Owner/Supplier',
          convertedRecord: newSupplier,
        });
      }

      if (convertType === 'Customer') {
        const cCount = await Customer.countDocuments();
        const newCustomer = await Customer.create({
          customerId: `CUST-${String(cCount + 1).padStart(4, '0')}`,
          name: lead.name,
          phone: lead.phone,
          billingAddress: lead.serviceAreas || 'Colombo',
          status: 'Active',
          notes: `Converted from lead ${lead.leadId}`,
        });

        lead.status = 'Converted';
        lead.convertedTo = 'Customer';
        lead.convertedRecordId = newCustomer.customerId;
        await lead.save();

        return NextResponse.json({
          success: true,
          message: 'Lead successfully converted to Customer',
          convertedRecord: newCustomer,
        });
      }
    }

    const updated = await SocialLead.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, message: 'Lead updated', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = await params;
    await SocialLead.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
