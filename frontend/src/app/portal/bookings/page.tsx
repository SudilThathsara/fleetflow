'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortalLayout } from '@/components/portal/PortalLayout';
import {
  CalendarCheck2,
  Calendar,
  MapPin,
  Car,
  Clock,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  LifeBuoy,
} from 'lucide-react';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBookings(data.data.recent?.bookings || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Vehicle Bookings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirmed vehicle assignments, scheduled travel dates, and operational itinerary status.
            </p>
          </div>

          <Link
            href="/request-booking"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle size={15} />
            <span>Request New Booking</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CalendarCheck2 size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Operational Bookings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once your booking enquiries are confirmed by our dispatch center, your verified vehicles and trip dates appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/request-booking"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                <span>Reserve a Vehicle</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono font-bold text-sm text-slate-900">{b.bookingId}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : b.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{b.vehicleType}</h3>
                    <p className="text-xs text-slate-600">
                      Route: {b.pickupLocation} → {b.destination}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pickup Date</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(b.pickupDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Return Date</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(b.returnDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {b.assignedDriverName && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span>Assigned Chauffeur:</span>
                      <span className="font-bold text-slate-800">{b.assignedDriverName}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-700">
                    Agreed Hire Amount:{' '}
                    <span className="font-bold text-slate-900 font-mono">
                      LKR {b.agreedPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/portal/support?ref=${encodeURIComponent(b.bookingId)}`}
                    className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <LifeBuoy size={14} />
                    <span>Request Change / Support</span>
                  </Link>

                  <span className="text-slate-400 text-[11px]">Source: {b.bookingSource || 'Web'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
