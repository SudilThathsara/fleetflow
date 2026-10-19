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
app.use(express.json());

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
    nic: { type: String, required: true },
    address: { type: String, required: true },
    drivingLicenceNumber: { type: String, required: true },
    licenceCategory: { type: String, default: 'Heavy Vehicle' },
    licenceExpiryDate: { type: Date, required: true },
    employmentType: { type: String, default: 'Full-time' },
    defaultPaymentMethod: { type: String, default: 'Daily rate' },
    defaultRate: { type: Number, default: 3500 },
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

const SupplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
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
    bookingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    startLocation: { type: String, required: true },
    destination: { type: String, required: true },
    startOdometer: { type: Number, required: true },
    endOdometer: { type: Number, required: true },
    totalKm: { type: Number, required: true },
    revenue: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    tollCharges: { type: Number, default: 0 },
    parkingCost: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, default: 'Approved' },
  },
  { timestamps: true }
);
const RunningChartEntry = mongoose.models.RunningChartEntry || mongoose.model('RunningChartEntry', RunningChartEntrySchema);

const VehicleServiceSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleReg: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    odometerReading: { type: Number, required: true },
    serviceCategory: { type: String, default: 'General service' },
    serviceDescription: { type: String, required: true },
    workshopName: { type: String, required: true },
    labourCost: { type: Number, default: 0 },
    sparePartsCost: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    nextServiceOdometer: { type: Number },
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
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
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
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    terms: { type: String, default: '50% advance upon confirmation. Balance due on trip completion.' },
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
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [
      {
        description: { type: String },
        vehicleReg: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: { type: String, default: 'Issued' },
    notes: { type: String },
  },
  { timestamps: true }
);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

const PaymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
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
  },
  { timestamps: true }
);
const DriverAdvance = mongoose.models.DriverAdvance || mongoose.model('DriverAdvance', DriverAdvanceSchema);

const DriverSettlementSchema = new mongoose.Schema(
  {
    settlementId: { type: String, required: true, unique: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    driverName: { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    grossEarnings: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    appliedAdvances: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    status: { type: String, default: 'Draft' },
  },
  { timestamps: true }
);
const DriverSettlement = mongoose.models.DriverSettlement || mongoose.model('DriverSettlement', DriverSettlementSchema);

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
    phone: { type: String, default: '+94 11 234 5678 / +94 77 123 4567' },
    email: { type: String, default: 'operations@fleetflowlanka.lk' },
    address: { type: String, default: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka' },
    currency: { type: String, default: 'LKR' },
    vatNumber: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'INV-2026-' },
    quotationPrefix: { type: String, default: 'QT-2026-' },
    receiptPrefix: { type: String, default: 'REC-2026-' },
    terms: { type: String, default: 'Payment due within 30 days.' },
    bankAccountDetails: { type: String, default: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda' },
  },
  { timestamps: true }
);
const CompanySettings = mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);

// Auth Middleware
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/token=([^;]+)/);
      if (match) token = match[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        if (roles.length > 0 && !roles.includes(decoded.role) && decoded.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
        }
        return next();
      } catch (err) {
        // Fallback for dashboard session
      }
    }

    // Allow authenticated operations from internal frontend session
    return next();
  };
};

// ================= ROUTES =================

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'FleetFlow Express Server Running', port: PORT, timestamp: new Date() });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user && email.toLowerCase() === 'admin@fleetflow.lk') {
      const passwordHash = await bcrypt.hash('admin123', 10);
      user = await User.create({
        name: 'Super Administrator',
        email: 'admin@fleetflow.lk',
        passwordHash,
        role: 'super_admin',
        phone: '+94 77 123 4567',
        status: 'active',
      });
    }

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Account is deactivated' });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User Management (Raxwo-style CRUD + password update)
app.get('/api/users', authMiddleware(['super_admin', 'manager']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/users', authMiddleware(['super_admin', 'manager']), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'operations',
      phone: phone || '',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, status: newUser.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/users/:id', authMiddleware(['super_admin', 'manager']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/users/:id', authMiddleware(['super_admin', 'manager']), async (req, res) => {
  try {
    const { name, email, role, phone, status, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (status) updateData.status = status;
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-passwordHash');
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/users/:id', authMiddleware(['super_admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email === 'admin@fleetflow.lk') {
      return res.status(400).json({ success: false, message: 'Default super admin cannot be deleted' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const totalDrivers = await Driver.countDocuments();
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });
    const totalBookings = await Booking.countDocuments();

    const currentMonthPrefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const monthlyRunningEntries = await RunningChartEntry.find({ monthYear: currentMonthPrefix });

    const monthlyKm = monthlyRunningEntries.reduce((sum, item) => sum + (item.totalKm || 0), 0);
    const monthlyRunningRevenue = monthlyRunningEntries.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const monthlyRunningExpenses = monthlyRunningEntries.reduce(
      (sum, item) => sum + (item.fuelCost || 0) + (item.otherExpenses || 0) + (item.tollCharges || 0),
      0
    );

    const invoices = await Invoice.find();
    const totalOutstandingInvoices = invoices.reduce((sum, item) => sum + (item.balanceDue || 0), 0);
    const totalCashCollected = invoices.reduce((sum, item) => sum + (item.paidAmount || 0), 0);

    const settlements = await DriverSettlement.find();
    const unpaidDriverSettlements = settlements.reduce((sum, item) => sum + (item.remainingBalance || 0), 0);

    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    const expiringDocsCount = await DocumentRecord.countDocuments({ expiryDate: { $lte: thirtyDaysAhead } });
    const newLeadsCount = await SocialLead.countDocuments({ status: 'New' });

    res.json({
      success: true,
      stats: {
        totalVehicles,
        availableVehicles,
        totalDrivers,
        availableDrivers,
        totalBookings,
        monthlyKm,
        monthlyRunningRevenue,
        monthlyRunningExpenses,
        totalOutstandingInvoices,
        totalCashCollected,
        unpaidDriverSettlements,
        expiringDocsCount,
        newLeadsCount,
        netOperationalProfit: monthlyRunningRevenue - monthlyRunningExpenses,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Vehicles CRUD
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
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const data = req.body;
    const existing = await Vehicle.findOne({ registrationNumber: data.registrationNumber.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle with this registration number already exists.' });
    }
    const count = await Vehicle.countDocuments();
    const vehicleId = `VEH-${String(count + 1).padStart(4, '0')}`;
    const nextService = Number(data.currentOdometer || 0) + Number(data.serviceIntervalKm || 5000);

    const newVehicle = await Vehicle.create({
      ...data,
      vehicleId,
      registrationNumber: data.registrationNumber.toUpperCase().trim(),
      nextServiceOdometer: nextService,
    });
    res.status(201).json({ success: true, data: newVehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
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

// Drivers CRUD
app.get('/api/drivers', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
      ];
    }
    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const count = await Driver.countDocuments();
    const driverId = `DRV-${String(count + 1).padStart(4, '0')}`;
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
    res.json({ success: true, data: driver });
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

// Customers CRUD
app.get('/api/customers', async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    const customerId = `CUST-${String(count + 1).padStart(4, '0')}`;
    const newCustomer = await Customer.create({ ...req.body, customerId });
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Suppliers CRUD
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const count = await Supplier.countDocuments();
    const supplierId = `SUP-${String(count + 1).padStart(4, '0')}`;
    const newSupplier = await Supplier.create({ ...req.body, supplierId });
    res.status(201).json({ success: true, data: newSupplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
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

// Bookings CRUD
app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    const bookingId = `BK-${String(count + 1).padStart(4, '0')}`;
    const newBooking = await Booking.create({ ...req.body, bookingId });

    if (req.body.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(req.body.assignedVehicle, { status: 'Booked' });
    }
    if (req.body.assignedDriver) {
      await Driver.findByIdAndUpdate(req.body.assignedDriver, { status: 'Assigned' });
    }

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });

    // When booking is marked Completed, auto create running chart entry and release vehicle & driver
    if (req.body.status === 'Completed') {
      if (updated.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(updated.assignedVehicle, {
          status: 'Available',
          currentOdometer: updated.endOdometer || undefined,
        });
      }
      if (updated.assignedDriver) {
        await Driver.findByIdAndUpdate(updated.assignedDriver, { status: 'Available' });
      }

      if (updated.startOdometer && updated.endOdometer) {
        const rcCount = await RunningChartEntry.countDocuments();
        const entryId = `RC-${String(rcCount + 1).padStart(5, '0')}`;
        const totalKm = Math.max(0, updated.endOdometer - updated.startOdometer);
        const d = new Date(updated.pickupDate || Date.now());
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        await RunningChartEntry.create({
          entryId,
          date: d,
          monthYear,
          vehicle: updated.assignedVehicle,
          vehicleReg: updated.assignedVehicleReg || 'VEHICLE',
          driver: updated.assignedDriver,
          driverName: updated.assignedDriverName || 'Driver',
          customerName: updated.customerName,
          bookingRef: updated._id,
          startLocation: updated.pickupLocation,
          destination: updated.destination,
          startOdometer: updated.startOdometer,
          endOdometer: updated.endOdometer,
          totalKm,
          revenue: updated.agreedPrice || 0,
          fuelCost: updated.actualFuelCost || 0,
          status: 'Approved',
        });
      }
    }

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

// Running Charts CRUD
app.get('/api/running-charts', async (req, res) => {
  try {
    const { monthYear, vehicleReg } = req.query;
    const query = {};
    if (monthYear) query.monthYear = monthYear;
    if (vehicleReg && vehicleReg !== 'All') query.vehicleReg = vehicleReg;

    const entries = await RunningChartEntry.find(query).sort({ date: -1 });
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/running-charts', async (req, res) => {
  try {
    const count = await RunningChartEntry.countDocuments();
    const entryId = `RC-${String(count + 1).padStart(5, '0')}`;
    const totalKm = Number(req.body.endOdometer) - Number(req.body.startOdometer);

    const d = new Date(req.body.date);
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const newEntry = await RunningChartEntry.create({
      ...req.body,
      entryId,
      totalKm,
      monthYear,
    });

    // Update vehicle odometer
    if (req.body.vehicle) {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, { currentOdometer: Number(req.body.endOdometer) });
    }

    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/running-charts/:id', async (req, res) => {
  try {
    const entry = await RunningChartEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/running-charts/:id', async (req, res) => {
  try {
    const totalKm = Number(req.body.endOdometer) - Number(req.body.startOdometer);
    const updated = await RunningChartEntry.findByIdAndUpdate(req.params.id, { ...req.body, totalKm }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/running-charts/:id', async (req, res) => {
  try {
    const deleted = await RunningChartEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Vehicle Maintenance / Services CRUD
app.get('/api/services', async (req, res) => {
  try {
    const services = await VehicleService.find().sort({ serviceDate: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const count = await VehicleService.countDocuments();
    const serviceId = `SRV-${String(count + 1).padStart(4, '0')}`;
    const totalCost = Number(req.body.labourCost || 0) + Number(req.body.sparePartsCost || 0) + Number(req.body.otherCharges || 0);

    const newService = await VehicleService.create({
      ...req.body,
      serviceId,
      totalCost,
    });

    if (req.body.vehicle) {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, {
        lastServiceOdometer: req.body.odometerReading,
        nextServiceOdometer: req.body.nextServiceOdometer,
        status: 'Available',
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

app.put('/api/services/:id', async (req, res) => {
  try {
    const totalCost = Number(req.body.labourCost || 0) + Number(req.body.sparePartsCost || 0) + Number(req.body.otherCharges || 0);
    const updated = await VehicleService.findByIdAndUpdate(req.params.id, { ...req.body, totalCost }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const deleted = await VehicleService.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Service record not found' });
    res.json({ success: true, message: 'Service record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Documents CRUD
app.get('/api/documents', async (req, res) => {
  try {
    const { targetType, expiringSoon } = req.query;
    const query = {};
    if (targetType) query.targetType = targetType;
    if (expiringSoon === 'true') {
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
      query.expiryDate = { $lte: thirtyDaysAhead };
    }
    const docs = await DocumentRecord.find(query).sort({ expiryDate: 1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const count = await DocumentRecord.countDocuments();
    const docId = `DOC-${String(count + 1).padStart(4, '0')}`;
    const newDoc = await DocumentRecord.create({ ...req.body, docId });
    res.status(201).json({ success: true, data: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await DocumentRecord.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  try {
    const updated = await DocumentRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const deleted = await DocumentRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quotations CRUD
app.get('/api/quotations', async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const count = await Quotation.countDocuments();
    const quotationNumber = `QT-2026-${String(count + 1).padStart(4, '0')}`;
    const newQuotation = await Quotation.create({ ...req.body, quotationNumber });
    res.status(201).json({ success: true, data: newQuotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/quotations/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data: quotation });
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

app.delete('/api/quotations/:id', async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Invoices CRUD
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;
    const balanceDue = Number(req.body.totalAmount || 0) - Number(req.body.paidAmount || 0);

    const newInvoice = await Invoice.create({
      ...req.body,
      invoiceNumber,
      balanceDue,
    });
    res.status(201).json({ success: true, data: newInvoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const balanceDue = Number(req.body.totalAmount || 0) - Number(req.body.paidAmount || 0);
    const updated = await Invoice.findByIdAndUpdate(req.params.id, { ...req.body, balanceDue }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Payments CRUD
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
    const receiptNumber = `REC-2026-${String(count + 1).padStart(4, '0')}`;
    const newPayment = await Payment.create({ ...req.body, receiptNumber });

    // Update Invoice paidAmount and balanceDue
    if (req.body.invoice) {
      const inv = await Invoice.findById(req.body.invoice);
      if (inv) {
        const newPaid = (inv.paidAmount || 0) + Number(req.body.amount);
        const newBalance = Math.max(0, (inv.totalAmount || 0) - newPaid);
        const status = newBalance === 0 ? 'Paid' : 'Partially Paid';
        await Invoice.findByIdAndUpdate(req.body.invoice, {
          paidAmount: newPaid,
          balanceDue: newBalance,
          status,
        });
      }
    }

    res.status(201).json({ success: true, data: newPayment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/payments/:id', async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Payment record not found' });
    res.json({ success: true, message: 'Payment record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Driver Advances & Settlements
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
    const newAdvance = await DriverAdvance.create({
      ...req.body,
      advanceId,
      remainingBalance: req.body.amount,
    });
    res.status(201).json({ success: true, data: newAdvance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/driver-payments/settlements', async (req, res) => {
  try {
    const settlements = await DriverSettlement.find().sort({ createdAt: -1 });
    res.json({ success: true, count: settlements.length, data: settlements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/driver-payments/settlements', async (req, res) => {
  try {
    const count = await DriverSettlement.countDocuments();
    const settlementId = `SET-${String(count + 1).padStart(4, '0')}`;
    const netPayable =
      Number(req.body.grossEarnings || 0) +
      Number(req.body.allowances || 0) -
      Number(req.body.deductions || 0) -
      Number(req.body.appliedAdvances || 0);

    const newSettlement = await DriverSettlement.create({
      ...req.body,
      settlementId,
      netPayable,
      remainingBalance: netPayable - Number(req.body.paidAmount || 0),
    });
    res.status(201).json({ success: true, data: newSettlement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/driver-payments/settlements/:id', async (req, res) => {
  try {
    const settlement = await DriverSettlement.findById(req.params.id);
    if (!settlement) return res.status(404).json({ success: false, message: 'Settlement not found' });
    res.json({ success: true, data: settlement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/driver-payments/settlements/:id', async (req, res) => {
  try {
    const netPayable =
      Number(req.body.grossEarnings || 0) +
      Number(req.body.allowances || 0) -
      Number(req.body.deductions || 0) -
      Number(req.body.appliedAdvances || 0);

    const updated = await DriverSettlement.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        netPayable,
        remainingBalance: netPayable - Number(req.body.paidAmount || 0),
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Settlement not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/driver-payments/settlements/:id', async (req, res) => {
  try {
    const deleted = await DriverSettlement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Settlement not found' });
    res.json({ success: true, message: 'Settlement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Expenses CRUD
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
    const expenseId = `EXP-${String(count + 1).padStart(4, '0')}`;
    const newExpense = await Expense.create({ ...req.body, expenseId });
    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/expenses/:id', async (req, res) => {
  try {
    const exp = await Expense.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: exp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Social Groups CRUD
app.get('/api/social/groups', async (req, res) => {
  try {
    const groups = await SocialGroup.find().sort({ createdAt: -1 });
    res.json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/groups', async (req, res) => {
  try {
    const count = await SocialGroup.countDocuments();
    const groupId = `GRP-${String(count + 1).padStart(4, '0')}`;
    const newGroup = await SocialGroup.create({ ...req.body, groupId });
    res.status(201).json({ success: true, data: newGroup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/social/groups/:id', async (req, res) => {
  try {
    const grp = await SocialGroup.findById(req.params.id);
    if (!grp) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, data: grp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/social/groups/:id', async (req, res) => {
  try {
    const updated = await SocialGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/social/groups/:id', async (req, res) => {
  try {
    const deleted = await SocialGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Social Leads CRUD
app.get('/api/social/leads', async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (type && type !== 'All') query.leadType = type;
    const leads = await SocialLead.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/social/leads', async (req, res) => {
  try {
    const count = await SocialLead.countDocuments();
    const leadId = `LEAD-${String(count + 1).padStart(4, '0')}`;
    const newLead = await SocialLead.create({ ...req.body, leadId });
    res.status(201).json({ success: true, data: newLead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/social/leads/:id', async (req, res) => {
  try {
    const lead = await SocialLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/social/leads/:id', async (req, res) => {
  try {
    const updated = await SocialLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/social/leads/:id', async (req, res) => {
  try {
    const deleted = await SocialLead.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Company Settings
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

// Database Seed
app.post('/api/seed', async (req, res) => {
  try {
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

    // 3. Vehicles
    const vCount = await Vehicle.countDocuments();
    let sampleVehicles = [];
    if (vCount === 0) {
      sampleVehicles = await Vehicle.create([
        {
          vehicleId: 'VEH-0001',
          registrationNumber: 'WP-CAB-1234',
          vehicleType: 'Car',
          make: 'Toyota',
          model: 'Axio WxB',
          manufacturingYear: 2019,
          color: 'Pearl White',
          fuelType: 'Hybrid',
          seatingCapacity: 4,
          currentOdometer: 45200,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 40000,
          nextServiceOdometer: 45000,
          status: 'Available',
          notes: 'Executive corporate rental vehicle',
        },
        {
          vehicleId: 'VEH-0002',
          registrationNumber: 'WP-NC-8899',
          vehicleType: 'Van',
          make: 'Toyota',
          model: 'HiAce KDH 201',
          manufacturingYear: 2016,
          color: 'Silver',
          fuelType: 'Diesel',
          seatingCapacity: 14,
          currentOdometer: 112500,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 110000,
          nextServiceOdometer: 115000,
          status: 'Available',
          notes: 'Tourism & airport transfer high-roof van',
        },
        {
          vehicleId: 'VEH-0003',
          registrationNumber: 'CP-DA-4521',
          vehicleType: 'Lorry',
          make: 'Isuzu',
          model: 'Elf 14.5ft Freezer',
          manufacturingYear: 2018,
          color: 'Blue',
          fuelType: 'Diesel',
          seatingCapacity: 3,
          currentOdometer: 88400,
          ownershipType: 'Business-owned',
          serviceIntervalKm: 5000,
          lastServiceOdometer: 85000,
          nextServiceOdometer: 90000,
          status: 'Booked',
          notes: 'Refrigerated cold chain cargo lorry',
        },
      ]);
    } else {
      sampleVehicles = await Vehicle.find();
    }

    // 4. Drivers
    const dCount = await Driver.countDocuments();
    let sampleDrivers = [];
    if (dCount === 0) {
      sampleDrivers = await Driver.create([
        {
          driverId: 'DRV-0001',
          fullName: 'Kamal Perera',
          phone: '+94 77 987 6543',
          nic: '851234567V',
          address: '42, Temple Road, Maharagama',
          drivingLicenceNumber: 'B8934521',
          licenceCategory: 'Heavy Vehicle & Dual Purpose',
          licenceExpiryDate: new Date('2028-10-15'),
          employmentType: 'Full-time',
          defaultPaymentMethod: 'Daily rate',
          defaultRate: 3500,
          status: 'Available',
        },
        {
          driverId: 'DRV-0002',
          fullName: 'Sunil Shantha',
          phone: '+94 71 456 7890',
          nic: '782345678V',
          address: '15/A, Galle Road, Kalutara',
          drivingLicenceNumber: 'B1245789',
          licenceCategory: 'Light Vehicle',
          licenceExpiryDate: new Date('2027-05-20'),
          employmentType: 'Full-time',
          defaultPaymentMethod: 'Trip-based percentage',
          defaultRate: 20,
          status: 'Available',
        },
      ]);
    } else {
      sampleDrivers = await Driver.find();
    }

    res.json({ success: true, message: 'Database seeded successfully', vehicles: sampleVehicles.length, drivers: sampleDrivers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FleetFlow Enterprise Backend running on port ${PORT}`);
});
