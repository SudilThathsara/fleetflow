'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

const DEFAULT_TEXT = `This Privacy Policy outlines how our transport service collects, uses, and safeguards information provided when requesting quotations, booking vehicles, or accessing the customer portal.

We do not sell personal information to third parties. Data is used strictly for operational logistics, booking fulfilment, and corporate invoicing.

Information We Collect:
We collect information you provide directly, including name, contact details, vehicle requirements, and payment information when you submit enquiries, register an account, or make bookings.

How We Use Your Information:
- To process vehicle hire requests and issue formal quotations
- To manage bookings, running charts, and monthly invoicing
- To communicate service updates and operational notifications
- To comply with legal and regulatory obligations

Data Retention:
Customer data is retained for the duration of the contractual relationship and as required by Sri Lankan commercial and tax regulations.

Contact:
For privacy-related enquiries, please contact our operations team.`;

export default function PrivacyPage() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [businessName, setBusinessName] = useState('Tourism & Transport');
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.privacyPolicyText) setText(d.data.privacyPolicyText);
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-4">
            <Link href="/" className="hover:text-white transition flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
            <span>/</span>
            <span className="text-slate-300">Privacy Policy</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
              <Shield size={24} className="text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-400 mt-1">{businessName}{updatedAt && ` · Last updated ${updatedAt}`}</p>
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
              const isHeading = para.endsWith(':') && para.length < 60;
              if (isHeading) return <h3 key={i} className="font-bold text-slate-900 text-base mt-6 mb-2">{para}</h3>;
              if (para.startsWith('- ')) {
                const items = para.split('\n').filter((l) => l.startsWith('- '));
                return (
                  <ul key={i} className="list-disc list-inside space-y-1 mb-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-sm text-slate-600">{item.slice(2)}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-4">{para}</p>;
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              For questions about this Privacy Policy, please <Link href="/contact" className="text-sky-600 font-semibold hover:underline">contact us</Link>.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/terms" className="text-xs font-bold text-sky-600 hover:text-sky-700">Terms & Conditions →</Link>
              <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-800">← Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
