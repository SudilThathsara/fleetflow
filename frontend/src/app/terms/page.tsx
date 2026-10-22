'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileCheck2, ShieldCheck, AlertCircle } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function TermsPage() {
  const [content, setContent] = useState<any>(null);

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

  const businessName = content?.businessName || 'Lanka Premier Transport & Vehicle Hire';
  const termsText =
    content?.termsConditionsText ||
    'All vehicle hire requests submitted online are non-binding enquiries until formally reviewed and accepted via an official quotation or confirmed booking agreement. Vehicle dispatch is subject to driver and asset availability, verified identity, and agreed corporate terms.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Commercial Governance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Terms and Conditions</h1>
            <p className="text-sm text-slate-300">
              Terms governing vehicle hire enquiries, quotations, bookings, and corporate service agreements.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs leading-relaxed text-slate-700">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-800 font-medium">{termsText}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">1. Nature of Online Enquiries</h2>
            <p>
              Submission of a quotation request or booking enquiry via this website does not constitute a binding contract or guarantee of vehicle reservation until our operations center conducts physical asset availability checks and issues a signed quotation or confirmed booking reference.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">2. Monthly Hire & Kilometre Allowances</h2>
            <p>
              Monthly vehicle hire agreements are governed by the specific terms stipulated in each formal quotation:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Included mileage is calculated on a calendar month basis (typically 3,000 KM per month).</li>
              <li>Excess mileage beyond the agreed allowance is charged at the contracted extra-km rate.</li>
              <li>Unused kilometres within a billing cycle do not carry over unless expressly agreed in the contract.</li>
              <li>Starting and ending odometer readings recorded on daily running charts are the authoritative record for invoicing.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">3. Driver Working Hours & Overtime</h2>
            <p>
              Drivers operate on standard 8 or 9-hour daily shifts. Driver overtime (OT) charges apply when duty exceeds the agreed shift window. For assignments requiring outstation overnight stays, a standardized driver accommodation and meal allowance will apply.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">4. Invoicing, Payments & Cancellation</h2>
            <p>
              Invoices are issued according to agreed credit terms (e.g. 15 or 30 days from invoice date). Payment receipts are recorded upon verified bank transfer or approved payment instrument. Cancellation of confirmed operational bookings must be made in writing at least 24 hours prior to scheduled dispatch to avoid mobilization charges.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">5. Vehicle Use & Replacement Guarantee</h2>
            <p>
              Vehicles must be operated strictly on authorized roads within Sri Lanka. If a vehicle requires scheduled workshop maintenance or experiences mechanical issues, a replacement vehicle in the same category is provided in accordance with our operational SLA.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
