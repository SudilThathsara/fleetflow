'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Phone,
  FileCheck2,
  Calendar,
  DollarSign,
  Truck,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { QuickEnquiryCard } from '@/components/public/QuickEnquiryCard';

export default function MonthlyVehicleHirePage() {
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
              <span>Corporate Long-Term</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Monthly Corporate Vehicle Hire in Sri Lanka
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dedicated long-term passenger and commercial vehicle assignments with transparent monthly billing, agreed kilometre thresholds, and verified professional drivers.
            </p>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Detailed Service Explanation */}
            <div className="lg:col-span-7 space-y-10">
              {/* Process & Policy */}
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  How Our Monthly Vehicle Agreements Work
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our monthly vehicle hire structure is engineered for businesses, multinational corporations, non-governmental organizations, and engineering joint ventures that require reliable dedicated transport without the capital expenditure and overhead of owning a fleet.
                </p>
              </div>

              {/* 4 Pillars of Monthly Hire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Agreed Kilometre Packages</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Standard monthly contracts include a base allocation (typically 3,000 KM per month). Any excess mileage is calculated at transparent, agreed contractual extra-km rates.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Maintenance & Servicing</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All scheduled preventative maintenance, engine oil replacements, tyre rotations, and road fitness checks are completely covered by us without client interruption.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Replacement Guarantee</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In the event of routine mechanical servicing, repairs, or unexpected downtime, a replacement vehicle in the same category is dispatched promptly to ensure business continuity.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Professional Driver Included</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Experienced, vetted chauffeurs working on regulated standard 8 or 9-hour daily shifts. Driver EPF/ETF statutory contributions and base salaries are managed by us.
                  </p>
                </div>
              </div>

              {/* Running Chart Reconciliation & Billing */}
              <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileCheck2 size={18} className="text-sky-600" />
                  <span>Audited Running Charts & Monthly Invoicing</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every working day, our drivers record odometer starting readings, closing readings, routes travelled, and overtime hours on official running charts signed off by your designated company officer. At the end of each billing cycle, our billing engine produces an itemized consolidated VAT invoice reflecting verified odometer differences.
                </p>
              </div>

              {/* Fuel and Overtime Policies */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-slate-900">Flexible Fuel & Operational Options</h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Client-Provided Fuel:</strong> The corporate client provides fuel directly, eliminating fuel markups.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Driver Overtime (OT):</strong> Additional hours beyond agreed shifts are charged at transparent, predefined hourly OT rates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Outstation Night Allowances:</strong> When assignments require overnight stays outside base, standardized lodging allowances apply.</span>
                  </li>
                </ul>
              </div>

              {/* Action */}
              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/request-quotation"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>Request Monthly Hire Quotation</span>
                </Link>
                <Link
                  href="/corporate-transport"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                >
                  Corporate SLA Details
                </Link>
              </div>
            </div>

            {/* Right Column: Quick Enquiry Box */}
            <div className="lg:col-span-5 space-y-6">
              <QuickEnquiryCard defaultService="Monthly Vehicle Hire" />

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
                <h4 className="font-bold text-sm">Need a Multi-Vehicle Fleet?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For annual agreements involving 3 or more vehicles (combinations of double cabs, passenger vans, and sedans), our corporate team provides tailored volume rate versions.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                >
                  <span>Speak with Corporate Desk</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
