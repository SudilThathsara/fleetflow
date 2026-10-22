'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Send,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useAuth } from '@/context/AuthContext';

function RequestQuotationForm() {
  const searchParams = useSearchParams();
  const preselectedVehicle = searchParams.get('vehicle') || '';
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerType: 'individual',
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceCategory: 'Monthly Vehicle Hire',
    vehicleCategory: preselectedVehicle || 'Double Cab Pickup (4x4)',
    numberOfVehicles: 1,
    hireType: 'Monthly',
    startDate: '',
    endDate: '',
    contractDurationMonths: 12,
    serviceArea: 'Colombo & Western Province',
    estimatedKmPerMonth: 3000,
    driverRequirement: 'Experienced Professional Driver Included',
    fuelArrangement: 'Fuel Provided by Client (Direct Tanking)',
    overtimeRequirement: 'Standard 8-Hour Daily Shift (OT Billed as required)',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
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
      const res = await fetch('/api/public/quotation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.requestId);
      } else {
        setError(data.message || 'Quotation submission failed. Please verify your details.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {submittedRef ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Quotation Request Confirmed
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your request has been saved in our operations queue with the official reference:
            </p>
            <div className="my-3 py-2.5 px-6 bg-sky-50 text-sky-800 font-mono font-black text-xl rounded-2xl border border-sky-200 inline-block">
              {submittedRef}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto text-xs text-slate-700 text-left space-y-2">
            <p>
              • <strong>Review Process:</strong> Our corporate fleet manager reviews current vehicle asset allocations and contract rate brackets.
            </p>
            <p>
              • <strong>Quotation PDF:</strong> An itemized quotation will be issued within 24 hours and published to your customer portal.
            </p>
            <p>
              • <strong>Notifications:</strong> We have dispatched an acknowledgement copy to <strong>{formData.email}</strong>.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                href="/portal/quotation-requests"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Track in Customer Portal
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Create Account to Track Quotation
              </Link>
            )}

            <button
              onClick={() => {
                setSubmittedRef(null);
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full">
              Official Quotation Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Request a Formal Transport Quotation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please provide your operational scope. Our team prepares tailored quotations with fixed kilometre thresholds and clear billing terms.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-bold">Submission Issue</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Customer Type Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
                Quotation Request Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="customerType"
                    value="individual"
                    checked={formData.customerType === 'individual'}
                    onChange={handleChange}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>Individual / Private Hire</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="customerType"
                    value="corporate"
                    checked={formData.customerType === 'corporate'}
                    onChange={handleChange}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>Corporate / Registered Business Entity</span>
                </label>
              </div>
            </div>

            {/* Entity & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {formData.customerType === 'corporate' ? 'Company / Organization Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.customerType === 'corporate' ? 'e.g. Apex Technologies (Pvt) Ltd' : 'e.g. Priyantha Jayasuriya'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {formData.customerType === 'corporate' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designated Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Contact Officer Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.lk"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>
            </div>

            {/* Vehicle & Service Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Category *</label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  <option value="Monthly Vehicle Hire">Monthly Vehicle Hire</option>
                  <option value="Annual Corporate Fleet SLA">Annual Corporate Fleet SLA</option>
                  <option value="Double-Cab Pickup Hire">Double-Cab Pickup Hire</option>
                  <option value="Passenger Van Tour Hire">Passenger Van Tour Hire</option>
                  <option value="Daily / Short-Term Hire">Daily / Short-Term Hire</option>
                  <option value="Turnkey Project Transport">Turnkey Project Transport</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle Category *</label>
                <select
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  <option value="Double Cab Pickup (4x4)">Double Cab Pickup (4x4)</option>
                  <option value="Toyota KDH Passenger Van">Toyota KDH Passenger Van</option>
                  <option value="Sedan / Executive Car">Sedan / Executive Car</option>
                  <option value="SUV / 4WD">SUV / 4WD</option>
                  <option value="Mini Bus (26-Seater)">Mini Bus (26-Seater)</option>
                  <option value="Multi-Vehicle Fleet">Multi-Vehicle Fleet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Vehicles</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  name="numberOfVehicles"
                  value={formData.numberOfVehicles}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>
            </div>

            {/* Dates & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Contract Duration</label>
                <select
                  name="contractDurationMonths"
                  value={formData.contractDurationMonths}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (Annual)</option>
                  <option value="24">24 Months</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Service Area *</label>
                <input
                  type="text"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  placeholder="e.g. Colombo, Galle, Central Highway"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>
            </div>

            {/* Operational Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Monthly KM Threshold</label>
                <select
                  name="estimatedKmPerMonth"
                  value={formData.estimatedKmPerMonth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  <option value="2000">2,000 KM / month</option>
                  <option value="3000">3,000 KM / month (Standard Corporate Base)</option>
                  <option value="4000">4,000 KM / month</option>
                  <option value="5000">5,000 KM / month (High Intensity)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Driver Provision</label>
                <select
                  name="driverRequirement"
                  value={formData.driverRequirement}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  <option value="Experienced Professional Driver Included">Experienced Professional Driver Included</option>
                  <option value="Self-Drive (Subject to Corporate Authorization)">Self-Drive (Subject to Corporate Authorization)</option>
                </select>
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Requirements & Project Details</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Specific working hours, weekend operations, safety certifications required, or special invoicing instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                Submission creates a non-binding quotation request. An authorized company employee will review requirements and generate the formal quotation PDF.
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
                  <span>Submit Quotation Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function RequestQuotationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Free Commercial Quote
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Request a Quotation</h1>
            <p className="text-sm text-slate-300">
              Receive verified rates and vehicle availability customized to your corporate transport or project schedule.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Loading quotation form...</div>}>
        <RequestQuotationForm />
      </Suspense>

      <PublicFooter />
    </div>
  );
}
