import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query: any = {
      isPublishedToFleet: true,
      status: { $ne: 'Retired' },
    };

    if (category && category !== 'all') {
      query.vehicleType = category;
    }

    // Explicit field projection enforcing field-level privacy:
    // Never expose registration numbers, GPS locations, internal Vehicle IDs,
    // driver names/phone, owner contact, customer assignments, purchase price or service notes.
    const vehicles = await Vehicle.find(query)
      .select({
        _id: 1,
        vehicleType: 1,
        make: 1,
        model: 1,
        manufacturingYear: 1,
        color: 1,
        fuelType: 1,
        seatingCapacity: 1,
        publicDescription: 1,
        publicPhotos: 1,
        publicFeatures: 1,
        hireRate: 1,
        status: 1,
      })
      .sort({ createdAt: -1 });

    // Fallback sample highlights if admin hasn't published custom vehicles yet
    let publicFleet = vehicles;
    if (vehicles.length === 0) {
      // Find up to 6 available vehicles and sanitize them without saving private fields
      const sample = await Vehicle.find({ status: { $in: ['Available', 'Booked', 'On Trip'] } })
        .limit(6)
        .select({
          _id: 1,
          vehicleType: 1,
          make: 1,
          model: 1,
          manufacturingYear: 1,
          color: 1,
          fuelType: 1,
          seatingCapacity: 1,
          status: 1,
        });

      publicFleet = sample.map((v) => ({
        _id: v._id,
        vehicleType: v.vehicleType,
        make: v.make,
        model: v.model,
        manufacturingYear: v.manufacturingYear,
        color: v.color,
        fuelType: v.fuelType,
        seatingCapacity: v.seatingCapacity,
        status: 'Available',
        publicDescription: `Verified ${v.make} ${v.model} available for monthly corporate rental or private tour hire. Well maintained with regular service records.`,
        publicPhotos: [
          v.vehicleType?.toLowerCase().includes('van')
            ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'
            : v.vehicleType?.toLowerCase().includes('cab') || v.vehicleType?.toLowerCase().includes('truck')
            ? 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
            : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        ],
        publicFeatures: [
          'Full Comprehensive Insurance',
          'A/C & Climate Control',
          'Professional Driver Included',
          'Regular Safety Inspections',
        ],
      })) as any;
    }

    return NextResponse.json({
      success: true,
      count: publicFleet.length,
      data: publicFleet,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
