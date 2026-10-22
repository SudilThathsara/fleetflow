'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  ShieldCheck,
  Truck,
  Car,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useAuth } from '@/context/AuthContext';

export default function RequestBookingPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleCategory: 'Sedan / Executive Car',
    pickupLocation: 'Colombo 03 / Airport',
    destination: 'Kandy / Outstation Tour',
    pickupDate: '',
    returnDate: '',
    passengerCount: 2,
    driverPreference: 'With Professional Driver',
    fuelArrangement: 'Fuel Included in Quote',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/public/booking-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.requestId);
      } else {
        setError(data.message || 'Unable to submit booking request. Please check inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Vehicle Reservation Desk
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Request a Booking</h1>
            <p className="text-sm text-slate-300">
              Submit your itinerary and vehicle requirements. Our fleet team verifies asset availability and confirms your reservation.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submittedRef ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={44} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Booking Request Submitted!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your reservation request is now pending operations verification under reference:
                </p>
                <div className="my-3 py-2.5 px-6 bg-sky-50 text-sky-800 font-mono font-black text-xl rounded-2xl border border-sky-200 inline-block">
                  {submittedRef}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto text-xs text-slate-700 text-left space-y-2">
                <p>
                  • <strong>Real Availability Verification:</strong> Our dispatch officer checks physical vehicle schedule and driver rosters.
                </p>
                <p>
                  • <strong>Confirmation Call & Email:</strong> You will receive a confirmation voucher once vehicle and driver are locked in.
                </p>
                <p>
                  • <strong>Notice:</strong> Online submissions remain pending enquiries until authorized staff approval.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                {user ? (
                  <Link
                    href="/portal/bookings"
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    View in Customer Portal
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Register to Track Bookings
                  </Link>
                )}

                <button
                  onClick={() => setSubmittedRef(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Submit Another Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Reserve a Vehicle
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete the trip details below to receive availability status.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="Nihal De Silva"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vehicle Category *</label>
                    <select
                      name="vehicleCategory"
                      value={formData.vehicleCategory}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                    >
                      <option value="Sedan / Executive Car">Sedan / Executive Car</option>
                      <option value="Double Cab Pickup (4x4)">Double Cab Pickup (4x4)</option>
                      <option value="Passenger Van (Toyota KDH)">Passenger Van (Toyota KDH)</option>
                      <option value="SUV / 4WD">SUV / 4WD</option>
                      <option value="Mini Bus (26-Seater)">Mini Bus (26-Seater)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Number of Passengers</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      name="passengerCount"
                      value={formData.passengerCount}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pickup Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Return Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pickup Location *</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="e.g. Colombo 07 / Katunayake Airport"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Destination / Tour Route *</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g. Kandy / Galle / Local City"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Driver Preference</label>
                    <select
                      name="driverPreference"
                      value={formData.driverPreference}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                    >
                      <option value="With Professional Driver">With Professional Driver</option>
                      <option value="Self-Drive (Subject to Security Deposit & License Check)">Self-Drive (Subject to approval)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fuel Preference</label>
                    <select
                      name="fuelArrangement"
                      value={formData.fuelArrangement}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                    >
                      <option value="Fuel Included in Quote">Fuel Included in Rate</option>
                      <option value="Client Supplies Fuel (Tank-to-Tank)">Client Supplies Fuel (Tank-to-Tank)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Special Instructions & Flight / Tour Details</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Flight arrival times, luggage requirements, extra child seat needs..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Submitting this form creates a pending booking inquiry. Real vehicle confirmation is issued once availability is confirmed by our operations center.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Booking Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
