'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PrivacyPage() {
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
  const privacyText =
    content?.privacyPolicyText ||
    'This Privacy Policy outlines how our transport service collects, uses, and safeguards information provided when requesting quotations, booking vehicles, or accessing the customer portal. We do not sell personal information to third parties. Data is used strictly for operational logistics, booking fulfilment, and corporate invoicing.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Legal & Privacy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-slate-300">
              How we collect, manage, and safeguard your account and operational transport data.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs leading-relaxed text-slate-700">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-800 font-medium">{privacyText}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you submit a quotation request, book a vehicle, or create a customer account on {businessName}, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact details: name, corporate organization, phone numbers, and email address.</li>
              <li>Operational trip data: pickup points, destination routes, dates, and vehicle preferences.</li>
              <li>Customer company memberships and billing addresses for corporate invoices.</li>
              <li>Digital running chart verification signatures and odometer readings for active contracts.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">2. How Your Information is Used</h2>
            <p>
              We process customer data solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prepare and issue formal quotations and contracts.</li>
              <li>Coordinate vehicle dispatch and chauffeur assignments.</li>
              <li>Reconcile verified running charts and generate monthly billing statements.</li>
              <li>Maintain vehicle maintenance logs and insurance compliance records.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">3. Confidentiality & Security</h2>
            <p>
              Passwords are cryptographically hashed using industry-standard bcrypt algorithms. We enforce strict server-side authorization boundaries: external customers can only view their own quotations, bookings, and invoices. Internal operational logs, GPS tracking coordinates, and private maintenance records are never exposed to unauthorized parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">4. Contacting Our Data Officer</h2>
            <p>
              If you have inquiries regarding your account data, corporate profile, or wish to request data erasure, please contact our administrative desk at{' '}
              <a href={`mailto:${content?.publicEmail || 'inquiries@transportlanka.lk'}`} className="text-sky-600 underline">
                {content?.publicEmail || 'inquiries@transportlanka.lk'}
              </a>.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
