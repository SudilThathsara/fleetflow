'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

const DEFAULT_TEXT = `All vehicle hire requests submitted online are non-binding enquiries until formally reviewed and accepted via an official quotation or confirmed booking agreement.

Vehicle dispatch is subject to driver and asset availability, verified identity, and agreed corporate terms.

General Terms:

1. Quotation Validity:
All formal quotations issued by our operations team are valid for 7 calendar days from the date of issue unless otherwise specified in writing.

2. Booking Confirmation:
A booking is confirmed only upon receipt of written acceptance of the formal quotation and any required advance payment or purchase order as specified in the agreement.

3. Kilometre Allowances:
Monthly contracts include an agreed kilometre allowance. Kilometres exceeding the agreed threshold are billed at the contracted extra-kilometre rate documented in the signed agreement.

4. Driver Overtime:
Standard driver working hours are as specified in the signed contract. Overtime hours are calculated at agreed rates based on verified daily running chart entries.

5. Cancellation Policy:
Cancellation terms are outlined in individual agreements. Standard terms require 48 hours notice for daily hires and 7 days notice for monthly arrangements.

6. Liability:
Our vehicles are comprehensively insured. The client assumes responsibility for any damage caused through negligent or unauthorised use beyond standard operational conditions.

7. Governing Law:
These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka.`;

export default function TermsPage() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [businessName, setBusinessName] = useState('Lanka Premier Transport');
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.termsConditionsText) setText(d.data.termsConditionsText);
          if (d.data.businessName) setBusinessName(d.data.businessName);
          if (d.data.updatedAt) setUpdatedAt(new Date(d.data.updatedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-12 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
            <Link href="/" className="hover:text-white transition flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
            <span>/</span>
            <span className="text-slate-300">Terms & Conditions</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
              <FileText size={20} className="text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Terms & Conditions</h1>
              <p className="text-xs text-slate-400 mt-0.5">{businessName}{updatedAt && ` · Last updated ${updatedAt}`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sm prose-slate max-w-none">
            {text.split('\n\n').map((para, i) => {
              if (!para.trim()) return null;
              // Numbered section headings
              if (/^\d+\./.test(para) && para.includes(':')) {
                const [heading, ...rest] = para.split('\n');
                return (
                  <div key={i} className="mt-6 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">{heading}</h3>
                    {rest.length > 0 && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{rest.join(' ')}</p>}
                  </div>
                );
              }
              if (para.endsWith(':') && para.length < 80) return <h3 key={i} className="font-bold text-slate-900 text-base mt-6 mb-2">{para}</h3>;
              return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-4">{para}</p>;
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For questions about these Terms, please <Link href="/contact" className="text-sky-600 font-semibold hover:underline">contact us</Link>.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/privacy" className="text-xs font-bold text-sky-600 hover:text-sky-700">Privacy Policy →</Link>
              <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-800">← Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
