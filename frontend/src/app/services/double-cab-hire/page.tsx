'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  ShieldCheck,
  FileText,
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { QuickEnquiryCard } from '@/components/public/QuickEnquiryCard';

export default function DoubleCabHirePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
              <Link href="/services" className="hover:underline">
                Services
              </Link>
              <span>/</span>
              <span>4x4 Pickups</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              4x4 Double-Cab Hire in Sri Lanka
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Heavy-duty four-wheel-drive Toyota Hilux, Isuzu D-Max, and Mitsubishi L200 pickups engineered for engineering construction, highway supervision, and tough outstation terrain.
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
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200"
                  alt="4x4 Double Cab Pickup"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  High Performance Dual-Cab Mobility
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our fleet of 4x4 double cab pickups combines passenger cabin comfort for five personnel with an open or canopied rear cargo bed capable of carrying specialized tools, testing equipment, survey instruments, and site gear.
                </p>
              </div>

              {/* Use Cases */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Ideal Use Cases in Sri Lanka:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900">Civil & Highway Engineering</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Project manager and supervisory transit along road packages and bridge sites.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900">Renewable Energy & Wind Parks</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Off-road transit across Mannar, Kalpitiya, and Central Province wind/solar sites.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900">Telecommunication Towers</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Maintenance crews accessing hill-country transmission stations and remote repeaters.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900">Corporate & Mining Fieldwork</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Geological assessments, plantation management, and agricultural surveys.</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications Overview */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Typical Double-Cab Fleet Specifications:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Seating</span>
                    <span className="font-bold">5 Adults</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Drivetrain</span>
                    <span className="font-bold">4x4 High / Low</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Engine</span>
                    <span className="font-bold">Turbo Diesel</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Air Conditioning</span>
                    <span className="font-bold">Standard</span>
                  </div>
                </div>
              </div>

              {/* Hire Options */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-slate-900">Flexible Rental Structures</h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Monthly Long-Term Hire:</strong> Standard 3,000 KM package with dedicated chauffeur.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Project-Based Term Hire:</strong> Tailored contracts for 3, 6, or 12 months with replacement guarantee.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>Daily & Outstation Hire:</strong> Short-term site inspection trips with professional driver.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/request-quotation"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>Request Double-Cab Quotation</span>
                </Link>
                <Link
                  href="/fleet"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                >
                  View Approved Fleet
                </Link>
              </div>
            </div>

            {/* Right Column: Quick Enquiry Form */}
            <div className="lg:col-span-5 space-y-6">
              <QuickEnquiryCard defaultService="Double-Cab Hire (4x4)" />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
