import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import Booking from '@/models/Booking';
import RunningChartEntry from '@/models/RunningChartEntry';
import Invoice from '@/models/Invoice';
import Expense from '@/models/Expense';
import DriverSettlement from '@/models/DriverSettlement';
import DocumentRecord from '@/models/DocumentRecord';
import SocialLead from '@/models/SocialLead';
import CustomerCompany from '@/models/CustomerCompany';
import Project from '@/models/Project';
import Contract from '@/models/Contract';
import SparePart from '@/models/SparePart';

export async function GET() {
  try {
    await connectDB();

    // 1. Vehicle counts
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const bookedVehicles = await Vehicle.countDocuments({ status: { $in: ['Booked', 'On Trip'] } });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'Under Maintenance' });

    // 2. Driver counts
    const totalDrivers = await Driver.countDocuments();
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });

    // 3. Companies, Projects & Contracts
    const totalCompanies = await CustomerCompany.countDocuments({ status: 'Active' });
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const activeContracts = await Contract.countDocuments({ status: 'Active' });
    const lowStockParts = await SparePart.countDocuments({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } });

    // 4. Booking counts
    const totalBookings = await Booking.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      pickupDate: { $gte: today, $lt: tomorrow },
    });
    const upcomingBookings = await Booking.countDocuments({
      pickupDate: { $gte: tomorrow },
      status: { $in: ['Confirmed', 'Assigned'] },
    });

    // 5. Financial metrics
    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthlyRunningEntries = await RunningChartEntry.find({ monthYear: currentMonthPrefix });

    const monthlyKm = monthlyRunningEntries.reduce((sum, item) => sum + (item.totalKm || 0), 0);
    const monthlyRunningRevenue = monthlyRunningEntries.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const monthlyRunningExpenses = monthlyRunningEntries.reduce(
      (sum, item) => sum + (item.fuelCost || 0) + (item.otherExpenses || 0) + (item.tollCharges || 0),
      0
    );

    const invoices = await Invoice.find();
    const totalInvoiced = invoices.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalOutstandingInvoices = invoices.reduce((sum, item) => sum + (item.balanceDue || 0), 0);
    const totalCashCollected = invoices.reduce((sum, item) => sum + (item.paidAmount || 0), 0);

    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    const settlements = await DriverSettlement.find();
    const unpaidDriverSettlements = settlements.reduce((sum, item) => sum + (item.remainingBalance || 0), 0);

    // 6. Expiring documents (next 30 days)
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    const expiringDocsCount = await DocumentRecord.countDocuments({
      expiryDate: { $lte: thirtyDaysAhead },
    });

    // 7. Social leads
    const newLeadsCount = await SocialLead.countDocuments({ status: 'New' });

    // 8. Recent bookings and activities
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalVehicles,
        availableVehicles,
        bookedVehicles,
        maintenanceVehicles,
        totalDrivers,
        availableDrivers,
        totalCompanies,
        activeProjects,
        activeContracts,
        lowStockParts,
        totalBookings,
        todayBookings,
        upcomingBookings,
        monthlyKm,
        monthlyRunningRevenue,
        monthlyRunningExpenses,
        totalInvoiced,
        totalOutstandingInvoices,
        totalCashCollected,
        totalExpenses,
        unpaidDriverSettlements,
        expiringDocsCount,
        newLeadsCount,
        netOperationalProfit: monthlyRunningRevenue - monthlyRunningExpenses,
      },
      recentBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
