import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';
import Booking from '@/models/Booking';
import RunningChartEntry from '@/models/RunningChartEntry';
import VehicleService from '@/models/VehicleService';
import DocumentRecord from '@/models/DocumentRecord';
import Quotation from '@/models/Quotation';
import Invoice from '@/models/Invoice';
import Expense from '@/models/Expense';
import SocialGroup from '@/models/SocialGroup';
import SocialLead from '@/models/SocialLead';
import CompanySettings from '@/models/CompanySettings';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();

    // 1. Settings
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'FleetFlow Lanka Transport & Logistics',
        tagline: 'Professional Fleet & Operational Management',
        phone: '+94 11 234 5678',
        email: 'info@fleetflowlanka.lk',
        address: 'No 45, Baseline Road, Colombo 09, Sri Lanka',
        currency: 'LKR',
        invoicePrefix: 'INV-2026-',
        quotationPrefix: 'QT-2026-',
        receiptPrefix: 'REC-2026-',
      });
    }

    // 2. Users (Admin, Manager, Accountant)
    const adminExists = await User.findOne({ email: 'admin@fleetflow.lk' });
    if (!adminExists) {
      const passHash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Sudil Thathsara (Super Admin)',
        email: 'admin@fleetflow.lk',
        passwordHash: passHash,
        role: 'super_admin',
        phone: '+94 77 123 4567',
        status: 'active',
      });
    }

    // 3. Vehicles
    const vCount = await Vehicle.countDocuments();
    let sampleVehicles: any[] = [];
    if (vCount === 0) {
      sampleVehicles = await Vehicle.create([
        {
          vehicleId: 'VEH-0001',
          registrationNumber: 'CAB-4521',
          vehicleType: 'Car',
          make: 'Toyota',
          model: 'Premio 2018',
          manufacturingYear: 2018,
          color: 'Pearl White',
          fuelType: 'Petrol',
          seatingCapacity: 4,
          currentOdometer: 64200,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 60000,
          nextServiceOdometer: 65000,
          status: 'Available',
          hireRate: 8500,
        },
        {
          vehicleId: 'VEH-0002',
          registrationNumber: 'WP-NC-8890',
          vehicleType: 'Van',
          make: 'Toyota',
          model: 'KDH High Roof',
          manufacturingYear: 2019,
          color: 'Silver',
          fuelType: 'Diesel',
          seatingCapacity: 14,
          currentOdometer: 112500,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 110000,
          nextServiceOdometer: 115000,
          status: 'Available',
          hireRate: 16500,
        },
        {
          vehicleId: 'VEH-0003',
          registrationNumber: 'WP-ND-1122',
          vehicleType: 'Bus',
          make: 'Mitsubishi',
          model: 'Rosa 33 Seater',
          manufacturingYear: 2020,
          color: 'Blue/White',
          fuelType: 'Diesel',
          seatingCapacity: 33,
          currentOdometer: 89400,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 85000,
          nextServiceOdometer: 90000,
          status: 'Available',
          hireRate: 35000,
        },
      ]);
    } else {
      sampleVehicles = await Vehicle.find().limit(3);
    }

    // 4. Drivers
    const dCount = await Driver.countDocuments();
    let sampleDrivers: any[] = [];
    if (dCount === 0) {
      sampleDrivers = await Driver.create([
        {
          driverId: 'DRV-0001',
          fullName: 'Kamal Perera',
          phone: '+94 71 892 3411',
          nic: '881452390V',
          address: '42 Templers Rd, Mount Lavinia',
          drivingLicenceNumber: 'B1829302',
          licenceCategory: 'Heavy & Dual Purpose',
          licenceExpiryDate: new Date('2028-06-15'),
          employmentType: 'Full-time',
          defaultPaymentMethod: 'Daily rate',
          defaultRate: 3500,
          status: 'Available',
        },
        {
          driverId: 'DRV-0002',
          fullName: 'Nimal Silva',
          phone: '+94 77 445 6677',
          nic: '921820491V',
          address: '15 Highlevel Rd, Maharagama',
          drivingLicenceNumber: 'B9928312',
          licenceCategory: 'Heavy Vehicle',
          licenceExpiryDate: new Date('2027-11-20'),
          employmentType: 'Full-time',
          defaultPaymentMethod: 'Daily rate',
          defaultRate: 3200,
          status: 'Available',
        },
      ]);
    } else {
      sampleDrivers = await Driver.find().limit(2);
    }

    // 5. Customers
    const cCount = await Customer.countDocuments();
    let sampleCustomer: any = null;
    if (cCount === 0) {
      sampleCustomer = await Customer.create({
        customerId: 'CUST-0001',
        name: 'Aitken Spence Travels (Pvt) Ltd',
        companyName: 'Aitken Spence Group',
        phone: '+94 11 230 8308',
        email: 'inbound@aitkenspence.lk',
        billingAddress: 'Vauxhall St, Colombo 02',
        customerCategory: 'Corporate',
        outstandingBalance: 45000,
        status: 'Active',
      });
    } else {
      sampleCustomer = await Customer.findOne();
    }

    // 6. Suppliers / Owners
    const sCount = await Supplier.countDocuments();
    if (sCount === 0) {
      await Supplier.create({
        supplierId: 'SUP-0001',
        name: 'Lanka Fleet Partners & Rentals',
        phone: '+94 77 555 4433',
        address: 'Galle Road, Dehiwala',
        rateType: 'Per Day',
        serviceAreas: 'Western & Southern Provinces',
        status: 'Active',
      });
    }

    // 7. Running Chart Entry
    const rcCount = await RunningChartEntry.countDocuments();
    if (rcCount === 0 && sampleVehicles[0] && sampleDrivers[0]) {
      const today = new Date();
      const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      await RunningChartEntry.create({
        entryId: 'RC-00001',
        date: today,
        monthYear,
        vehicle: sampleVehicles[0]._id,
        vehicleReg: sampleVehicles[0].registrationNumber,
        driver: sampleDrivers[0]._id,
        driverName: sampleDrivers[0].fullName,
        customerName: 'Aitken Spence Travels',
        startLocation: 'Colombo Airport (BIA)',
        destination: 'Galle Fort & Return',
        startOdometer: 63950,
        endOdometer: 64200,
        totalKm: 250,
        revenue: 28500,
        fuelCost: 8500,
        tollCharges: 1400,
        parkingCost: 500,
        otherExpenses: 300,
        status: 'Approved',
        notes: 'VIP Tourist Airport pickup and day tour',
      });
    }

    // 8. Vehicle Service record
    const srvCount = await VehicleService.countDocuments();
    if (srvCount === 0 && sampleVehicles[0]) {
      await VehicleService.create({
        serviceId: 'SRV-0001',
        vehicle: sampleVehicles[0]._id,
        vehicleReg: sampleVehicles[0].registrationNumber,
        serviceDate: new Date('2026-09-15'),
        odometerReading: 60000,
        serviceCategory: 'Engine oil change',
        serviceDescription: 'Full synthetic 5W-30 engine oil, oil filter and AC filter replacement',
        workshopName: 'Toyota Lanka Maharagama',
        labourCost: 4500,
        sparePartsCost: 18500,
        otherCharges: 0,
        totalCost: 23000,
        nextServiceOdometer: 65000,
        nextServiceDate: new Date('2026-11-15'),
        status: 'Completed',
      });
    }

    // 9. Document Expiry record
    const docCount = await DocumentRecord.countDocuments();
    if (docCount === 0 && sampleVehicles[0]) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 14); // 14 days ahead
      await DocumentRecord.create({
        docId: 'DOC-0001',
        targetType: 'Vehicle',
        targetId: sampleVehicles[0]._id,
        targetIdentifier: sampleVehicles[0].registrationNumber,
        documentType: 'Revenue Licence',
        referenceNumber: 'RL-2026-887412',
        issueDate: new Date('2025-11-01'),
        expiryDate: expiry,
        verificationStatus: 'Verified',
        notes: 'Annual revenue licence renewal due soon',
      });
    }

    // 10. Social Media Group & Lead
    const grpCount = await SocialGroup.countDocuments();
    if (grpCount === 0) {
      await SocialGroup.create({
        groupId: 'GRP-0001',
        name: 'Sri Lanka Tourism Drivers & Vehicle Hire Forum',
        platform: 'Facebook',
        url: 'https://facebook.com/groups/srilankatransport',
        area: 'Island-wide / Western Province',
        category: 'Transport & Hire',
        memberCount: 45000,
        status: 'Active',
      });
    }

    const leadCount = await SocialLead.countDocuments();
    if (leadCount === 0) {
      await SocialLead.create({
        leadId: 'LEAD-0001',
        leadType: 'Vehicle',
        name: 'Pradeep Kumara',
        phone: '+94 77 999 1122',
        vehicleType: 'Van (KDH)',
        vehicleReg: 'WP-PD-5544',
        serviceAreas: 'Kandy, Nuwara Eliya, Colombo',
        expectedRate: 15000,
        sourcePlatform: 'Facebook',
        sourceGroup: 'Sri Lanka Tourism Drivers & Vehicle Hire Forum',
        postUrl: 'https://facebook.com/groups/srilankatransport/posts/12345',
        status: 'New',
        notes: 'Clean van with dual AC, available for long-term hire.',
      });
    }

    // 11. Invoice
    const invCount = await Invoice.countDocuments();
    if (invCount === 0 && sampleCustomer) {
      await Invoice.create({
        invoiceNumber: 'INV-2026-0001',
        customer: sampleCustomer._id,
        customerName: sampleCustomer.name,
        customerPhone: sampleCustomer.phone,
        customerAddress: sampleCustomer.billingAddress,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'VIP Airport Pickup & 3-Day Southern Coastal Tour (Van KDH)',
            vehicleReg: 'WP-NC-8890',
            quantity: 1,
            unitPrice: 45000,
            total: 45000,
          },
        ],
        subtotal: 45000,
        totalAmount: 45000,
        paidAmount: 0,
        balanceDue: 45000,
        status: 'Issued',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Initial enterprise sample dataset successfully seeded into MongoDB Atlas!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
