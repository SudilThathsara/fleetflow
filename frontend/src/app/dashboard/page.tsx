'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Car,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatLKR = (amount: number = 0) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operations Control Center</h1>
            <p className="text-sm text-slate-500">
              Live fleet status, monthly running charts, finances & driver operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center space-x-1"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <Link
              href="/bookings"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm shadow-blue-500/20"
            >
              <PlusCircle size={16} />
              <span>Create Booking</span>
            </Link>
            <Link
              href="/running-charts"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5"
            >
              <FileSpreadsheet size={16} />
              <span>Add Running Entry</span>
            </Link>
          </div>
        </div>

        {/* Operational Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Vehicles</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.availableVehicles || 0} / {stats?.totalVehicles || 0}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {stats?.availableVehicles || 0} Available for dispatch
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Drivers</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.availableDrivers || 0} / {stats?.totalDrivers || 0}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Ready for assignments</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Trips</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.todayBookings || 0}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{stats?.upcomingBookings || 0} upcoming trips</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Running Km</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats?.monthlyKm ? stats.monthlyKm.toLocaleString() : 0} KM
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">From Running Charts</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Running Revenue</p>
            <h4 className="text-xl font-bold text-slate-900 mt-1">{formatLKR(stats?.monthlyRunningRevenue)}</h4>
            <div className="flex items-center text-xs text-emerald-600 mt-2">
              <TrendingUp size={14} className="mr-1" />
              <span>Operational earnings</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Invoices</p>
            <h4 className="text-xl font-bold text-rose-600 mt-1">
              {formatLKR(stats?.totalOutstandingInvoices)}
            </h4>
            <div className="flex items-center text-xs text-rose-600 mt-2">
              <AlertTriangle size={14} className="mr-1" />
              <span>Customer receivables</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Driver Payables</p>
            <h4 className="text-xl font-bold text-amber-600 mt-1">
              {formatLKR(stats?.unpaidDriverSettlements)}
            </h4>
            <div className="flex items-center text-xs text-amber-600 mt-2">
              <span>Unsettled driver earnings</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Net Operational Profit</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">
              {formatLKR(stats?.netOperationalProfit)}
            </h4>
            <div className="flex items-center text-xs text-emerald-600 mt-2">
              <TrendingUp size={14} className="mr-1" />
              <span>Current month profit</span>
            </div>
          </div>
        </div>

        {/* Operational Alerts & Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips & Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Recent Transport Bookings</h3>
                <p className="text-xs text-slate-500">Live operational status</p>
              </div>
              <Link href="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                <span>View all</span>
                <ArrowUpRight size={14} className="ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-5">Booking ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-5 text-right">Agreed Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No bookings found. Click "Create Booking" to add one.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-5 font-bold text-slate-800">{b.bookingId}</td>
                        <td className="p-3 font-medium text-slate-900">{b.customerName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-700 font-bold">
                            {b.assignedVehicleReg || 'Unassigned'}
                          </span>
                        </td>
                        <td className="p-3">{b.assignedDriverName || 'Unassigned'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              b.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : b.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : b.status === 'Confirmed'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 pr-5 text-right font-bold text-slate-900">
                          {formatLKR(b.agreedPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert Center */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-800">Operational Reminders</h3>

            <div className="space-y-3">
              {/* Document Expiring */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    {stats?.expiringDocsCount || 0} Documents Expiring Soon
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Insurance, Revenue licences or permits expiring within 30 days.
                  </p>
                  <Link
                    href="/documents"
                    className="inline-block mt-2 text-xs font-bold text-amber-900 underline"
                  >
                    Review Document Registry &rarr;
                  </Link>
                </div>
              </div>

              {/* Social Media Leads */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start space-x-3">
                <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800">
                    {stats?.newLeadsCount || 0} New Social Media Inquiries
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    From Facebook transport groups & WhatsApp inquiries.
                  </p>
                  <Link
                    href="/social-leads"
                    className="inline-block mt-2 text-xs font-bold text-blue-900 underline"
                  >
                    Open Lead Manager &rarr;
                  </Link>
                </div>
              </div>

              {/* Maintenance Alert */}
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-start space-x-3">
                <Clock size={20} className="text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-purple-800">Service & Maintenance Tracker</p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Tracks 5,000 KM threshold automatic alerts from odometer recordings.
                  </p>
                  <Link
                    href="/services"
                    className="inline-block mt-2 text-xs font-bold text-purple-900 underline"
                  >
                    View Maintenance Log &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
