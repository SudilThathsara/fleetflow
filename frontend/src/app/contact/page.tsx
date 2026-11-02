
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function ContactPage() {
  const [content, setContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceCategory: 'General Transport Inquiry',
    serviceArea: 'Colombo / Western Province',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const businessName = content?.businessName || 'Tourism & Transport';
  const phone = content?.phone || '+94 11 234 5678 / +94 77 123 4567';
  const whatsappNumber = content?.whatsappNumber || '+94771234567';
  const publicEmail = content?.publicEmail || 'inquiries@transportlanka.lk';
  const address = content?.address || 'No. 142/B, High Level Road, Nugegoda, Sri Lanka';
  const businessHours = content?.businessHours || 'Monday - Saturday: 7:00 AM – 8:00 PM | 24/7 Roadside Assistance & Dispatch';
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');

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
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          serviceCategory: formData.serviceCategory,
          serviceArea: formData.serviceArea,
          message: formData.message,
          source: 'Website Contact Page',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedId(data.enquiryId);
      } else {
        setError(data.message || 'Unable to submit enquiry. Please check your contact information.');
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
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Customer Desk & Dispatch
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Contact Us</h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Reach out to our operations control center for vehicle quotations, immediate bookings, or corporate transport SLA consultations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Direct Contact Information */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Get in Touch</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Our customer service officers are available to assist with vehicle specifications, routes, and billing.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <MapPin size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Head Operations Office</p>
                    <p className="text-slate-600 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Phone size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Telephone Hotlines</p>
                    <p className="text-slate-600 mt-0.5">{phone}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Mail size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Public Inquiries Email</p>
                    <p className="text-slate-600 mt-0.5">{publicEmail}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Clock size={18} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Operating Hours</p>
                    <p className="text-slate-600 mt-0.5">{businessHours}</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp direct chat */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-600" />
                  <span>Instant WhatsApp Booking Line</span>
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Have an urgent trip or require immediate vehicle availability check? Message our dispatch coordinator directly on WhatsApp.
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <MessageSquare size={14} />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                {submittedId ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Delivered!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Your message has been assigned reference ID:
                    </p>
                    <div className="py-2 px-4 bg-sky-50 text-sky-800 font-mono font-bold text-base rounded-xl border border-sky-200 inline-block">
                      {submittedId}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Our customer team will contact you back via telephone or email promptly.
                    </p>
                    <button
                      onClick={() => {
                        setSubmittedId(null);
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          serviceCategory: 'General Transport Inquiry',
                          serviceArea: 'Colombo / Western Province',
                          message: '',
                        });
                      }}
                      className="mt-4 text-xs text-sky-600 font-bold underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900">Send an Enquiry Message</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Fill in your details and message. Your enquiry is logged in our CRM.
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
                          <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Sunil Fernando"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+94 77 123 4567"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contact@example.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                          <select
                            name="serviceCategory"
                            value={formData.serviceCategory}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          >
                            <option value="General Transport Inquiry">General Transport Inquiry</option>
                            <option value="Monthly Corporate Vehicle Hire">Monthly Corporate Vehicle Hire</option>
                            <option value="Double-Cab Pickup Hire">Double-Cab Pickup Hire</option>
                            <option value="Passenger Van Tour">Passenger Van Tour</option>
                            <option value="Airport Transfer Drop">Airport Transfer Drop</option>
                            <option value="Corporate Fleet SLA">Corporate Fleet SLA</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Operational Area</label>
                        <input
                          type="text"
                          name="serviceArea"
                          value={formData.serviceArea}
                          onChange={handleChange}
                          placeholder="e.g. Colombo, Katunayake, Kandy"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Message & Requirements *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          placeholder="How can our transport team assist you? Please include dates, vehicle preferences, or special requests..."
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        <span>Your data is stored securely in accordance with our Privacy Policy.</span>
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
                            <span>Send Message</span>
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
