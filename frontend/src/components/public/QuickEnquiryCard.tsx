'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Phone, User, Calendar, MapPin, Truck } from 'lucide-react';

export const QuickEnquiryCard: React.FC<{ defaultService?: string }> = ({ defaultService }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'Double Cab Pickup (4x4)',
    serviceCategory: defaultService || 'Monthly Vehicle Hire',
    dateRange: '',
    serviceArea: 'Colombo & Western Province',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/public/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedId(data.enquiryId);
      } else {
        setError(data.message || 'Submission failed. Please check your contact details.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Enquiry Received!</h3>
        <p className="text-sm text-slate-600 mt-2">
          Your enquiry reference number is:
        </p>
        <div className="my-3 py-2 px-4 bg-sky-50 text-sky-800 font-mono font-bold text-base rounded-xl border border-sky-200 inline-block">
          {submittedId}
        </div>
        <p className="text-xs text-slate-500">
          Our operations desk has been notified. We will review vehicle availability and call you back shortly.
        </p>
        <button
          onClick={() => {
            setSubmittedId(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              vehicleType: 'Double Cab Pickup (4x4)',
              serviceCategory: defaultService || 'Monthly Vehicle Hire',
              dateRange: '',
              serviceArea: 'Colombo & Western Province',
              message: '',
            });
          }}
          className="mt-5 text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer underline"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
          <Truck size={13} />
          <span>Quick Vehicle Hire Enquiry</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Get Indicative Availability</h3>
        <p className="text-xs text-slate-500 mt-1">
          Tell us what you need and our fleet coordinator will verify options.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Kamal Gunaratne"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Vehicle</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
            >
              <option value="Double Cab Pickup (4x4)">Double Cab Pickup (4x4)</option>
              <option value="Passenger Van (Toyota KDH / Commuter)">Passenger Van (KDH / Commuter)</option>
              <option value="Sedan / Car">Sedan / Executive Car</option>
              <option value="SUV / 4WD">SUV / 4WD</option>
              <option value="Coaster / Mini Bus">Mini Bus (26-Seater)</option>
              <option value="Multi-Vehicle Fleet">Multi-Vehicle Corporate Fleet</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
            <select
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
            >
              <option value="Monthly Vehicle Hire">Monthly Vehicle Hire</option>
              <option value="Corporate Annual Contract">Corporate Annual Contract</option>
              <option value="Daily / Short-Term Hire">Daily / Short-Term Hire</option>
              <option value="2-Day Tour / Round Trip">2-Day Tour / Round Trip</option>
              <option value="Airport Transfer & Drop">Airport Transfer & Drop</option>
              <option value="Project-Based Transport">Project-Based Transport</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Dates</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                name="dateRange"
                value={formData.dateRange}
                onChange={handleChange}
                placeholder="e.g. Next Monday for 3 months"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pickup or Service Area</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="Colombo / Katunayake / Site location"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Requirements & Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={2}
            placeholder="Driver preference, estimated mileage, or special transport needs..."
            required
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
              <span>Submit Quick Enquiry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
