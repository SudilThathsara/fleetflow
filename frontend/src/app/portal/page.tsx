'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CalendarCheck2,
  Receipt,
  LifeBuoy,
  CreditCard,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { useAuth } from '@/context/AuthContext';

export default function CustomerPortalDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDashboardData(data.data);
        }
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboardData?.stats || {
    activeBookingsCount: 0,
    pendingQuotesCount: 0,
    unpaidInvoicesCount: 0,
    totalBalanceDue: 0,
    openTicketsCount: 0,
    unreadNotifications: 0,
  };

  const recent = dashboardData?.recent || {
    quotationRequests: [],
    quotations: [],
    bookings: [],
    invoices: [],
    supportTickets: [],
    notifications: [],
  };

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
              <Building size={13} />
              <span>{user?.name || 'Customer Account'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Customer'}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Manage your vehicle quotations, operational booking requests, running chart invoices, and support tickets from your secure customer console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/request-quotation"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle size={15} />
              <span>Request Quotation</span>
            </Link>
            <Link
              href="/request-booking"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <CalendarCheck2 size={15} />
              <span>Book a Vehicle</span>
            </Link>
          </div>
        </div>

        {/* Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.activeBookingsCount}</p>
              <Link href="/portal/bookings" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
                View current trips →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Quotes</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.pendingQuotesCount}</p>
              <Link href="/portal/quotations" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
                Review formal quotes →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</p>
              <p className="text-xl font-black text-slate-900 mt-1">
                LKR {stats.totalBalanceDue.toLocaleString()}
              </p>
              <Link href="/portal/invoices" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
                {stats.unpaidInvoicesCount} unpaid invoice(s) →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Desk</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.openTicketsCount}</p>
              <Link href="/portal/support" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
                Open support tickets →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <LifeBuoy size={24} />
            </div>
          </div>
        </div>

        {/* Two-Column Activity Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Recent Quotes & Bookings */}
          <div className="lg:col-span-8 space-y-8">
            {/* Recent Quotation Requests */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Quotation Requests</h3>
                  <p className="text-xs text-slate-500">Track status of custom quotes prepared by our fleet desk</p>
                </div>
                <Link
                  href="/portal/quotation-requests"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  View All →
                </Link>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading requests...</p>
              ) : recent.quotationRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No quotation requests submitted yet. Click &quot;Request Quotation&quot; to begin.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {recent.quotationRequests.map((q: any) => (
                    <div key={q._id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{q.requestId}</span>
                        <p className="text-slate-600 font-medium">
                          {q.numberOfVehicles || 1}x {q.vehicleCategory} ({q.hireType})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Start: {new Date(q.startDate).toLocaleDateString()} • {q.serviceArea}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            q.status === 'Quoted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : q.status === 'Under Review'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Vehicle Bookings</h3>
                  <p className="text-xs text-slate-500">Confirmed operational bookings and assigned vehicles</p>
                </div>
                <Link href="/portal/bookings" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                  View All →
                </Link>
              </div>

              {loading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading bookings...</p>
              ) : recent.bookings.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No active bookings registered. You can submit a booking request anytime.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {recent.bookings.map((b: any) => (
                    <div key={b._id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{b.bookingId}</span>
                        <p className="text-slate-600 font-medium">
                          {b.vehicleType} • {b.pickupLocation} to {b.destination}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(b.pickupDate).toLocaleDateString()} to {new Date(b.returnDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {b.status}
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          LKR {b.agreedPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Invoices & Notifications */}
          <div className="lg:col-span-4 space-y-8">
            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Latest Invoices</h3>
                <Link href="/portal/invoices" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                  All Invoices →
                </Link>
              </div>

              {recent.invoices.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No invoices issued yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {recent.invoices.slice(0, 3).map((inv: any) => (
                    <div key={inv._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</p>
                        <p className="text-[11px] text-slate-500">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">LKR {inv.totalAmount?.toLocaleString()}</p>
                        <span
                          className={`text-[10px] font-bold ${
                            inv.balanceDue === 0 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {inv.balanceDue === 0 ? 'Paid' : `Due: ${inv.balanceDue?.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications & Help Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sky-400">
                <LifeBuoy size={20} />
                <h3 className="font-bold text-sm text-white">Need Support or Assistance?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our operations team is available to assist with route adjustments, driver arrangements, and billing clarifications.
              </p>
              <Link
                href="/portal/support"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <span>Open Support Ticket</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
