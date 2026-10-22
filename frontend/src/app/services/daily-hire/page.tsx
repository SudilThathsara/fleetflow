'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Phone,
  Truck,
  Car,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function DailyHirePage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleCategory: 'Sedan / Executive Car',
    pickupLocation: 'Colombo 03',
    destination: 'Kandy / Central Province',
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
        setError(data.message || 'Submission failed. Please check your information.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
              <Link href="/services" className="hover:underline">
                Services
              </Link>
              <span>/</span>
              <span>Daily Hire & Tours</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Daily & Short-Term Vehicle Hire in Sri Lanka
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Flexible 1-day hires, 2-day outstation round trips, airport transfers, and corporate executive travel with vetted chauffeurs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Guidelines & Policy */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Transparent Daily Hire Terms
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our daily and short-term hire service is structured for punctuality, transparent odometer accounting, and complete peace of mind. Whether booking a single-day corporate appointment or a weekend outstation excursion, our professional chauffeurs ensure smooth transit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Clock className="text-sky-600 mb-2" size={18} />
                  <p className="font-bold text-slate-900">Standard Daily Shift</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">8 to 9 hours standard operational day. Additional hours billed at transparent OT rates.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="text-sky-600 mb-2" size={18} />
                  <p className="font-bold text-slate-900">Kilometre Package</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Standard 100 KM base within Colombo; customized outstation tour packages available.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">2-Day Tour & Round Trip Packages</h3>
                <p className="text-slate-600 leading-relaxed">
                  For popular weekend itineraries such as Colombo to Kandy, Galle, Sigiriya, or Nuwara Eliya, our operations desk prepares itemized quotes covering driver night allowance, expressway tolls, and realistic tour kilometre allowances.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900">What is Always Included:</h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Commercial passenger comprehensive insurance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Clean, air-conditioned vehicle dispatched from hub</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Professional uniformed driver with regional route knowledge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Official daily running chart with signed starting and ending odometer</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Interactive Daily Booking Request Form */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
                {submittedRef ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Booking Enquiry Placed!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Your booking request reference is:
                    </p>
                    <div className="py-2 px-4 bg-sky-50 text-sky-800 font-mono font-bold text-base rounded-xl border border-sky-200 inline-block">
                      {submittedRef}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Our dispatch team will verify real vehicle availability and confirm your reservation with formal pricing details.
                    </p>
                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="mt-4 text-xs text-sky-600 font-bold underline"
                    >
                      Submit another booking enquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900">Daily Booking Request</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Submit your travel dates and route to receive vehicle availability and confirmation.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            placeholder="Anura Silva"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            placeholder="+94 77 123 4567"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
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
                          placeholder="client@company.lk"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Vehicle Category</label>
                          <select
                            name="vehicleCategory"
                            value={formData.vehicleCategory}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          >
                            <option value="Sedan / Executive Car">Sedan / Executive Car</option>
                            <option value="Double Cab Pickup (4x4)">Double Cab Pickup (4x4)</option>
                            <option value="Passenger Van (KDH Commuter)">Passenger Van (KDH Commuter)</option>
                            <option value="SUV / 4WD">SUV / 4WD</option>
                            <option value="Mini Bus (26-Seater)">Mini Bus (26-Seater)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Passenger Count</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            name="passengerCount"
                            value={formData.passengerCount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
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
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
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
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
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
                            placeholder="e.g. Colombo 03 / Airport"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Destination / Area *</label>
                          <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="e.g. Kandy / Galle / Local"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Additional Notes</label>
                        <textarea
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Special requests, flight numbers, or multi-stop routing..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Submit Booking Enquiry</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
