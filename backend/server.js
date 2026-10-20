require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sudilthathsara19_db_user:JRekPIJDyPvd5rX9@cluster0.xqk8qbk.mongodb.net/fleetflow_db?retryWrites=true&w=majority";
const JWT_SECRET = process.env.JWT_SECRET || "fleetflow_enterprise_secure_jwt_token_secret_key_2026";

// MongoDB Atlas Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ FleetFlow Backend connected to MongoDB Atlas!'))
  .catch((err) => console.error('MongoDB Atlas Connection Error:', err.message));

// ================= SCHEMAS =================
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'accountant', 'operations', 'maintenance', 'auditor'],
      default: 'operations',
    },
    phone: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const VehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    manufacturingYear: { type: Number, required: true },
    color: { type: String, default: 'White' },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Hybrid', 'Electric'], default: 'Diesel' },
    seatingCapacity: { type: Number, default: 4 },
    currentOdometer: { type: Number, required: true, default: 0 },
    ownershipType: {
      type: String,
      enum: ['Business-owned', 'Leased', 'Rented', 'Third-party or partner-owned'],
      default: 'Business-owned',
    },
    ownerSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    ownerName: { type: String },
    hireRate: { type: Number, default: 0 },
    serviceIntervalKm: { type: Number, default: 5000 },
    lastServiceOdometer: { type: Number, default: 0 },
    nextServiceOdometer: { type: Number, default: 5000 },
    nextServiceDate: { type: Date },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'On Trip', 'Under Maintenance', 'Inactive', 'Retired'],
      default: 'Available',
    },
    notes: { type: String },
  },
  { timestamps: true }
);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

const DriverSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    nic: { type: String, required: true },
    address: { type: String, required: true },
    drivingLicenceNumber: { type: String, required: true },
    licenceCategory: { type: String, default: 'Heavy Vehicle' },
    licenceExpiryDate: { type: Date, required: true },
    employmentType: { type: String, default: 'Full-time' },
    defaultPaymentMethod: { type: String, default: 'Monthly salary' },
    defaultRate: { type: Number, default: 3500 },
    basicSalary: { type: Number, default: 65000 },
    overtimeHourlyRate: { type: Number, default: 450 },
    fixedAllowances: { type: Number, default: 5000 },
    epfNumber: { type: String, default: '' },
    bankName: { type: String, default: 'Commercial Bank of Ceylon' },
    bankAccountNumber: { type: String, default: '' },
    bankBranch: { type: String, default: 'Colombo' },
    epfApplicable: { type: Boolean, default: true },
    etfApplicable: { type: Boolean, default: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedVehicleReg: { type: String },
    status: { type: String, default: 'Available' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Driver = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);

const CustomerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    companyName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    billingAddress: { type: String, required: true },
    customerCategory: { type: String, default: 'Corporate' },
    outstandingBalance: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

const CustomerCompanySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    registeredName: { type: String },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    billingAddress: { type: String, required: true },
    taxNumber: { type: String },
    brNumber: { type: String },
    invoicePreferences: { type: String, default: 'Consolidated' },
    paymentTerms: { type: String, default: '15 Days from Invoice Date' },
    status: { type: String, default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);
const CustomerCompany = mongoose.models.CustomerCompany || mongoose.model('CustomerCompany', CustomerCompanySchema);

const ProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    projectManager: { type: String, required: true },
    phone: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    assignedVehicles: [
      {
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
        registrationNumber: { type: String, required: true },
        vehicleType: { type: String },
        ownershipType: { type: String },
      },
    ],
    assignedDrivers: [
      {
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
        driverName: { type: String, required: true },
        phone: { type: String },
      },
    ],
    billingPreferences: { type: String, default: 'Monthly Consolidated Invoice with 3000 KM Allowance' },
    status: { type: String, default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const ContractRateVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, default: 1 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date },
    monthlyBasicHireRate: { type: Number, required: true, default: 250000 },
    includedMonthlyKm: { type: Number, required: true, default: 3000 },
    extraKmRate: { type: Number, required: true, default: 100 },
    driverServiceIncluded: { type: Boolean, default: true },
    driverMonthlyRate: { type: Number, default: 0 },
    fuelIncluded: { type: Boolean, default: false },
    fuelReimbursementMethod: { type: String, default: 'Customer Provides Fuel or Reimbursed at Actuals' },
    normalWorkingHours: { type: Number, default: 8 },
    overtimeHourlyRate: { type: Number, default: 600 },
    additionalCharges: { type: Number, default: 0 },
    changeReason: { type: String },
    approvedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ContractSchema = new mongoose.Schema(
  {
    contractId: { type: String, required: true, unique: true },
    contractNumber: { type: String, required: true, unique: true },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    projectName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'Active' },
    assignedVehicles: [
      {
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        registrationNumber: { type: String, required: true },
        vehicleCategory: { type: String, required: true, default: 'Double Cab' },
        ownershipType: { type: String, default: 'Business-owned' },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
        supplierName: { type: String },
      },
    ],
    rateCard: { type: ContractRateVersionSchema, required: true },
    rateVersions: [ContractRateVersionSchema],
    paymentTerms: { type: String, default: 'Monthly billing, payment due within 15 days of invoice date.' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Contract = mongoose.models.Contract || mongoose.model('Contract', ContractSchema);

const ContractMonthlyBillingRunSchema = new mongoose.Schema(
  {
    billingRunId: { type: String, required: true, unique: true },
    contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    contractNumber: { type: String, required: true },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany', required: true },
    companyName: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    projectName: { type: String, required: true },
    billingMonth: { type: String, required: true },
    rateVersionUsed: { type: Number, default: 1 },
    vehicleLines: [
      {
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        registrationNumber: { type: String, required: true },
        vehicleCategory: { type: String, default: 'Double Cab' },
        monthlyBasicHire: { type: Number, required: true },
        includedKm: { type: Number, required: true, default: 3000 },
        actualKm: { type: Number, required: true, default: 0 },
        billableExtraKm: { type: Number, required: true, default: 0 },
        extraKmRate: { type: Number, required: true, default: 0 },
        extraKmCharge: { type: Number, required: true, default: 0 },
        approvedOtHours: { type: Number, default: 0 },
        otRate: { type: Number, default: 0 },
        otCharge: { type: Number, default: 0 },
        fuelCharge: { type: Number, default: 0 },
        driverCharge: { type: Number, default: 0 },
        additionalCharges: { type: Number, default: 0 },
        lineSubtotal: { type: Number, required: true },
        notes: { type: String },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    status: { type: String, default: 'Draft' },
    generatedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    generatedInvoiceNumber: { type: String },
    warnings: [{ type: String }],
    approvedBy: { type: String },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);
const ContractMonthlyBillingRun = mongoose.models.ContractMonthlyBillingRun || mongoose.model('ContractMonthlyBillingRun', ContractMonthlyBillingRunSchema);

const SupplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    supplierCategory: { type: String, default: 'Vehicle Owner' }, // Vehicle Owner, Workshop, Spare Parts, Fuel
    rateType: { type: String, default: 'Per Day' },
    serviceAreas: { type: String },
    bankDetails: { type: String },
    outstandingPayable: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);

const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    bookingType: { type: String, default: 'Daily / Short-term Hire' }, // Daily / Short-term Hire, 2-Day Tour, Monthly Hire
    billableDays: { type: Number, default: 2 },
    dailyRate: { type: Number, default: 18000 },
    includedKm: { type: Number, default: 200 },
    extraKmRate: { type: Number, default: 100 },
    bookingSource: { type: String, default: 'Direct' },
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    vehicleType: { type: String, required: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedVehicleReg: { type: String },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    assignedDriverName: { type: String },
    agreedPrice: { type: Number, default: 0 },
    advanceReceived: { type: Number, default: 0 },
    status: { type: String, default: 'Confirmed' },
    startOdometer: { type: Number },
    endOdometer: { type: Number },
    totalKm: { type: Number, default: 0 },
    actualFuelCost: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

const RunningChartEntrySchema = new mongoose.Schema(
  {
    entryId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    monthYear: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleReg: { type: String, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    driverName: { type: String, required: true },
    customerName: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    startLocation: { type: String, required: true },
    destination: { type: String, required: true },
    startOdometer: { type: Number, required: true },
    endOdometer: { type: Number, required: true },
    totalKm: { type: Number, required: true },
    otHours: { type: Number, default: 0 },
    fuelLitres: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    tollCharges: { type: Number, default: 0 },
    parkingCost: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, default: 'Approved' },
  },
  { timestamps: true }
);
const RunningChartEntry = mongoose.models.RunningChartEntry || mongoose.model('RunningChartEntry', RunningChartEntrySchema);

// Spare Part Schema
const SparePartSchema = new mongoose.Schema(
  {
    partId: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Lubricants & Fluids', 'Filters', 'Braking System', 'Tyres & Wheels', 'Suspension', 'Electrical & Battery', 'Engine Parts', 'General'],
      default: 'General',
    },
    brand: { type: String, required: true },
    partNumber: { type: String },
    compatibleVehicles: { type: String, required: true, default: 'All Fleet Models' },
    unitOfMeasure: { type: String, enum: ['Liters', 'Units', 'Sets', 'Bottles', 'Pcs', 'Pairs'], default: 'Units' },
    currentStock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 2 },
    reorderQuantity: { type: Number, default: 5 },
    unitCost: { type: Number, required: true, default: 0 },
    preferredSupplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    storageLocation: { type: String, default: 'Main Garage Shelf A-1' },
    notes: { type: String },
  },
  { timestamps: true }
);
const SparePart = mongoose.models.SparePart || mongoose.model('SparePart', SparePartSchema);

// Inventory Transaction Schema
const InventoryTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart', required: true },
    sku: { type: String, required: true },
    partName: { type: String, required: true },
    type: {
      type: String,
      enum: ['PURCHASE_RECEIPT', 'ISSUED_TO_SERVICE', 'RETURNED_TO_STOCK', 'ADJUSTMENT', 'DAMAGED_LOST'],
      required: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true, default: 0 },
    totalCost: { type: Number, required: true, default: 0 },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleReg: { type: String },
    serviceJob: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleService' },
    reference: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);
const InventoryTransaction = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', InventoryTransactionSchema);

// Vehicle Service / Maintenance Job Schema
const VehicleServiceSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleReg: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    odometerReading: { type: Number, required: true },
    serviceCategory: {
      type: String,
      default: 'General service',
    },
    serviceDescription: { type: String, required: true },
    workshopName: { type: String, required: true },
    partsUsed: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
        sku: { type: String },
        partName: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitCost: { type: Number, required: true, default: 0 },
        totalCost: { type: Number, required: true, default: 0 },
        issuedFromInventory: { type: Boolean, default: true },
      },
    ],
    labourCost: { type: Number, default: 0 },
    sparePartsCost: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    invoiceReceiptRef: { type: String },
    nextServiceOdometer: { type: Number },
    nextServiceDate: { type: Date },
    status: { type: String, default: 'Completed' },
    notes: { type: String },
  },
  { timestamps: true }
);
const VehicleService = mongoose.models.VehicleService || mongoose.model('VehicleService', VehicleServiceSchema);

const DocumentRecordSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true, unique: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetIdentifier: { type: String, required: true },
    documentType: { type: String, required: true },
    referenceNumber: { type: String, required: true },
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);
const DocumentRecord = mongoose.models.DocumentRecord || mongoose.model('DocumentRecord', DocumentRecordSchema);

const QuotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    quotationType: { type: String, default: 'Monthly Annual Agreement' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    issueDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    items: [
      {
        description: { type: String, required: true },
        vehicleType: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
        includedKm: { type: Number, default: 3000 },
        extraKmRate: { type: Number, default: 100 },
        otHourlyRate: { type: Number, default: 600 },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    driverArrangement: { type: String, default: 'Experienced Professional Driver Included' },
    fuelArrangement: { type: String, default: 'Fuel Billed at Actuals or Customer Provides' },
    terms: { type: String, default: 'Standard 3,000 KM included per month. Excess KM billed at agreed rates.' },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Converted'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);
const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: { type: String, default: 'Monthly Agreement' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    contractNumber: { type: String },
    billingMonth: { type: String },
    bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [
      {
        description: { type: String },
        vehicleReg: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        chargeType: { type: String, default: 'Monthly Basic Hire' },
        includedKm: { type: Number, default: 0 },
        actualKm: { type: Number, default: 0 },
        billableExtraKm: { type: Number, default: 0 },
        extraKmRate: { type: Number, default: 0 },
        otHours: { type: Number, default: 0 },
        otRate: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: { type: String, default: 'Issued' },
    paymentTerms: { type: String, default: 'Net 15 days. Payable by Bank Transfer or Cheque.' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

const PaymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCompany' },
    customerName: { type: String, required: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceNumber: { type: String },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    transactionReference: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

const DriverAdvanceSchema = new mongoose.Schema(
  {
    advanceId: { type: String, required: true, unique: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    appliedAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash' },
    reason: { type: String, required: true },
    status: { type: String, default: 'Approved' },
    repayments: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        payrollMonth: { type: String },
        notes: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);
const DriverAdvance = mongoose.models.DriverAdvance || mongoose.model('DriverAdvance', DriverAdvanceSchema);

// Driver Payroll Period Schema
const PayrollPeriodSchema = new mongoose.Schema(
  {
    payrollId: { type: String, required: true, unique: true },
    monthYear: { type: String, required: true },
    status: { type: String, default: 'Draft' },
    entries: [
      {
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
        driverName: { type: String, required: true },
        epfNumber: { type: String, default: '' },
        employmentType: { type: String, default: 'Full-time' },
        basicSalary: { type: Number, required: true, default: 0 },
        attendanceDays: { type: Number, default: 26 },
        overtimeHours: { type: Number, default: 0 },
        overtimeEarnings: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        grossEarnings: { type: Number, required: true, default: 0 },
        qualifyingEarnings: { type: Number, required: true, default: 0 },
        employeeEpfRate: { type: Number, default: 8 },
        employeeEpfDeduction: { type: Number, default: 0 },
        employerEpfRate: { type: Number, default: 12 },
        employerEpfContribution: { type: Number, default: 0 },
        employerEtfRate: { type: Number, default: 3 },
        employerEtfContribution: { type: Number, default: 0 },
        advancesDeducted: { type: Number, default: 0 },
        otherDeductions: { type: Number, default: 0 },
        netSalary: { type: Number, required: true, default: 0 },
        totalEmployerCost: { type: Number, required: true, default: 0 },
        amountPaid: { type: Number, default: 0 },
        remainingBalance: { type: Number, default: 0 },
        paymentStatus: { type: String, default: 'Unpaid' },
        paymentReference: { type: String },
        paymentDate: { type: Date },
        notes: { type: String },
      },
    ],
    totalGross: { type: Number, default: 0 },
    totalEmployeeEpf: { type: Number, default: 0 },
    totalEmployerEpf: { type: Number, default: 0 },
    totalEmployerEtf: { type: Number, default: 0 },
    totalAdvancesDeducted: { type: Number, default: 0 },
    totalNetSalary: { type: Number, default: 0 },
    totalEmployerCost: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);
const PayrollPeriod = mongoose.models.PayrollPeriod || mongoose.model('PayrollPeriod', PayrollPeriodSchema);

const ExpenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Cash' },
    receiptNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

const SocialPostTemplateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true, default: 'Double Cab Availability' },
    vehicleType: { type: String, required: true, default: 'Toyota Hilux Double Cab' },
    defaultRate: { type: String, default: 'LKR 250,000 / month' },
    defaultAllowance: { type: String, default: '3,000 KM Included / Month' },
    defaultCaptionTemplate: { type: String, required: true },
    bannerHeadline: { type: String, default: 'PREMIUM DOUBLE CAB HIRE' },
    badgeText: { type: String, default: '3,000 KM INCLUDED' },
    imageTheme: { type: String, default: 'Emerald' },
    status: { type: String, default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);
const SocialPostTemplate = mongoose.models.SocialPostTemplate || mongoose.model('SocialPostTemplate', SocialPostTemplateSchema);

const SocialPostDraftSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, unique: true },
    templateId: { type: String },
    title: { type: String, required: true },
    vehicleType: { type: String, required: true, default: 'Toyota Hilux 4x4 Double Cab' },
    hireType: { type: String, default: 'Monthly Corporate Hire' },
    rateText: { type: String, default: 'LKR 260,000 / month' },
    kmAllowanceText: { type: String, default: '3,000 KM Included / Month' },
    extraKmRateText: { type: String, default: 'LKR 110 per Extra KM' },
    driverAvailability: { type: String, default: 'Experienced Professional Driver' },
    fuelArrangement: { type: String, default: 'Customer Fuel / Reimbursed Fuel Options' },
    location: { type: String, default: 'Colombo & Island-wide Route' },
    destination: { type: String },
    eventDate: { type: String },
    contactNumber: { type: String, default: '+94 77 123 4567 / +94 71 987 6543' },
    companyName: { type: String, default: 'FleetFlow Lanka Tourism & Transport' },
    specialConditions: { type: String, default: 'Corporate long-term contract & 2-day short hire available' },
    caption: { type: String, required: true },
    imageTheme: { type: String, default: 'Emerald' },
    bannerHeadline: { type: String, default: 'DOUBLE CAB HIRE AVAILABLE' },
    badgeText: { type: String, default: '3,000 KM INCLUDED' },
    status: { type: String, default: 'Draft' },
    targetGroups: [{ type: String }],
    intendedPublicationDate: { type: Date },
    publishedUrl: { type: String },
    publishedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);
const SocialPostDraft = mongoose.models.SocialPostDraft || mongoose.model('SocialPostDraft', SocialPostDraftSchema);

const SocialGroupSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    platform: { type: String, default: 'Facebook' },
    url: { type: String, required: true },
    area: { type: String, default: 'Colombo & Western Province' },
    category: { type: String, default: 'Transport & Hire' },
    postingRules: { type: String },
    memberCount: { type: Number, default: 0 },
    lastPostedDate: { type: Date },
    status: { type: String, default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);
const SocialGroup = mongoose.models.SocialGroup || mongoose.model('SocialGroup', SocialGroupSchema);

const SocialLeadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    leadType: { type: String, default: 'Vehicle' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String },
    vehicleReg: { type: String },
    serviceAreas: { type: String },
    expectedRate: { type: Number, default: 0 },
    sourcePlatform: { type: String, default: 'Facebook' },
    status: { type: String, default: 'New' },
    notes: { type: String },
  },
  { timestamps: true }
);
const SocialLead = mongoose.models.SocialLead || mongoose.model('SocialLead', SocialLeadSchema);

const CompanySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'FleetFlow Lanka (Pvt) Ltd' },
    tagline: { type: String, default: 'Enterprise Vehicle, Fleet & Transport Operations Management' },
    logoUrl: { type: String, default: '' },
    phone: { type: String, default: '+94 11 234 5678 / +94 77 123 4567' },
    email: { type: String, default: 'operations@fleetflowlanka.lk' },
    address: { type: String, default: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka' },
    currency: { type: String, default: 'LKR' },
    vatNumber: { type: String, default: 'VAT-10928374-7000' },
    brNumber: { type: String, default: 'PV-98765/2024' },
    invoicePrefix: { type: String, default: 'INV-2026-' },
    quotationPrefix: { type: String, default: 'QT-2026-' },
    receiptPrefix: { type: String, default: 'REC-2026-' },
    terms: { type: String, default: 'Payment due within 15 days. Running charges calculated from verified odometer logs.' },
    bankAccountDetails: { type: String, default: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: FleetFlow Lanka (Pvt) Ltd' },

    // Sri Lanka Statutory EPF & ETF Configuration
    epfEmployeeRate: { type: Number, default: 8 },
    epfEmployerRate: { type: Number, default: 12 },
    etfEmployerRate: { type: Number, default: 3 },
    epfRegistrationNumber: { type: String, default: 'EPF/C/94821' },
    etfRegistrationNumber: { type: String, default: 'ETF/L/38291' },
    maxAdvanceDeductionPerMonth: { type: Number, default: 10000 },
    normalWorkingHoursPerDay: { type: Number, default: 8 },
  },
  { timestamps: true }
);
const CompanySettings = mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);

// Auth Middleware
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/fleetflow_token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Access denied: Insufficient privileges' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
};

// ================= ROUTES =================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FleetFlow Enterprise Master Backend API',
    database: mongoose.connection.readyState === 1 ? 'Connected to Atlas' : 'Connecting...',
  });
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || 'operations',
      phone,
    });
    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { passwordHash }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Password reset successfully', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= CUSTOMER COMPANIES =================
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await CustomerCompany.find().sort({ createdAt: -1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const count = await CustomerCompany.countDocuments();
    const companyId = req.body.companyId || `COMP-${String(count + 1).padStart(3, '0')}`;
    const newCompany = await CustomerCompany.create({ ...req.body, companyId });
    res.status(201).json({ success: true, data: newCompany });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await CustomerCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    const projects = await Project.find({ customerCompany: company._id });
    const contracts = await Contract.find({ customerCompany: company._id });
    const invoices = await Invoice.find({ customerCompany: company._id });
    res.json({ success: true, data: { company, projects, contracts, invoices } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const updated = await CustomerCompany.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const deleted = await CustomerCompany.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= PROJECTS =================
app.get('/api/projects', async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = {};
    if (companyId) filter.customerCompany = companyId;
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const projectId = req.body.projectId || `PRJ-${String(count + 1).padStart(3, '0')}`;
    const newProject = await Project.create({ ...req.body, projectId });
    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const contracts = await Contract.find({ project: project._id });
    const runningCharts = await RunningChartEntry.find({ project: project._id });
    res.json({ success: true, data: { project, contracts, runningCharts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= CONTRACTS & AGREEMENTS =================
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contracts.length, data: contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/contracts', async (req, res) => {
  try {
    const count = await Contract.countDocuments();
    const contractId = req.body.contractId || `CNT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const rateCard = req.body.rateCard || {
      version: 1,
      effectiveFrom: req.body.startDate || new Date(),
      monthlyBasicHireRate: 250000,
      includedMonthlyKm: 3000,
      extraKmRate: 100,
      driverServiceIncluded: true,
      fuelIncluded: false,
      normalWorkingHours: 8,
      overtimeHourlyRate: 600,
    };
    const newContract = await Contract.create({
      ...req.body,
      contractId,
      rateCard,
      rateVersions: [rateCard],
    });
    res.status(201).json({ success: true, data: newContract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/contracts/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/contracts/:id', async (req, res) => {
  try {
    const updated = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Contract not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Rate Versions for Contract
app.get('/api/contracts/:id/rate-versions', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    res.json({ success: true, data: contract.rateVersions || [contract.rateCard] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update or Amend Contract Rate Version (Effective Dated)
app.post('/api/contracts/:id/rate-versions', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const newVersionNum = (contract.rateVersions?.length || 1) + 1;
    const newVersion = {
      ...req.body,
      version: newVersionNum,
      effectiveFrom: req.body.effectiveFrom || new Date(),
      createdAt: new Date(),
    };

    contract.rateVersions.push(newVersion);
    contract.rateCard = newVersion;
    await contract.save();

    res.json({ success: true, message: `Rate version ${newVersionNum} added successfully`, data: contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= MONTHLY BILLING ENGINE =================
// 1. Calculate Monthly Billing Run Preview
app.post('/api/billing-engine/calculate', async (req, res) => {
  try {
    const { contractId, billingMonth } = req.body; // e.g. "2026-04"
    if (!contractId || !billingMonth) {
      return res.status(400).json({ success: false, message: 'contractId and billingMonth required' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const rateCard = contract.rateCard;
    const vehicleLines = [];
    const warnings = [];

    let totalSubtotal = 0;

    for (const vAssign of contract.assignedVehicles) {
      // Find running chart records for this vehicle in this billingMonth
      const entries = await RunningChartEntry.find({
        vehicleReg: vAssign.registrationNumber,
        monthYear: billingMonth,
      });

      const actualKm = entries.reduce((sum, e) => sum + (e.totalKm || 0), 0);
      const approvedOtHours = entries.reduce((sum, e) => sum + (e.otHours || 0), 0);
      const fuelTotal = entries.reduce((sum, e) => sum + (e.fuelCost || 0), 0);

      if (entries.length === 0) {
        warnings.push(`No running chart entries found for vehicle ${vAssign.registrationNumber} in ${billingMonth}`);
      }

      // Calculation Rule: Billable extra km = max(0, actualKm - includedKm)
      const includedKm = rateCard.includedMonthlyKm || 3000;
      const billableExtraKm = Math.max(0, actualKm - includedKm);
      const extraKmRate = rateCard.extraKmRate || 100;
      const extraKmCharge = billableExtraKm * extraKmRate;

      const otRate = rateCard.overtimeHourlyRate || 600;
      const otCharge = approvedOtHours * otRate;

      // Fuel & Driver Rule: Only add if not already included in agreed basic hire!
      const driverCharge = rateCard.driverServiceIncluded ? 0 : (rateCard.driverMonthlyRate || 0);
      const fuelCharge = rateCard.fuelIncluded ? 0 : (fuelTotal > 0 ? fuelTotal : 0);

      const basicHire = rateCard.monthlyBasicHireRate || 250000;
      const lineSubtotal = basicHire + extraKmCharge + otCharge + driverCharge + fuelCharge;
      totalSubtotal += lineSubtotal;

      vehicleLines.push({
        vehicle: vAssign.vehicle,
        registrationNumber: vAssign.registrationNumber,
        vehicleCategory: vAssign.vehicleCategory,
        monthlyBasicHire: basicHire,
        includedKm,
        actualKm,
        billableExtraKm,
        extraKmRate,
        extraKmCharge,
        approvedOtHours,
        otRate,
        otCharge,
        fuelCharge,
        driverCharge,
        additionalCharges: 0,
        lineSubtotal,
        notes: `${actualKm} km run. ${billableExtraKm} extra km billed. ${approvedOtHours} OT hrs.`,
      });
    }

    const discount = 0;
    const taxAmount = 0;
    const totalAmount = totalSubtotal - discount + taxAmount;

    res.json({
      success: true,
      data: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        customerCompany: contract.customerCompany,
        companyName: contract.companyName,
        project: contract.project,
        projectName: contract.projectName,
        billingMonth,
        rateVersionUsed: rateCard.version || 1,
        vehicleLines,
        subtotal: totalSubtotal,
        discount,
        taxAmount,
        totalAmount,
        warnings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Generate and Issue Monthly Invoice from Billing Run
app.post('/api/billing-engine/generate-invoice', async (req, res) => {
  try {
    let { calculationData, approvedBy, contractId, billingMonth, adjustments, notes } = req.body;

    // Support shorthand: if calculationData not provided, auto-calculate from contractId + billingMonth
    if (!calculationData) {
      if (!contractId || !billingMonth) {
        return res.status(400).json({ success: false, message: 'calculationData or (contractId + billingMonth) required' });
      }
      const contract = await Contract.findById(contractId);
      if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
      const rateCard = contract.rateCard;
      const vehicleLines = [];
      let totalSubtotal = 0;
      for (const vAssign of contract.assignedVehicles) {
        const entries = await RunningChartEntry.find({ vehicleReg: vAssign.registrationNumber, monthYear: billingMonth });
        const actualKm = entries.reduce((s, e) => s + (e.totalKm || 0), 0);
        const approvedOtHours = entries.reduce((s, e) => s + (e.otHours || 0), 0);
        const fuelTotal = entries.reduce((s, e) => s + (e.fuelCost || 0), 0);
        const includedKm = rateCard.includedMonthlyKm || 3000;
        const billableExtraKm = Math.max(0, actualKm - includedKm);
        const extraKmRate = rateCard.extraKmRate || 100;
        const extraKmCharge = billableExtraKm * extraKmRate;
        const otRate = rateCard.overtimeHourlyRate || 600;
        const otCharge = approvedOtHours * otRate;
        const driverCharge = rateCard.driverServiceIncluded ? 0 : (rateCard.driverMonthlyRate || 0);
        const fuelCharge = rateCard.fuelIncluded ? 0 : fuelTotal;
        const basicHire = rateCard.monthlyBasicHireRate || 250000;
        const lineSubtotal = basicHire + extraKmCharge + otCharge + driverCharge + fuelCharge;
        totalSubtotal += lineSubtotal;
        vehicleLines.push({ vehicle: vAssign.vehicle, registrationNumber: vAssign.registrationNumber, vehicleCategory: vAssign.vehicleCategory, monthlyBasicHire: basicHire, includedKm, actualKm, billableExtraKm, extraKmRate, extraKmCharge, approvedOtHours, otRate, otCharge, fuelCharge, driverCharge, additionalCharges: 0, lineSubtotal });
      }
      const adj = Number(adjustments) || 0;
      calculationData = {
        contractId: contract._id.toString(),
        contractNumber: contract.contractNumber,
        customerCompany: contract.customerCompany,
        companyName: contract.companyName,
        project: contract.project,
        projectName: contract.projectName,
        billingMonth,
        rateVersionUsed: rateCard.version || 1,
        vehicleLines,
        subtotal: totalSubtotal,
        adjustments: adj,
        discount: 0,
        taxAmount: 0,
        totalAmount: totalSubtotal + adj,
        notes: notes || '',
      };
    }

    const runCount = await ContractMonthlyBillingRun.countDocuments();
    const billingRunId = `BILL-${calculationData.billingMonth}-${String(runCount + 1).padStart(3, '0')}`;

    // Create Invoice with Immutable Snapshot items
    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${calculationData.billingMonth.replace('-', '')}-${String(invCount + 1).padStart(4, '0')}`;

    const invoiceItems = [];
    for (const line of calculationData.vehicleLines) {
      // Basic hire item
      invoiceItems.push({
        description: `Monthly Hire - ${line.registrationNumber} (${line.vehicleCategory}) [${calculationData.billingMonth}]`,
        vehicleReg: line.registrationNumber,
        quantity: 1,
        unitPrice: line.monthlyBasicHire,
        total: line.monthlyBasicHire,
        chargeType: 'Monthly Basic Hire',
        includedKm: line.includedKm,
        actualKm: line.actualKm,
      });

      // Extra KM item if any
      if (line.billableExtraKm > 0) {
        invoiceItems.push({
          description: `Extra Mileage - ${line.registrationNumber} (${line.billableExtraKm} km @ LKR ${line.extraKmRate}/km)`,
          vehicleReg: line.registrationNumber,
          quantity: line.billableExtraKm,
          unitPrice: line.extraKmRate,
          total: line.extraKmCharge,
          chargeType: 'Extra Kilometres',
          billableExtraKm: line.billableExtraKm,
          extraKmRate: line.extraKmRate,
        });
      }

      // Overtime item if any
      if (line.approvedOtHours > 0) {
        invoiceItems.push({
          description: `Approved Driver Overtime - ${line.registrationNumber} (${line.approvedOtHours} hrs @ LKR ${line.otRate}/hr)`,
          vehicleReg: line.registrationNumber,
          quantity: line.approvedOtHours,
          unitPrice: line.otRate,
          total: line.otCharge,
          chargeType: 'Overtime',
          otHours: line.approvedOtHours,
          otRate: line.otRate,
        });
      }

      // Fuel item if any
      if (line.fuelCharge > 0) {
        invoiceItems.push({
          description: `Fuel Usage Reimbursement - ${line.registrationNumber}`,
          vehicleReg: line.registrationNumber,
          quantity: 1,
          unitPrice: line.fuelCharge,
          total: line.fuelCharge,
          chargeType: 'Fuel',
        });
      }
    }

    const company = await CustomerCompany.findById(calculationData.customerCompany);

    const newInvoice = await Invoice.create({
      invoiceNumber,
      invoiceType: 'Monthly Agreement',
      customerCompany: calculationData.customerCompany,
      customerName: calculationData.companyName,
      customerPhone: company?.phone || '+94 11 234 5678',
      customerAddress: company?.billingAddress || 'Colombo, Sri Lanka',
      project: calculationData.project,
      projectName: calculationData.projectName,
      contract: calculationData.contractId,
      contractNumber: calculationData.contractNumber,
      billingMonth: calculationData.billingMonth,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      items: invoiceItems,
      subtotal: calculationData.subtotal,
      discount: calculationData.discount || 0,
      taxAmount: calculationData.taxAmount || 0,
      totalAmount: calculationData.totalAmount,
      paidAmount: 0,
      balanceDue: calculationData.totalAmount,
      status: 'Issued',
      paymentTerms: 'Payment due within 15 days of invoice date.',
    });

    const billingRun = await ContractMonthlyBillingRun.create({
      billingRunId,
      contract: calculationData.contractId,
      contractNumber: calculationData.contractNumber,
      customerCompany: calculationData.customerCompany,
      companyName: calculationData.companyName,
      project: calculationData.project,
      projectName: calculationData.projectName,
      billingMonth: calculationData.billingMonth,
      rateVersionUsed: calculationData.rateVersionUsed || 1,
      vehicleLines: calculationData.vehicleLines,
      subtotal: calculationData.subtotal,
      discount: calculationData.discount || 0,
      taxAmount: calculationData.taxAmount || 0,
      totalAmount: calculationData.totalAmount,
      status: 'Invoiced',
      generatedInvoiceId: newInvoice._id,
      generatedInvoiceNumber: invoiceNumber,
      warnings: calculationData.warnings,
      approvedBy: approvedBy || 'Admin',
      approvedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Monthly billing run processed and invoice generated successfully',
      data: { billingRun, invoice: newInvoice },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Billing Run History
app.get('/api/billing-engine/history', async (req, res) => {
  try {
    const runs = await ContractMonthlyBillingRun.find().sort({ createdAt: -1 });
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= SPARE-PARTS INVENTORY =================
app.get('/api/inventory/parts', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { compatibleVehicles: { $regex: search, $options: 'i' } },
      ];
    }
    const parts = await SparePart.find(query).sort({ currentStock: 1, name: 1 });
    res.json({ success: true, count: parts.length, data: parts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/inventory/parts', async (req, res) => {
  try {
    const count = await SparePart.countDocuments();
    const partId = req.body.partId || `PRT-${String(count + 1).padStart(4, '0')}`;
    const newPart = await SparePart.create({ ...req.body, partId });
    res.status(201).json({ success: true, data: newPart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/inventory/parts/:id', async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });
    const transactions = await InventoryTransaction.find({ part: part._id }).sort({ date: -1 });
    res.json({ success: true, data: { part, transactions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/inventory/parts/:id', async (req, res) => {
  try {
    const updated = await SparePart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Spare part not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Receive Stock Purchase
app.post('/api/inventory/purchases', async (req, res) => {
  try {
    const { partId, quantity, unitCost, supplierName, reference, notes } = req.body;
    const part = await SparePart.findById(partId);
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });

    const qty = Number(quantity);
    const cost = Number(unitCost) || part.unitCost;
    const previousStock = part.currentStock;
    const newStock = previousStock + qty;

    part.currentStock = newStock;
    part.unitCost = cost;
    await part.save();

    const txCount = await InventoryTransaction.countDocuments();
    const transactionId = `TX-${Date.now().toString().slice(-6)}-${String(txCount + 1).padStart(3, '0')}`;

    const tx = await InventoryTransaction.create({
      transactionId,
      part: part._id,
      sku: part.sku,
      partName: part.name,
      type: 'PURCHASE_RECEIPT',
      quantity: qty,
      unitCost: cost,
      totalCost: qty * cost,
      previousStock,
      newStock,
      reference: reference || `Supplier: ${supplierName || 'General'}`,
      date: new Date(),
      notes,
    });

    res.status(201).json({ success: true, message: 'Stock received successfully', data: { part, transaction: tx } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stock Adjustments
app.post('/api/inventory/adjustments', async (req, res) => {
  try {
    const { partId, newQuantity, reason, notes } = req.body;
    const part = await SparePart.findById(partId);
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });

    const previousStock = part.currentStock;
    const newStock = Number(newQuantity);
    const diff = newStock - previousStock;

    part.currentStock = newStock;
    await part.save();

    const txCount = await InventoryTransaction.countDocuments();
    const transactionId = `ADJ-${Date.now().toString().slice(-6)}-${String(txCount + 1).padStart(3, '0')}`;

    const tx = await InventoryTransaction.create({
      transactionId,
      part: part._id,
      sku: part.sku,
      partName: part.name,
      type: 'ADJUSTMENT',
      quantity: Math.abs(diff),
      unitCost: part.unitCost,
      totalCost: Math.abs(diff) * part.unitCost,
      previousStock,
      newStock,
      reference: reason || 'Stock Count Reconciliation',
      date: new Date(),
      notes,
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: { part, transaction: tx } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Inventory Transactions List
app.get('/api/inventory/transactions', async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find().sort({ date: -1 }).limit(100);
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= VEHICLE SERVICE & MAINTENANCE =================
app.get('/api/services', async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = {};
    if (vehicleId) query.vehicle = vehicleId;
    const services = await VehicleService.find(query).sort({ serviceDate: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const count = await VehicleService.countDocuments();
    const serviceId = `SRV-${String(count + 1).padStart(4, '0')}`;

    const partsUsed = req.body.partsUsed || [];
    let sparePartsCost = 0;

    // Issue parts from inventory and deduct stock automatically!
    for (const p of partsUsed) {
      if (p.part && p.issuedFromInventory) {
        const sparePart = await SparePart.findById(p.part);
        if (sparePart) {
          const qty = Number(p.quantity) || 1;
          const prev = sparePart.currentStock;
          sparePart.currentStock = Math.max(0, prev - qty);
          await sparePart.save();

          // Create InventoryTransaction
          const txCount = await InventoryTransaction.countDocuments();
          await InventoryTransaction.create({
            transactionId: `ISSUE-${Date.now().toString().slice(-6)}-${String(txCount + 1).padStart(3, '0')}`,
            part: sparePart._id,
            sku: sparePart.sku,
            partName: sparePart.name,
            type: 'ISSUED_TO_SERVICE',
            quantity: qty,
            unitCost: p.unitCost || sparePart.unitCost,
            totalCost: qty * (p.unitCost || sparePart.unitCost),
            previousStock: prev,
            newStock: sparePart.currentStock,
            vehicle: req.body.vehicle,
            vehicleReg: req.body.vehicleReg,
            reference: serviceId,
            date: req.body.serviceDate || new Date(),
            notes: `Issued to ${req.body.serviceCategory || 'Service'}`,
          });
        }
      }
      sparePartsCost += Number(p.totalCost) || 0;
    }

    const labourCost = Number(req.body.labourCost) || 0;
    const otherCharges = Number(req.body.otherCharges) || 0;
    const totalCost = labourCost + sparePartsCost + otherCharges;

    const newService = await VehicleService.create({
      ...req.body,
      serviceId,
      sparePartsCost,
      totalCost,
    });

    // Update vehicle's last service odometer and next service threshold
    if (req.body.vehicle) {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, {
        lastServiceOdometer: req.body.odometerReading,
        nextServiceOdometer: req.body.nextServiceOdometer || Number(req.body.odometerReading) + 5000,
        nextServiceDate: req.body.nextServiceDate,
      });
    }

    res.status(201).json({ success: true, data: newService });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await VehicleService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service record not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const deleted = await VehicleService.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= DRIVER PAYROLL & EPF/ETF =================
app.get('/api/payroll', async (req, res) => {
  try {
    const payrolls = await PayrollPeriod.find().sort({ monthYear: -1 });
    res.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate Monthly Payroll Calculation
app.post('/api/payroll/generate', async (req, res) => {
  try {
    const { monthYear } = req.body; // e.g., "2026-04"
    if (!monthYear) return res.status(400).json({ success: false, message: 'monthYear required' });

    // Load statutory EPF/ETF and advance limits from Settings
    const settings = await CompanySettings.findOne();
    const epfEmpPct = typeof settings?.epfEmployeeRate === 'number' ? settings.epfEmployeeRate : 8;
    const epfEmplrPct = typeof settings?.epfEmployerRate === 'number' ? settings.epfEmployerRate : 12;
    const etfEmplrPct = typeof settings?.etfEmployerRate === 'number' ? settings.etfEmployerRate : 3;
    const maxMonthlyAdvance = typeof settings?.maxAdvanceDeductionPerMonth === 'number' ? settings.maxAdvanceDeductionPerMonth : 10000;

    const drivers = await Driver.find({ status: { $ne: 'Inactive' } });
    const entries = [];

    let totalGross = 0;
    let totalEmployeeEpf = 0;
    let totalEmployerEpf = 0;
    let totalEmployerEtf = 0;
    let totalAdvancesDeducted = 0;
    let totalNetSalary = 0;
    let totalEmployerCost = 0;

    for (const d of drivers) {
      // Find running chart overtime hours
      const runningEntries = await RunningChartEntry.find({
        driver: d._id,
        monthYear,
      });
      const approvedOtHours = runningEntries.reduce((s, r) => s + (r.otHours || 0), 0);
      const otRate = d.overtimeHourlyRate || 450;
      const overtimeEarnings = approvedOtHours * otRate;

      const basicSalary = d.basicSalary || 65000;
      const allowances = d.fixedAllowances || 5000;
      const grossEarnings = basicSalary + overtimeEarnings + allowances;

      // Sri Lanka Statutory EPF/ETF Rates (Configured in System Settings):
      // Qualifying Base = Basic Salary + Fixed Allowances
      const qualifyingEarnings = basicSalary + allowances;

      // Employee EPF (Deducted from employee salary)
      const employeeEpfRate = d.epfApplicable ? epfEmpPct : 0;
      const employeeEpfDeduction = d.epfApplicable ? Math.round(qualifyingEarnings * (epfEmpPct / 100)) : 0;

      // Employer EPF (Employer Expense - NOT deducted from employee)
      const employerEpfRate = d.epfApplicable ? epfEmplrPct : 0;
      const employerEpfContribution = d.epfApplicable ? Math.round(qualifyingEarnings * (epfEmplrPct / 100)) : 0;

      // Employer ETF (Employer Expense - NOT deducted from employee)
      const employerEtfRate = d.etfApplicable ? etfEmplrPct : 0;
      const employerEtfContribution = d.etfApplicable ? Math.round(qualifyingEarnings * (etfEmplrPct / 100)) : 0;

      // Find active advances for driver to deduct partial or full (capped at maxMonthlyAdvance from Settings)
      const advances = await DriverAdvance.find({
        driver: d._id,
        remainingBalance: { $gt: 0 },
      });
      let advancesDeducted = 0;
      for (const adv of advances) {
        const deduct = Math.min(adv.remainingBalance, maxMonthlyAdvance);
        advancesDeducted += deduct;
      }

      const otherDeductions = 0;
      // Net Salary = Gross Earnings - Employee 8% EPF - Advances - Deductions
      const netSalary = grossEarnings - employeeEpfDeduction - advancesDeducted - otherDeductions;

      // Total Employer Cost = Gross Earnings + Employer 12% EPF + Employer 3% ETF
      const employerCost = grossEarnings + employerEpfContribution + employerEtfContribution;

      entries.push({
        driver: d._id,
        driverName: d.fullName,
        epfNumber: d.epfNumber,
        employmentType: d.employmentType,
        basicSalary,
        attendanceDays: 26,
        overtimeHours: approvedOtHours,
        overtimeEarnings,
        allowances,
        grossEarnings,
        qualifyingEarnings,
        employeeEpfRate,
        employeeEpfDeduction,
        employerEpfRate,
        employerEpfContribution,
        employerEtfRate,
        employerEtfContribution,
        advancesDeducted,
        otherDeductions,
        netSalary,
        totalEmployerCost: employerCost,
        amountPaid: 0,
        remainingBalance: netSalary,
        paymentStatus: 'Unpaid',
      });

      totalGross += grossEarnings;
      totalEmployeeEpf += employeeEpfDeduction;
      totalEmployerEpf += employerEpfContribution;
      totalEmployerEtf += employerEtfContribution;
      totalAdvancesDeducted += advancesDeducted;
      totalNetSalary += netSalary;
      totalEmployerCost += employerCost;
    }

    const payrollId = `PAY-${monthYear}`;
    let period = await PayrollPeriod.findOne({ monthYear });

    if (period) {
      period.entries = entries;
      period.totalGross = totalGross;
      period.totalEmployeeEpf = totalEmployeeEpf;
      period.totalEmployerEpf = totalEmployerEpf;
      period.totalEmployerEtf = totalEmployerEtf;
      period.totalAdvancesDeducted = totalAdvancesDeducted;
      period.totalNetSalary = totalNetSalary;
      period.totalEmployerCost = totalEmployerCost;
      await period.save();
    } else {
      period = await PayrollPeriod.create({
        payrollId,
        monthYear,
        status: 'Draft',
        entries,
        totalGross,
        totalEmployeeEpf,
        totalEmployerEpf,
        totalEmployerEtf,
        totalAdvancesDeducted,
        totalNetSalary,
        totalEmployerCost,
      });
    }

    res.json({ success: true, message: 'Payroll period calculated successfully', data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve & Finalize Payroll
app.post('/api/payroll/:id/finalize', async (req, res) => {
  try {
    const period = await PayrollPeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ success: false, message: 'Payroll period not found' });

    period.status = 'Finalized';
    period.approvedAt = new Date();
    period.approvedBy = req.body.approvedBy || 'Admin';

    // Apply advance deductions in DriverAdvance ledger
    for (const entry of period.entries) {
      if (entry.advancesDeducted > 0) {
        const advances = await DriverAdvance.find({ driver: entry.driver, remainingBalance: { $gt: 0 } });
        let toDeduct = entry.advancesDeducted;
        for (const adv of advances) {
          if (toDeduct <= 0) break;
          const ded = Math.min(adv.remainingBalance, toDeduct);
          adv.appliedAmount += ded;
          adv.remainingBalance -= ded;
          if (adv.remainingBalance === 0) adv.status = 'Fully Applied';
          else adv.status = 'Partially Applied';
          adv.repayments.push({
            date: new Date(),
            amount: ded,
            payrollMonth: period.monthYear,
            notes: `Deducted via Payroll ${period.monthYear}`,
          });
          await adv.save();
          toDeduct -= ded;
        }
      }
    }

    await period.save();
    res.json({ success: true, message: 'Payroll period finalized and advance ledgers updated', data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record Driver Salary Payment
app.post('/api/payroll/:id/record-payment', async (req, res) => {
  try {
    const { driverId, amount, paymentReference, notes } = req.body;
    const period = await PayrollPeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ success: false, message: 'Payroll period not found' });

    const entry = period.entries.find((e) => e.driver.toString() === driverId);
    if (!entry) return res.status(404).json({ success: false, message: 'Driver entry not found in this payroll' });

    const payAmt = Number(amount);
    entry.amountPaid = (entry.amountPaid || 0) + payAmt;
    entry.remainingBalance = Math.max(0, entry.netSalary - entry.amountPaid);
    entry.paymentReference = paymentReference || 'Bank Transfer';
    entry.paymentDate = new Date();
    entry.notes = notes;

    if (entry.remainingBalance === 0) entry.paymentStatus = 'Paid';
    else if (entry.amountPaid > 0) entry.paymentStatus = 'Partially Paid';

    period.totalPaid = period.entries.reduce((s, e) => s + (e.amountPaid || 0), 0);
    if (period.entries.every((e) => e.paymentStatus === 'Paid')) {
      period.status = 'Paid';
    }

    await period.save();
    res.json({ success: true, message: 'Salary payment recorded successfully', data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Driver Advances Routes
app.get('/api/driver-payments/advances', async (req, res) => {
  try {
    const advances = await DriverAdvance.find().sort({ date: -1 });
    res.json({ success: true, count: advances.length, data: advances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/driver-payments/advances', async (req, res) => {
  try {
    const count = await DriverAdvance.countDocuments();
    const advanceId = `ADV-${String(count + 1).padStart(4, '0')}`;
    const amount = Number(req.body.amount);
    const newAdvance = await DriverAdvance.create({
      ...req.body,
      advanceId,
      amount,
      appliedAmount: 0,
      remainingBalance: amount,
      status: 'Approved',
    });
    res.status(201).json({ success: true, data: newAdvance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= REUSABLE SOCIAL MEDIA POSTS =================
app.get('/api/social/templates', async (req, res) => {
  try {
    const templates = await SocialPostTemplate.find().sort({ createdAt: -1 });
    res.json({ success: true, count: templates.length, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/templates', async (req, res) => {
  try {
    const count = await SocialPostTemplate.countDocuments();
    const templateId = req.body.templateId || `TPL-${String(count + 1).padStart(3, '0')}`;
    const newTemplate = await SocialPostTemplate.create({ ...req.body, templateId });
    res.status(201).json({ success: true, data: newTemplate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/social/posts', async (req, res) => {
  try {
    const posts = await SocialPostDraft.find().sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/posts', async (req, res) => {
  try {
    const count = await SocialPostDraft.countDocuments();
    const postId = req.body.postId || `POST-${String(count + 1).padStart(4, '0')}`;
    const newPost = await SocialPostDraft.create({ ...req.body, postId });
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/social/posts/:id', async (req, res) => {
  try {
    const post = await SocialPostDraft.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post draft not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/social/posts/:id', async (req, res) => {
  try {
    const updated = await SocialPostDraft.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1-Click Duplicate Post for new date/location without modifying original
app.post('/api/social/posts/:id/duplicate', async (req, res) => {
  try {
    const original = await SocialPostDraft.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Original post not found' });

    const count = await SocialPostDraft.countDocuments();
    const postId = `POST-${String(count + 1).padStart(4, '0')}`;

    const duplicateObj = original.toObject();
    delete duplicateObj._id;
    delete duplicateObj.createdAt;
    delete duplicateObj.updatedAt;

    duplicateObj.postId = postId;
    duplicateObj.title = `${original.title} (Copy)`;
    duplicateObj.status = 'Draft';
    duplicateObj.publishedUrl = '';
    duplicateObj.publishedAt = undefined;

    const duplicated = await SocialPostDraft.create(duplicateObj);
    res.status(201).json({ success: true, message: 'Post duplicated successfully', data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record Publication link
app.post('/api/social/posts/:id/publish', async (req, res) => {
  try {
    const { publishedUrl } = req.body;
    const post = await SocialPostDraft.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = 'Published';
    post.publishedUrl = publishedUrl;
    post.publishedAt = new Date();
    await post.save();

    res.json({ success: true, message: 'Publication verified and status updated', data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= STANDARD REST ENDPOINTS =================

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (type && type !== 'All') query.vehicleType = type;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    const vehicles = await Vehicle.find(query).sort({ registrationNumber: 1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const count = await Vehicle.countDocuments();
    const vehicleId = req.body.vehicleId || `VEH-${String(count + 1).padStart(4, '0')}`;
    const newVehicle = await Vehicle.create({ ...req.body, vehicleId });
    res.status(201).json({ success: true, data: newVehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const serviceHistory = await VehicleService.find({ vehicle: vehicle._id }).sort({ serviceDate: -1 });
    const runningCharts = await RunningChartEntry.find({ vehicle: vehicle._id }).sort({ date: -1 }).limit(10);
    res.json({ success: true, data: { vehicle, serviceHistory, runningCharts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ fullName: 1 });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const count = await Driver.countDocuments();
    const driverId = req.body.driverId || `DRV-${String(count + 1).padStart(4, '0')}`;
    const newDriver = await Driver.create({ ...req.body, driverId });
    res.status(201).json({ success: true, data: newDriver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const advances = await DriverAdvance.find({ driver: driver._id }).sort({ date: -1 });
    res.json({ success: true, data: { driver, advances } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const deleted = await Driver.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    const customerId = req.body.customerId || `CUST-${String(count + 1).padStart(4, '0')}`;
    const newCust = await Customer.create({ ...req.body, customerId });
    res.status(201).json({ success: true, data: newCust });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const count = await Supplier.countDocuments();
    const supplierId = req.body.supplierId || `SUP-${String(count + 1).padStart(4, '0')}`;
    const newSup = await Supplier.create({ ...req.body, supplierId });
    res.status(201).json({ success: true, data: newSup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bookings & Short-Term / 2-Day Hires
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ pickupDate: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    const bookingId = req.body.bookingId || `BKG-${String(count + 1).padStart(4, '0')}`;
    const newBkg = await Booking.create({ ...req.body, bookingId });
    res.status(201).json({ success: true, data: newBkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bkg = await Booking.findById(req.params.id);
    if (!bkg) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: bkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Running Charts
app.get('/api/running-charts', async (req, res) => {
  try {
    const { month, vehicleReg } = req.query;
    const query = {};
    if (month) query.monthYear = month;
    if (vehicleReg) query.vehicleReg = vehicleReg;
    const charts = await RunningChartEntry.find(query).sort({ date: -1 });
    res.json({ success: true, count: charts.length, data: charts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/running-charts', async (req, res) => {
  try {
    const count = await RunningChartEntry.countDocuments();
    const entryId = req.body.entryId || `RUN-${String(count + 1).padStart(4, '0')}`;
    const startKm = Number(req.body.startOdometer) || 0;
    const endKm = Number(req.body.endOdometer) || 0;
    const totalKm = endKm >= startKm ? endKm - startKm : (Number(req.body.totalKm) || 0);

    const newEntry = await RunningChartEntry.create({
      ...req.body,
      entryId,
      totalKm,
    });

    // Update vehicle current odometer
    if (req.body.vehicleReg && endKm > 0) {
      await Vehicle.findOneAndUpdate(
        { registrationNumber: req.body.vehicleReg },
        { currentOdometer: endKm }
      );
    }

    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/running-charts/:id', async (req, res) => {
  try {
    const deleted = await RunningChartEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Running chart entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quotations
app.get('/api/quotations', async (req, res) => {
  try {
    const quotes = await Quotation.find().sort({ issueDate: -1 });
    res.json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const count = await Quotation.countDocuments();
    const quotationNumber = req.body.quotationNumber || `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const newQuote = await Quotation.create({ ...req.body, quotationNumber });
    res.status(201).json({ success: true, data: newQuote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/quotations/:id', async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/quotations/:id', async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ issueDate: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const count = await Invoice.countDocuments();
    const invoiceNumber = req.body.invoiceNumber || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const totalAmount = Number(req.body.totalAmount) || 0;
    const paidAmount = Number(req.body.paidAmount) || 0;
    const balanceDue = totalAmount - paidAmount;
    const newInv = await Invoice.create({
      ...req.body,
      invoiceNumber,
      balanceDue,
    });
    res.status(201).json({ success: true, data: newInv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const payments = await Payment.find({ invoice: inv._id }).sort({ paymentDate: -1 });
    res.json({ success: true, data: { invoice: inv, payments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const count = await Payment.countDocuments();
    const receiptNumber = req.body.receiptNumber || `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const newPay = await Payment.create({ ...req.body, receiptNumber });

    // Update Invoice paidAmount and balanceDue
    if (req.body.invoice) {
      const inv = await Invoice.findById(req.body.invoice);
      if (inv) {
        inv.paidAmount = (inv.paidAmount || 0) + Number(req.body.amount);
        inv.balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);
        if (inv.balanceDue === 0) inv.status = 'Paid';
        else inv.status = 'Partially Paid';
        await inv.save();
      }
    }

    res.status(201).json({ success: true, data: newPay });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const count = await Expense.countDocuments();
    const expenseId = req.body.expenseId || `EXP-${String(count + 1).padStart(4, '0')}`;
    const newExp = await Expense.create({ ...req.body, expenseId });
    res.status(201).json({ success: true, data: newExp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Social Groups & Leads
app.get('/api/social/groups', async (req, res) => {
  try {
    const groups = await SocialGroup.find().sort({ name: 1 });
    res.json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/groups', async (req, res) => {
  try {
    const count = await SocialGroup.countDocuments();
    const groupId = req.body.groupId || `GRP-${String(count + 1).padStart(4, '0')}`;
    const newGrp = await SocialGroup.create({ ...req.body, groupId });
    res.status(201).json({ success: true, data: newGrp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/social/leads', async (req, res) => {
  try {
    const leads = await SocialLead.find().sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/leads', async (req, res) => {
  try {
    const count = await SocialLead.countDocuments();
    const leadId = req.body.leadId || `LEAD-${String(count + 1).padStart(4, '0')}`;
    const newLead = await SocialLead.create({ ...req.body, leadId });
    res.status(201).json({ success: true, data: newLead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'FleetFlow Lanka (Pvt) Ltd',
        tagline: 'Enterprise Fleet & Operational Management',
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dynamic Favicon / Logo Image Endpoint
app.get('/api/branding/favicon', async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    const companyName = settings?.companyName || 'FleetFlow Lanka';
    const logoUrl = settings?.logoUrl || '';

    // 1. Base64 Image
    if (logoUrl.startsWith('data:image/')) {
      const matches = logoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(buffer);
      }
    }

    // 2. Direct URL
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return res.redirect(logoUrl);
    }

    // 3. Dynamic Letter SVG
    const letter = companyName.trim().charAt(0).toUpperCase() || 'F';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="16" fill="#2563EB"/><text x="50%" y="54%" font-family="sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(svg);
  } catch (err) {
    res.status(500).send('Error');
  }
});

const handleSaveSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (settings) {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    } else {
      settings = await CompanySettings.create(req.body);
    }
    res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
app.post('/api/settings', handleSaveSettings);
app.put('/api/settings', handleSaveSettings);

// Dashboard Summary API
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalVehicles,
      availableVehicles,
      totalDrivers,
      activeProjects,
      activeContracts,
      totalCompanies,
      lowStockParts,
      unpaidInvoices,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'Available' }),
      Driver.countDocuments({ status: { $ne: 'Inactive' } }),
      Project.countDocuments({ status: 'Active' }),
      Contract.countDocuments({ status: 'Active' }),
      CustomerCompany.countDocuments({ status: 'Active' }),
      SparePart.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }),
      Invoice.find({ status: { $in: ['Issued', 'Partially Paid'] } }),
    ]);

    const totalOutstandingRevenue = unpaidInvoices.reduce((s, i) => s + (i.balanceDue || 0), 0);

    res.json({
      success: true,
      data: {
        totalVehicles,
        availableVehicles,
        totalDrivers,
        activeProjects,
        activeContracts,
        totalCompanies,
        lowStockParts,
        totalOutstandingRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= COMPREHENSIVE SEED ENDPOINT =================
app.post('/api/seed', async (req, res) => {
  try {
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

    // 3. Suppliers (External Vehicle Owners & Spare Parts Vendors)
    const supplierSeed = [
      {
        supplierId: 'SUP-0001',
        name: 'Lanka Auto Rentals & Partners (Pvt) Ltd',
        phone: '+94 77 456 7890',
        address: 'No. 88, Galle Road, Colombo 03',
        supplierCategory: 'Vehicle Owner',
        rateType: 'Monthly Agreement',
        bankDetails: 'Sampath Bank - 0012345678',
      },
      {
        supplierId: 'SUP-0002',
        name: 'Nimal Jayasinghe (Individual Vehicle Owner)',
        phone: '+94 71 890 1234',
        address: '15/A, Kandy Road, Kiribathgoda',
        supplierCategory: 'Vehicle Owner',
        rateType: 'Monthly Hire',
        bankDetails: 'Commercial Bank - 1009876543',
      },
      {
        supplierId: 'SUP-0003',
        name: 'Southern Auto Spares & Lubricants',
        phone: '+94 91 223 4567',
        address: 'Main Street, Galle',
        supplierCategory: 'Spare Parts',
        rateType: 'Per Delivery',
        bankDetails: 'BOC - 7890123456',
      },
    ];
    for (const sup of supplierSeed) {
      await Supplier.findOneAndUpdate({ supplierId: sup.supplierId }, sup, { upsert: true, new: true });
    }
    const suppliers = await Supplier.find();

    // 4. Fleet of 20 Vehicles (Double Cabs, Vans, etc. - Mixture of Business-Owned and Partner-Owned)
    let vehicles = await Vehicle.find();
    if (vehicles.length < 10) {
      const fleetSeed = [
        // Business Owned Double Cabs
        { vehicleId: 'VEH-0001', registrationNumber: 'WP-CAB-1001', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2021, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 54300, ownershipType: 'Business-owned', status: 'Booked' },
        { vehicleId: 'VEH-0002', registrationNumber: 'WP-CAB-1002', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2022, color: 'White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 42100, ownershipType: 'Business-owned', status: 'Booked' },
        { vehicleId: 'VEH-0003', registrationNumber: 'WP-CAB-1003', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Vigo 4x4', manufacturingYear: 2018, color: 'Black', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 98500, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0004', registrationNumber: 'WP-CAB-1004', vehicleType: 'Double Cab', make: 'Isuzu', model: 'D-Max 4x4', manufacturingYear: 2020, color: 'Grey', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 62000, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0005', registrationNumber: 'WP-CAB-1005', vehicleType: 'Double Cab', make: 'Mitsubishi', model: 'L200 Triton', manufacturingYear: 2019, color: 'Red', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 74200, ownershipType: 'Business-owned', status: 'Booked' },

        // External Partner Hired Double Cabs
        { vehicleId: 'VEH-0006', registrationNumber: 'WP-CAB-2001', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 2.8', manufacturingYear: 2022, color: 'Pearl White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 38900, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Booked' },
        { vehicleId: 'VEH-0007', registrationNumber: 'WP-CAB-2002', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo 4x4', manufacturingYear: 2020, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 61500, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Booked' },
        { vehicleId: 'VEH-0008', registrationNumber: 'WP-CAB-2003', vehicleType: 'Double Cab', make: 'Isuzu', model: 'D-Max V-Cross', manufacturingYear: 2021, color: 'Blue', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 49000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Available' },
        { vehicleId: 'VEH-0009', registrationNumber: 'WP-CAB-2004', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Vigo', manufacturingYear: 2017, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 112000, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Available' },
        { vehicleId: 'VEH-0010', registrationNumber: 'WP-CAB-2005', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux Revo', manufacturingYear: 2023, color: 'Black', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 22000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Booked' },

        // Toyota HiAce Passenger & Tourism Vans (Owned & Partner)
        { vehicleId: 'VEH-0011', registrationNumber: 'WP-NC-5501', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH High Roof', manufacturingYear: 2019, color: 'White', fuelType: 'Diesel', seatingCapacity: 14, currentOdometer: 95400, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0012', registrationNumber: 'WP-NC-5502', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH Super GL', manufacturingYear: 2018, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 10, currentOdometer: 118000, ownershipType: 'Business-owned', status: 'Booked' },
        { vehicleId: 'VEH-0013', registrationNumber: 'WP-NC-5503', vehicleType: 'Van', make: 'Toyota', model: 'HiAce Commuter 14-Seat', manufacturingYear: 2020, color: 'White', fuelType: 'Diesel', seatingCapacity: 14, currentOdometer: 72000, ownershipType: 'Rented', ownerName: 'Lanka Auto Rentals & Partners', status: 'Available' },
        { vehicleId: 'VEH-0014', registrationNumber: 'WP-NC-5504', vehicleType: 'Van', make: 'Toyota', model: 'HiAce KDH 201', manufacturingYear: 2017, color: 'Silver', fuelType: 'Diesel', seatingCapacity: 10, currentOdometer: 134000, ownershipType: 'Rented', ownerName: 'Nimal Jayasinghe', status: 'Booked' },
        { vehicleId: 'VEH-0015', registrationNumber: 'WP-NC-5505', vehicleType: 'Van', make: 'Nissan', model: 'Caravan NV350', manufacturingYear: 2019, color: 'Black', fuelType: 'Diesel', seatingCapacity: 12, currentOdometer: 89000, ownershipType: 'Business-owned', status: 'Available' },

        // Tourism & Executive Cars / SUVs
        { vehicleId: 'VEH-0016', registrationNumber: 'WP-CAB-3001', vehicleType: 'SUV', make: 'Toyota', model: 'Land Cruiser Prado', manufacturingYear: 2019, color: 'Pearl White', fuelType: 'Diesel', seatingCapacity: 7, currentOdometer: 76000, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0017', registrationNumber: 'WP-CAB-3002', vehicleType: 'SUV', make: 'Mitsubishi', model: 'Montero Sport', manufacturingYear: 2018, color: 'Black', fuelType: 'Diesel', seatingCapacity: 7, currentOdometer: 84000, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0018', registrationNumber: 'WP-CAR-4001', vehicleType: 'Car', make: 'Toyota', model: 'Axio Hybrid', manufacturingYear: 2018, color: 'White', fuelType: 'Hybrid', seatingCapacity: 4, currentOdometer: 68000, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0019', registrationNumber: 'WP-CAR-4002', vehicleType: 'Car', make: 'Toyota', model: 'Premio G-Superior', manufacturingYear: 2019, color: 'Wine Red', fuelType: 'Petrol', seatingCapacity: 4, currentOdometer: 52000, ownershipType: 'Business-owned', status: 'Available' },
        { vehicleId: 'VEH-0020', registrationNumber: 'WP-CAB-3003', vehicleType: 'Double Cab', make: 'Toyota', model: 'Hilux GR Sport', manufacturingYear: 2023, color: 'White', fuelType: 'Diesel', seatingCapacity: 5, currentOdometer: 18500, ownershipType: 'Business-owned', status: 'Available' },
      ];

      for (const item of fleetSeed) {
        await Vehicle.findOneAndUpdate({ vehicleId: item.vehicleId }, item, { upsert: true, new: true });
      }
      vehicles = await Vehicle.find();
    }

    // 5. Customer Companies (2 Existing initial client relationships)
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

    // 6. Projects (Multiple projects per company)
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

    // 7. Drivers with EPF/ETF and Salary Profiles
    let drivers = await Driver.find();
    if (drivers.length < 5) {
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
      drivers = await Driver.find();
    }

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

    // 9. Annual Agreements / Contracts (With 3,000 km Monthly Allowance)
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
              supplier: (suppliers[1] || suppliers[0])._id,
              supplierName: (suppliers[1] || suppliers[0]).name,
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

    // 10. Running Chart Entries (Illustrating > 3000 KM to test extra-km and OT calculations)
    const runCount = await RunningChartEntry.countDocuments();
    if (runCount < 5) {
      await RunningChartEntry.create([
        // ─── April 2026 (historical data) ───────────────────────────
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
          totalKm: 1700, // Total for month = 1750 + 1700 = 3,450 km (450 km extra over 3,000 km)
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
          totalKm: 2900, // Under 3,000 km (no extra km charge)
          otHours: 6,
          fuelLitres: 220,
          fuelCost: 72600,
          status: 'Approved',
        },
        // ─── September 2026 (billing engine test month) ───────────────
        {
          entryId: 'RUN-2026-09-01',
          date: new Date('2026-09-04'),
          monthYear: '2026-09',
          vehicle: vehicles[0]._id,
          vehicleReg: vehicles[0].registrationNumber,
          driver: drivers[0]._id,
          driverName: drivers[0].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Colombo Site Office',
          destination: 'Hambantota Southern Expressway Site',
          startOdometer: 55000,
          endOdometer: 56800,
          totalKm: 1800,
          otHours: 10,
          fuelLitres: 145,
          fuelCost: 47850,
          status: 'Approved',
        },
        {
          entryId: 'RUN-2026-09-02',
          date: new Date('2026-09-18'),
          monthYear: '2026-09',
          vehicle: vehicles[0]._id,
          vehicleReg: vehicles[0].registrationNumber,
          driver: drivers[0]._id,
          driverName: drivers[0].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Hambantota',
          destination: 'Galle & Matara Site Inspection',
          startOdometer: 56800,
          endOdometer: 58450,
          totalKm: 1650, // Total Sep WP-CAB-1001 = 1800 + 1650 = 3,450 km (450 extra km)
          otHours: 6,
          fuelLitres: 130,
          fuelCost: 42900,
          status: 'Approved',
        },
        {
          entryId: 'RUN-2026-09-03',
          date: new Date('2026-09-10'),
          monthYear: '2026-09',
          vehicle: vehicles[1]._id,
          vehicleReg: vehicles[1].registrationNumber,
          driver: drivers[1]._id,
          driverName: drivers[1].fullName,
          customerName: companies[0].name,
          project: projects[0]._id,
          projectName: projects[0].name,
          startLocation: 'Colombo Depot',
          destination: 'Southern Expressway Corridor Inspection',
          startOdometer: 43500,
          endOdometer: 46700,
          totalKm: 3200, // 200 km extra over 3,000 km allowance
          otHours: 4,
          fuelLitres: 256,
          fuelCost: 84480,
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
          preferredSupplier: (suppliers[2] || suppliers[0])._id,
          supplierName: (suppliers[2] || suppliers[0]).name,
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
          preferredSupplier: (suppliers[2] || suppliers[0])._id,
          supplierName: (suppliers[2] || suppliers[0]).name,
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
          currentStock: 3, // Low stock alert!
          minStockLevel: 4,
          reorderQuantity: 6,
          unitCost: 16500,
          preferredSupplier: (suppliers[2] || suppliers[0])._id,
          supplierName: (suppliers[2] || suppliers[0]).name,
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
          preferredSupplier: (suppliers[2] || suppliers[0])._id,
          supplierName: (suppliers[2] || suppliers[0]).name,
          storageLocation: 'Tyre Storage Bay T-1',
        },
      ]);
    }

    // 12. Maintenance Records with Parts Issued
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
        notes: 'Oil changed with Castrol Magnatec. Filter changed. Brake pads inspected with 60% life remaining.',
      });
    }

    // 13. Reusable Social Media Post Templates
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
            '🌐 {companyName} — Island-wide Tourism & Corporate Transport Service',
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

    // 14. Ready-to-Share Social Post Draft
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

    res.json({
      success: true,
      message: 'FleetFlow Enterprise Database successfully populated with realistic multi-company, fleet, contract, inventory, payroll, and social media data!',
      counts: {
        vehicles: (await Vehicle.countDocuments()),
        drivers: (await Driver.countDocuments()),
        customerCompanies: (await CustomerCompany.countDocuments()),
        projects: (await Project.countDocuments()),
        contracts: (await Contract.countDocuments()),
        spareParts: (await SparePart.countDocuments()),
        services: (await VehicleService.countDocuments()),
        socialTemplates: (await SocialPostTemplate.countDocuments()),
        socialDrafts: (await SocialPostDraft.countDocuments()),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FleetFlow Enterprise Master Backend running on port ${PORT}`);
});
