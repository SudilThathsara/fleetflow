import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import CustomerCompany from '@/models/CustomerCompany';
import CustomerCompanyMembership from '@/models/CustomerCompanyMembership';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.id).select('-passwordHash');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    let customerData = null;
    let companies: any[] = [];

    if (user.role === 'customer' || user.customerId) {
      if (user.customerId) {
        customerData = await Customer.findById(user.customerId);
      } else {
        customerData = await Customer.findOne({ email: user.email });
      }

      // Find company memberships
      const memberships = await CustomerCompanyMembership.find({ user: user._id, status: 'active' }).populate('company');
      companies = memberships.map((m) => ({
        company: m.company,
        role: m.role,
      }));

      // Also check if customer is linked directly to a company
      if (customerData?.customerCompany) {
        const directCompany = await CustomerCompany.findById(customerData.customerCompany);
        if (directCompany && !companies.some((c) => c.company?._id?.toString() === directCompany._id.toString())) {
          companies.push({ company: directCompany, role: 'member' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        status: user.status,
        customer: customerData,
        companies,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
