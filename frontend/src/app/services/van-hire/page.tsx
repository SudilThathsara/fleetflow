'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Plane,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { QuickEnquiryCard } from '@/components/public/QuickEnquiryCard';

export default function VanHirePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
              <Link href="/services" className="hover:underline">
                Services
              </Link>
              <span>/</span>
              <span>Passenger Vans</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Passenger Van Hire in Sri Lanka
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Toyota KDH, Commuter, and High Roof luxury vans with dual air conditioning and verified chauffeurs for corporate staff transport, airport drops, and island-wide tours.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              {/* Image Banner */}
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-16/9 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200"
                  alt="Passenger Van in Sri Lanka"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Spacious & Comfortable Group Mobility
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our passenger van fleet is tailored to meet the exacting standards of corporate travel, executive delegations, airport transfers, and extended round-island tours. Each vehicle is equipped with dual cooling systems, adjustable high-back seats, tinted privacy glass, and extensive luggage capacity.
                </p>
              </div>

              {/* Vehicle Options */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Van Categories Available:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">Toyota KDH High Roof (Commuter)</p>
                    <p className="text-slate-500 text-[11px]">Up to 14 passenger capacity with high ceiling, full standing clearance, and individual A/C vents.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">Toyota KDH Standard Roof</p>
                    <p className="text-slate-500 text-[11px]">Ideal for 7 to 9 passengers with expansive rear luggage space for suitcases and golf bags.</p>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Included Passenger Comfort Features:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Dual Air Conditioning (Front & Cabin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Reclining High-Back Ergonomic Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Large Luggage Boot Space</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Seatbelts on All Passenger Rows</span>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-slate-900">Popular Hire Arrangements</h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Monthly Staff Shuttle:</strong> Morning and evening designated corporate employee routing.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Airport Transfers (Katunayake CMB):</strong> Punctual flight arrivals and departures with flight tracking.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Island-Wide Excursions:</strong> Multi-day tourist itineraries (Kandy, Sigiriya, Nuwara Eliya, Galle).</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/request-quotation"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>Request Van Quotation</span>
                </Link>
                <Link
                  href="/request-booking"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                >
                  Book a Van Tour
                </Link>
              </div>
            </div>

            {/* Right Column: Quick Enquiry Form */}
            <div className="lg:col-span-5 space-y-6">
              <QuickEnquiryCard defaultService="Passenger Van Hire" />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
