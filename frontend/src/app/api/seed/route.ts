import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Customer from '@/models/Customer';
import CustomerCompany from '@/models/CustomerCompany';
import Project from '@/models/Project';
import Contract from '@/models/Contract';
import Supplier from '@/models/Supplier';
import Booking from '@/models/Booking';
import RunningChartEntry from '@/models/RunningChartEntry';
import VehicleService from '@/models/VehicleService';
import SparePart from '@/models/SparePart';
import DriverAdvance from '@/models/DriverAdvance';
import SocialPostTemplate from '@/models/SocialPostTemplate';
import SocialPostDraft from '@/models/SocialPostDraft';
import CompanySettings from '@/models/CompanySettings';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();

    // 1. Settings
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'FleetFlow Lanka Tourism & Transport Services',
        tagline: 'Enterprise Corporate Fleet, Monthly Vehicle Hire & Tourism Operations',
        phone: '+94 11 234 5678 / +94 77 123 4567',
        email: 'operations@fleetflowlanka.lk',
        address: 'No 45, Baseline Road, Colombo 09, Sri Lanka',
        currency: 'LKR',
        invoicePrefix: 'INV-2026-',
        quotationPrefix: 'QT-2026-',
        receiptPrefix: 'REC-2026-',
      });
    }

    // 2. Default Super Admin
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

    // 3. Suppliers
    const supplierSeed = [
      {
        supplierId: 'SUP-0001',
        name: 'Lanka Auto Rentals & Partners (Pvt) Ltd',
        phone: '+94 77 456 7890',
        address: 'No. 88, Galle Road, Colombo 03',
        rateType: 'Monthly Agreement',
        bankDetails: 'Sampath Bank - 0012345678',
      },
      {
        supplierId: 'SUP-0002',
        name: 'Nimal Jayasinghe (Individual Vehicle Owner)',
        phone: '+94 71 890 1234',
        address: '15/A, Kandy Road, Kiribathgoda',
        rateType: 'Monthly Hire',
        bankDetails: 'Commercial Bank - 1009876543',
      },
      {
        supplierId: 'SUP-0003',
        name: 'Southern Auto Spares & Lubricants',
        phone: '+94 91 223 4567',
        address: 'Main Street, Galle',
        rateType: 'Per Delivery',
        bankDetails: 'BOC - 7890123456',
      },
    ];
    for (const sup of supplierSeed) {
      await Supplier.findOneAndUpdate({ supplierId: sup.supplierId }, sup, { upsert: true, new: true });
    }
    const suppliers = await Supplier.find();

    // 4. Fleet of 20 Vehicles (Double Cabs, Vans, etc.)
    const fleetSeed = [
      { vehicleId: 'VEH-0001', registrationNumber: 'WP-CAB-1001', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2021, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 54300, ownershipType: 'Business-owned', status: 'Booked' },
      { vehicleId: 'VEH-0002', registrationNumber: 'WP-CAB-1002', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2022, color: 'White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 42100, ownershipType: 'Business-owned', status: 'Booked' },
      { vehicleId: 'VEH-0003', registrationNumber: 'WP-CAB-1003', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Vigo 4x4', manufacturingYear: 2018, color: 'Black', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 98500, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0004', registrationNumber: 'WP-CAB-1004', vehicleType: 'Double Cab', make: 'Isuzu', model: 'D-Max 4x4', manufacturingYear: 2020, color: 'Grey', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 62000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0005', registrationNumber: 'WP-CAB-1005', vehicleType: 'Double Cab', make: 'Mitsubishi', model: 'L200 Triton', manufacturingYear: 2019, color: 'Red', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 74200, ownershipType: 'Business-owned', status: 'Booked' },
      { vehicleId: 'VEH-0006', registrationNumber: 'WP-CAB-2001', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 2.8', manufacturingYear: 2022, color: 'Pearl White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 38900, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Booked' },
      { vehicleId: 'VEH-0007', registrationNumber: 'WP-CAB-2002', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2020, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 61500, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Booked' },
      { vehicleId: 'VEH-0008', registrationNumber: 'WP-CAB-2003', vehicleType: 'Double Cab', make: 'Isuzu', model: 'D-Max V-Cross', manufacturingYear: 2021, color: 'Blue', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 49000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Available' },
      { vehicleId: 'VEH-0009', registrationNumber: 'WP-CAB-2004', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Vigo', manufacturingYear: 2017, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 112000, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Available' },
      { vehicleId: 'VEH-0010', registrationNumber: 'WP-CAB-2005', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo', manufacturingYear: 2023, color: 'Black', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 22000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Booked' },
      { vehicleId: 'VEH-0011', registrationNumber: 'WP-NC-5501', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH High Roof', manufacturingYear: 2019, color: 'White', fuelType: 'Diesel', seatingCapacity: 14, currentOdometer: 95400, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0012', registrationNumber: 'WP-NC-5502', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH Super GL', manufacturingYear: 2018, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 10, currentOdometer: 118000, ownershipType: 'Business-owned', status: 'Booked' },
      { vehicleId: 'VEH-0013', registrationNumber: 'WP-NC-5503', vehicleType: 'Van', make: 'Toyota', model: 'HiAce Commuter 14-Seat', manufacturingYear: 2020, color: 'White', fuelType: 'Diesel', seatingCapacity: 14, currentOdometer: 72000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Available' },
      { vehicleId: 'VEH-0014', registrationNumber: 'WP-NC-5504', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH 201', manufacturingYear: 2017, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 10, currentOdometer: 134000, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Booked' },
      { vehicleId: 'VEH-0015', registrationNumber: 'WP-NC-5505', vehicleType: 'Van', make: 'Nissan', model: 'Caravan NV350', manufacturingYear: 2019, color: 'Black', fuelType: 'Diesel', seatingCapacity: 12, currentOdometer: 89000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0016', registrationNumber: 'WP-CAB-3001', vehicleType: 'SUV', make: 'Toyota', model: 'Land Cruiser Prado', manufacturingYear: 2019, color: 'Pearl White', fuelType: 'Diesel', seatingCapacity: 7, currentOdometer: 76000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0017', registrationNumber: 'WP-CAB-3002', vehicleType: 'SUV', make: 'Mitsubishi', model: 'Montero Sport', manufacturingYear: 2018, color: 'Black', fuelType: 'Diesel', seatingCapacity: 7, currentOdometer: 84000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0018', registrationNumber: 'WP-CAR-4001', vehicleType: 'Car', make: 'Toyota', model: 'Axio Hybrid', manufacturingYear: 2018, color: 'White', fuelType: 'Hybrid', seatingCapacity: 4, currentOdometer: 68000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0019', registrationNumber: 'WP-CAR-4002', vehicleType: 'Car', make: 'Toyota', model: 'Premio G-Superior', manufacturingYear: 2019, color: 'Wine Red', fuelType: 'Petrol', seatingCapacity: 4, currentOdometer: 52000, ownershipType: 'Business-owned', status: 'Available' },
      { vehicleId: 'VEH-0020', registrationNumber: 'WP-CAB-3003', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux GR Sport', manufacturingYear: 2023, color: 'White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 18500, ownershipType: 'Business-owned', status: 'Available' },
    ];

    for (const item of fleetSeed) {
      await Vehicle.findOneAndUpdate({ vehicleId: item.vehicleId }, item, { upsert: true, new: true });
    }
    const vehicles = await Vehicle.find();

    // 5. Customer Companies
    let companies = await CustomerCompany.find();
    if (companies.length === 0) {
      companies = await CustomerCompany.create([
        {
          companyId: 'COMP-001',
          name: 'Apex Lanka Holdings (Pvt) Ltd',
          registeredName: 'Apex Lanka Holdings & Infrastructure PLC',
          contactPerson: 'Eng. Rohan Samarasinghe (Project Director)',
          phone: '+94 11 289 4500 / +94 77 345 6789',
          email: 'logistics@apexlanka.com',
          billingAddress: 'No. 320, T.B. Jaya Mawatha, Colombo 10, Sri Lanka',
          taxNumber: 'VAT-10928374-7000',
          brNumber: 'PV-89234',
          invoicePreferences: 'Consolidated',
          paymentTerms: '15 Days from Invoice Date',
          status: 'Active',
          notes: 'Premier infrastructure & civil construction client. Operates Southern Expressway and Port projects.',
        },
        {
          companyId: 'COMP-002',
          name: 'Ceylon Agro-Tech Logistics PLC',
          registeredName: 'Ceylon Agro-Tech Export Logistics PLC',
          contactPerson: 'Mr. Chandana Wickramasinghe (Fleet Manager)',
          phone: '+94 11 472 8900 / +94 71 234 5678',
          email: 'transport@agroceylon.lk',
          billingAddress: 'Agro House, 75 Sir James Pieris Mawatha, Colombo 02',
          taxNumber: 'VAT-23456789-7000',
          brNumber: 'PV-12345',
          invoicePreferences: 'Consolidated',
          paymentTerms: '30 Days from Invoice Date',
          status: 'Active',
          notes: 'Highland plantation & field transport client requiring 4x4 double cabs across hill country.',
        },
      ]);
    }

    // 6. Projects
    let projects = await Project.find();
    if (projects.length === 0) {
      projects = await Project.create([
        {
          projectId: 'PRJ-001',
          name: 'Southern Expressway Route Operations',
          customerCompany: companies[0]._id,
          companyName: companies[0].name,
          location: 'Mattala - Hambantota Extension Corridor',
          projectManager: 'Eng. Rohan Samarasinghe',
          phone: '+94 77 345 6789',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2026-12-31'),
          assignedVehicles: [
            { vehicle: vehicles[0]._id, registrationNumber: vehicles[0].registrationNumber, vehicleType: 'Double Cab', ownershipType: 'Business-owned' },
            { vehicle: vehicles[1]._id, registrationNumber: vehicles[1].registrationNumber, vehicleType: 'Double Cab', ownershipType: 'Business-owned' },
          ],
          billingPreferences: 'Monthly Consolidated Invoice with 3000 KM Allowance',
          status: 'Active',
        },
        {
          projectId: 'PRJ-002',
          name: 'Colombo Port Logistics & Access Route',
          customerCompany: companies[0]._id,
          companyName: companies[0].name,
          location: 'Colombo Port East Container Terminal',
          projectManager: 'Mr. Denzil Jayawardena',
          phone: '+94 77 889 9001',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2026-06-30'),
          assignedVehicles: [
            { vehicle: vehicles[5]._id, registrationNumber: vehicles[5].registrationNumber, vehicleType: 'Double Cab', ownershipType: 'Rented' },
          ],
          billingPreferences: 'Monthly Invoice',
          status: 'Active',
        },
        {
          projectId: 'PRJ-003',
          name: 'Highland Tea Estate Field Inspections',
          customerCompany: companies[1]._id,
          companyName: companies[1].name,
          location: 'Hatton, Nuwara Eliya & Maskeliya Routes',
          projectManager: 'Mr. Chandana Wickramasinghe',
          phone: '+94 71 234 5678',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2026-12-31'),
          assignedVehicles: [
            { vehicle: vehicles[6]._id, registrationNumber: vehicles[6].registrationNumber, vehicleType: 'Double Cab', ownershipType: 'Rented' },
            { vehicle: vehicles[11]._id, registrationNumber: vehicles[11].registrationNumber, vehicleType: 'Van', ownershipType: 'Business-owned' },
          ],
          billingPreferences: 'Monthly Consolidated Invoice with 3000 KM Allowance',
          status: 'Active',
        },
      ]);
    }

    // 7. Drivers
    const driverSeed = [
      {
        driverId: 'DRV-0001',
        fullName: 'Kamal Perera',
        phone: '+94 77 987 6543',
        nic: '851234567V',
        address: '42, Temple Road, Maharagama',
        drivingLicenceNumber: 'B8934521',
        licenceExpiryDate: new Date('2028-10-15'),
        employmentType: 'Full-time',
        defaultPaymentMethod: 'Monthly salary',
        basicSalary: 68000,
        overtimeHourlyRate: 500,
        fixedAllowances: 6000,
        epfNumber: 'EPF/COL/4521',
        bankName: 'Commercial Bank of Ceylon',
        bankAccountNumber: '1004567890',
        bankBranch: 'Maharagama',
        epfApplicable: true,
        etfApplicable: true,
        status: 'Available',
      },
      {
        driverId: 'DRV-0002',
        fullName: 'Sunil Shantha',
        phone: '+94 71 456 7890',
        nic: '782345678V',
        address: '15/A, Galle Road, Kalutara',
        drivingLicenceNumber: 'B1245789',
        licenceExpiryDate: new Date('2027-05-20'),
        employmentType: 'Full-time',
        defaultPaymentMethod: 'Monthly salary',
        basicSalary: 65000,
        overtimeHourlyRate: 450,
        fixedAllowances: 5000,
        epfNumber: 'EPF/COL/4522',
        bankName: 'Bank of Ceylon',
        bankAccountNumber: '0089451234',
        bankBranch: 'Kalutara',
        epfApplicable: true,
        etfApplicable: true,
        status: 'Available',
      },
      {
        driverId: 'DRV-0003',
        fullName: 'Priyantha Kumara',
        phone: '+94 76 112 2334',
        nic: '893456789V',
        address: '88, Kandy Road, Gampaha',
        drivingLicenceNumber: 'B7812456',
        licenceExpiryDate: new Date('2029-01-10'),
        employmentType: 'Full-time',
        defaultPaymentMethod: 'Monthly salary',
        basicSalary: 62000,
        overtimeHourlyRate: 450,
        fixedAllowances: 5000,
        epfNumber: 'EPF/COL/4523',
        bankName: 'People\'s Bank',
        bankAccountNumber: '2045678912',
        bankBranch: 'Gampaha',
        epfApplicable: true,
        etfApplicable: true,
        status: 'Available',
      },
      {
        driverId: 'DRV-0004',
        fullName: 'Dhammika Bandara',
        phone: '+94 72 334 4556',
        nic: '814567890V',
        address: '33, Kurunegala Road, Narammala',
        drivingLicenceNumber: 'B9012345',
        licenceExpiryDate: new Date('2028-08-14'),
        employmentType: 'Full-time',
        defaultPaymentMethod: 'Monthly salary',
        basicSalary: 65000,
        overtimeHourlyRate: 450,
        fixedAllowances: 5000,
        epfNumber: 'EPF/COL/4524',
        bankName: 'Hatton National Bank',
        bankAccountNumber: '0891234567',
        bankBranch: 'Narammala',
        epfApplicable: true,
        etfApplicable: true,
        status: 'Available',
      },
    ];
    for (const d of driverSeed) {
      await Driver.findOneAndUpdate({ driverId: d.driverId }, d, { upsert: true, new: true });
    }
    const drivers = await Driver.find();

    // 8. Driver Advances
    let advances = await DriverAdvance.find();
    if (advances.length === 0) {
      advances = await DriverAdvance.create([
        {
          advanceId: 'ADV-0001',
          driver: drivers[0]._id,
          driverName: drivers[0].fullName,
          date: new Date('2026-04-05'),
          amount: 15000,
          appliedAmount: 0,
          remainingBalance: 15000,
          paymentMethod: 'Cash',
          reason: 'Emergency medical expenses for family',
          status: 'Approved',
        },
        {
          advanceId: 'ADV-0002',
          driver: drivers[1]._id,
          driverName: drivers[1].fullName,
          date: new Date('2026-04-08'),
          amount: 10000,
          appliedAmount: 0,
          remainingBalance: 10000,
          paymentMethod: 'Bank Transfer',
          reason: 'Children school book and tuition fees',
          status: 'Approved',
        },
      ]);
    }

    // 9. Contracts
    let contracts = await Contract.find();
    if (contracts.length === 0) {
      const rateCard1 = {
        version: 1,
        effectiveFrom: new Date('2025-01-01'),
        monthlyBasicHireRate: 250000,
        includedMonthlyKm: 3000,
        extraKmRate: 100,
        driverServiceIncluded: true,
        driverMonthlyRate: 0,
        fuelIncluded: false,
        fuelReimbursementMethod: 'Customer Provides Fuel or Reimbursed at Actuals',
        normalWorkingHours: 8,
        overtimeHourlyRate: 600,
        additionalCharges: 0,
        changeReason: 'Original Annual Commercial Agreement for 2025/2026',
        approvedBy: 'Eng. Rohan Samarasinghe / FleetFlow Lanka Director',
      };

      contracts = await Contract.create([
        {
          contractId: 'CNT-2026-001',
          contractNumber: 'AGR/FF/APEX/2025-01',
          customerCompany: companies[0]._id,
          companyName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2026-12-31'),
          status: 'Active',
          assignedVehicles: [
            {
              vehicle: vehicles[0]._id,
              registrationNumber: vehicles[0].registrationNumber,
              vehicleCategory: 'Double Cab',
              ownershipType: 'Business-owned',
            },
            {
              vehicle: vehicles[1]._id,
              registrationNumber: vehicles[1].registrationNumber,
              vehicleCategory: 'Double Cab',
              ownershipType: 'Business-owned',
            },
          ],
          rateCard: rateCard1,
          rateVersions: [rateCard1],
          paymentTerms: 'Monthly hire billing. 3,000 KM included per vehicle. Net 15 days.',
          notes: 'Two double cabs assigned for Southern Expressway route operations.',
        },
        {
          contractId: 'CNT-2026-002',
          contractNumber: 'AGR/FF/AGRO/2025-02',
          customerCompany: companies[1]._id,
          companyName: companies[1].name,
          project: projects[2]._id,
          projectName: projects[2].name,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2026-12-31'),
          status: 'Active',
          assignedVehicles: [
            {
              vehicle: vehicles[6]._id,
              registrationNumber: vehicles[6].registrationNumber,
              vehicleCategory: 'Double Cab',
              ownershipType: 'Rented',
              supplier: suppliers[1]._id,
              supplierName: suppliers[1].name,
            },
          ],
          rateCard: {
            version: 1,
            effectiveFrom: new Date('2025-02-01'),
            monthlyBasicHireRate: 260000,
            includedMonthlyKm: 3000,
            extraKmRate: 110,
            driverServiceIncluded: true,
            driverMonthlyRate: 0,
            fuelIncluded: false,
            fuelReimbursementMethod: 'Customer Fuel Card Provided',
            normalWorkingHours: 10,
            overtimeHourlyRate: 650,
            additionalCharges: 0,
          },
          rateVersions: [
            {
              version: 1,
              effectiveFrom: new Date('2025-02-01'),
              monthlyBasicHireRate: 260000,
              includedMonthlyKm: 3000,
              extraKmRate: 110,
              driverServiceIncluded: true,
              driverMonthlyRate: 0,
              fuelIncluded: false,
              fuelReimbursementMethod: 'Customer Fuel Card Provided',
              normalWorkingHours: 10,
              overtimeHourlyRate: 650,
              additionalCharges: 0,
            },
          ],
          paymentTerms: 'Net 30 days upon submission of verified monthly running charts.',
          notes: 'Highland estate double cab with 4x4 capability.',
        },
      ]);
    }

    // 10. Running Chart Entries
    const runCount = await RunningChartEntry.countDocuments();
    if (runCount < 5) {
      await RunningChartEntry.create([
        {
          entryId: 'RUN-2026-04-01',
          date: new Date('2026-04-02'),
          monthYear: '2026-04',
          vehicle: vehicles[0]._id,
          vehicleReg: vehicles[0].registrationNumber,
          driver: drivers[0]._id,
          driverName: drivers[0].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Colombo Site Office',
          destination: 'Mattala Site Office & Hambantota Route',
          startOdometer: 50850,
          endOdometer: 52600,
          totalKm: 1750,
          otHours: 12,
          fuelLitres: 140,
          fuelCost: 46200,
          status: 'Approved',
        },
        {
          entryId: 'RUN-2026-04-02',
          date: new Date('2026-04-12'),
          monthYear: '2026-04',
          vehicle: vehicles[0]._id,
          vehicleReg: vehicles[0].registrationNumber,
          driver: drivers[0]._id,
          driverName: drivers[0].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Hambantota Route',
          destination: 'Galle & Southern Expressway Inspection',
          startOdometer: 52600,
          endOdometer: 54300,
          totalKm: 1700,
          otHours: 8,
          fuelLitres: 135,
          fuelCost: 44550,
          status: 'Approved',
        },
        {
          entryId: 'RUN-2026-04-03',
          date: new Date('2026-04-05'),
          monthYear: '2026-04',
          vehicle: vehicles[1]._id,
          vehicleReg: vehicles[1].registrationNumber,
          driver: drivers[1]._id,
          driverName: drivers[1].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Colombo Depot',
          destination: 'Mattala Southern Corridor',
          startOdometer: 39200,
          endOdometer: 42100,
          totalKm: 2900,
          otHours: 6,
          fuelLitres: 220,
          fuelCost: 72600,
          status: 'Approved',
        },
      ]);
    }

    // 11. Spare Parts Catalog
    let parts = await SparePart.find();
    if (parts.length === 0) {
      parts = await SparePart.create([
        {
          partId: 'PRT-0001',
          sku: 'OIL-15W40-01',
          name: 'Castrol Magnatec Diesel 15W-40 (5L Can)',
          category: 'Lubricants & Fluids',
          brand: 'Castrol',
          partNumber: 'CAS-15W40-5L',
          compatibleVehicles: 'Toyota Hilux Revo, Vigo, Isuzu D-Max',
          unitOfMeasure: 'Bottles',
          currentStock: 12,
          minStockLevel: 4,
          reorderQuantity: 10,
          unitCost: 14500,
          preferredSupplier: suppliers[2]._id,
          supplierName: suppliers[2].name,
          storageLocation: 'Shelf L-1 Lubricants Bay',
        },
        {
          partId: 'PRT-0002',
          sku: 'FLT-OIL-HILUX',
          name: 'Toyota Genuine Oil Filter (Hilux / HiAce)',
          category: 'Filters',
          brand: 'Toyota Genuine',
          partNumber: '90915-YZZD2',
          compatibleVehicles: 'Toyota Hilux Revo 2.4/2.8, Vigo 2.5/3.0, HiAce KDH',
          unitOfMeasure: 'Units',
          currentStock: 18,
          minStockLevel: 5,
          reorderQuantity: 15,
          unitCost: 3800,
          preferredSupplier: suppliers[2]._id,
          supplierName: suppliers[2].name,
          storageLocation: 'Shelf F-2 Filter Rack',
        },
        {
          partId: 'PRT-0003',
          sku: 'BRK-PAD-REVO',
          name: 'Front Ceramic Brake Pads Set (Hilux Revo 4x4)',
          category: 'Braking System',
          brand: 'Akebono Japan',
          partNumber: 'AN-768WK',
          compatibleVehicles: 'Toyota Hilux Revo 2018-2024 (GUN125 / GUN126)',
          unitOfMeasure: 'Sets',
          currentStock: 3,
          minStockLevel: 4,
          reorderQuantity: 6,
          unitCost: 16500,
          preferredSupplier: suppliers[2]._id,
          supplierName: suppliers[2].name,
          storageLocation: 'Shelf B-1 Brake Components',
        },
        {
          partId: 'PRT-0004',
          sku: 'TYR-265-65R17',
          name: 'Bridgestone Dueler A/T 265/65 R17 (4x4 Tyre)',
          category: 'Tyres & Wheels',
          brand: 'Bridgestone',
          partNumber: 'BS-2656517-AT',
          compatibleVehicles: 'Toyota Hilux Revo 4x4, Isuzu D-Max, Prado',
          unitOfMeasure: 'Units',
          currentStock: 6,
          minStockLevel: 4,
          reorderQuantity: 8,
          unitCost: 72000,
          preferredSupplier: suppliers[2]._id,
          supplierName: suppliers[2].name,
          storageLocation: 'Tyre Storage Bay T-1',
        },
      ]);
    }

    // 12. Service Record
    const srvCount = await VehicleService.countDocuments();
    if (srvCount === 0) {
      await VehicleService.create({
        serviceId: 'SRV-0001',
        vehicle: vehicles[0]._id,
        vehicleReg: vehicles[0].registrationNumber,
        serviceDate: new Date('2026-03-25'),
        odometerReading: 50000,
        serviceCategory: 'Engine oil change',
        serviceDescription: 'Periodic 50,000 km routine service, synthetic engine oil replacement and filter change.',
        workshopName: 'FleetFlow Central Garage & Workshop',
        partsUsed: [
          {
            part: parts[0]._id,
            sku: parts[0].sku,
            partName: parts[0].name,
            quantity: 2,
            unitCost: 14500,
            totalCost: 29000,
            issuedFromInventory: true,
          },
          {
            part: parts[1]._id,
            sku: parts[1].sku,
            partName: parts[1].name,
            quantity: 1,
            unitCost: 3800,
            totalCost: 3800,
            issuedFromInventory: true,
          },
        ],
        labourCost: 6500,
        sparePartsCost: 32800,
        otherCharges: 1200,
        totalCost: 40500,
        nextServiceOdometer: 55000,
        nextServiceDate: new Date('2026-06-25'),
        status: 'Completed',
        notes: 'Oil changed with Castrol Magnatec. Filter changed.',
      });
    }

    // 13. Social Templates
    let templates = await SocialPostTemplate.find();
    if (templates.length === 0) {
      templates = await SocialPostTemplate.create([
        {
          templateId: 'TPL-001',
          title: 'Toyota Hilux Revo 4x4 Double Cab Monthly Corporate Rental',
          category: 'Double Cab Availability',
          vehicleType: 'Toyota Hilux Revo 4x4 Double Cab',
          defaultRate: 'LKR 250,000 / month',
          defaultAllowance: '3,000 KM Included / Month',
          bannerHeadline: 'PREMIUM DOUBLE CAB AVAILABLE',
          badgeText: '3,000 KM INCLUDED',
          imageTheme: 'Emerald',
          defaultCaptionTemplate:
            '🚗 FLEETFLOW LANKA — TOYOTA HILUX REVO DOUBLE CAB FOR IMMEDIATE HIRE!\n\n' +
            '📍 Location: {location}\n' +
            '💼 Contract Type: {hireType}\n' +
            '💰 Basic Rate: {rateText}\n' +
            '🛣️ Monthly Included Allowance: {kmAllowanceText}\n' +
            '⚡ Extra Mileage: {extraKmRateText}\n' +
            '👨‍✈️ Driver: {driverAvailability}\n' +
            '⛽ Fuel: {fuelArrangement}\n\n' +
            'Perfect for corporate projects, expressway travel, site inspections, and executive transport.\n\n' +
            '📞 Call/WhatsApp: {contactNumber}\n' +
            '🌐 {companyName}',
        },
        {
          templateId: 'TPL-002',
          title: 'Toyota HiAce KDH Van 2-Day Outstation Tour & Event Hire',
          category: 'Daily 2-Day Tour Hire',
          vehicleType: 'Toyota HiAce KDH Super GL (10/14 Seater)',
          defaultRate: 'LKR 18,500 / day',
          defaultAllowance: '200 KM / Day Included',
          bannerHeadline: 'LUXURY TOUR VAN HIRE',
          badgeText: 'COMFORTABLE HIGH ROOF',
          imageTheme: 'Navy',
          defaultCaptionTemplate:
            '🚐 FLEETFLOW LANKA — 2-DAY OUTSTATION TOUR & FAMILY TRIP VAN HIRE!\n\n' +
            '📍 Pickup / Service Route: {location}\n' +
            '📅 Availability: Immediate / Booking confirmed in 5 mins\n' +
            '💰 Daily Rate: {rateText}\n' +
            '🛣️ Mileage Allowance: {kmAllowanceText}\n' +
            '👨‍✈️ Highly Experienced Tourist Board / Corporate Driver Provided\n' +
            '❄️ Dual Line A/C, Adjustable Reclining Seats, High Roof Comfort\n\n' +
            '📞 Inquiries & Bookings: {contactNumber}\n' +
            '🌐 {companyName}',
        },
        {
          templateId: 'TPL-003',
          title: 'Immediate Driver Wanted for Corporate Double Cab Fleet',
          category: 'Driver Recruitment',
          vehicleType: 'Double Cab & High-Roof Van',
          defaultRate: 'LKR 65,000 Basic + Overtime + EPF/ETF',
          defaultAllowance: 'Standard Allowance Provided',
          bannerHeadline: 'WE ARE HIRING DRIVERS',
          badgeText: 'FULL-TIME WITH EPF/ETF',
          imageTheme: 'Amber',
          defaultCaptionTemplate:
            '👨‍✈️ VACANCY: PROFESSIONAL FLEET DRIVERS WANTED!\n\n' +
            'Company: {companyName}\n' +
            'Vehicle Type: {vehicleType}\n' +
            '💰 Salary: {rateText}\n' +
            '⭐ Benefits: Overtime (OT), EPF (8% + 12%), ETF (3%), Food Allowances\n' +
            '📌 Requirements: Clean Heavy/Light Vehicle Driving Licence, 3+ Years Experience, Good Communication\n\n' +
            '📞 Call today to schedule your interview: {contactNumber}',
        },
      ]);
    }

    // 14. Social Post Draft
    let drafts = await SocialPostDraft.find();
    if (drafts.length === 0) {
      drafts = await SocialPostDraft.create([
        {
          postId: 'POST-0001',
          templateId: templates[0].templateId,
          title: 'Double Cab Availability - Mattala & Southern Route',
          vehicleType: 'Toyota Hilux Revo 4x4 (Auto)',
          hireType: 'Monthly Corporate Contract',
          rateText: 'LKR 250,000 / month',
          kmAllowanceText: '3,000 KM Included Monthly',
          extraKmRateText: 'LKR 100 / Extra KM',
          driverAvailability: 'Full-time Professional Driver Included',
          fuelArrangement: 'Customer Fuel / Reimbursed Fuel Options Available',
          location: 'Hambantota / Mattala / Galle / Colombo',
          contactNumber: '+94 77 123 4567 / +94 71 987 6543',
          companyName: 'FleetFlow Lanka Tourism & Transport Services',
          bannerHeadline: 'DOUBLE CAB AVAILABLE FOR HIRE',
          badgeText: '3,000 KM INCLUDED',
          imageTheme: 'Emerald',
          status: 'Ready to Share',
          caption:
            '🚗 FLEETFLOW LANKA — TOYOTA HILUX REVO DOUBLE CAB FOR IMMEDIATE HIRE!\n\n' +
            '📍 Location: Hambantota / Mattala / Galle / Colombo\n' +
            '💼 Contract Type: Monthly Corporate Contract\n' +
            '💰 Basic Rate: LKR 250,000 / month\n' +
            '🛣️ Monthly Included Allowance: 3,000 KM Included Monthly\n' +
            '⚡ Extra Mileage: LKR 100 / Extra KM\n' +
            '👨‍✈️ Driver: Full-time Professional Driver Included\n' +
            '⛽ Fuel: Customer Fuel / Reimbursed Fuel Options Available\n\n' +
            'Perfect for corporate projects, expressway travel, site inspections, and executive transport.\n\n' +
            '📞 Call/WhatsApp: +94 77 123 4567 / +94 71 987 6543\n' +
            '🌐 FleetFlow Lanka Tourism & Transport Services',
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'FleetFlow Enterprise Database populated successfully with multi-company, contract, fleet, inventory, payroll, and social media data!',
      counts: {
        vehicles: await Vehicle.countDocuments(),
        drivers: await Driver.countDocuments(),
        customerCompanies: await CustomerCompany.countDocuments(),
        projects: await Project.countDocuments(),
        contracts: await Contract.countDocuments(),
        spareParts: await SparePart.countDocuments(),
        services: await VehicleService.countDocuments(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
