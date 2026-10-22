'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Phone,
  FileText,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function FAQPage() {
  const [content, setContent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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

  const defaultFaqs = [
    {
      category: 'Monthly Hire',
      question: 'What is included in a standard monthly vehicle hire agreement?',
      answer:
        'Standard monthly agreements include the dedicated vehicle, an agreed monthly kilometre threshold (typically 3,000 KM per month), comprehensive commercial insurance, routine 5,000 km maintenance, replacement vehicle guarantees, and a professional driver (unless authorized corporate self-drive).',
    },
    {
      category: 'Billing & Rates',
      question: 'How are extra kilometres and driver overtime calculated?',
      answer:
        'Running charts are maintained daily with starting and ending odometer readings signed by your designated project officer. Any mileage beyond the monthly 3,000 KM package is billed at the agreed contractual rate per extra kilometre. Driver overtime is calculated based on hours exceeding the agreed 8 or 9-hour daily shift.',
    },
    {
      category: 'Fleet & Pickups',
      question: 'What models of 4x4 double cab pickups are available?',
      answer:
        'We operate modern 4x4 Toyota Hilux, Isuzu D-Max, and Mitsubishi L200 crew-cab pickups with high ground clearance, dual A/C, and heavy duty cargo beds suitable for remote civil engineering and corporate site supervision.',
    },
    {
      category: 'Passenger Vans',
      question: 'What seating capacities are available for passenger vans?',
      answer:
        'Our passenger van fleet includes Toyota KDH standard roof (7–9 passengers with extensive luggage boot) and Toyota KDH Commuter high roof (up to 14 passengers with dual cooling lines and high headroom).',
    },
    {
      category: 'Quotations',
      question: 'How long is an official quotation valid for?',
      answer:
        'Standard quotations are typically valid for 14 to 30 days from date of issue, subject to ongoing vehicle asset availability at the time of final confirmation.',
    },
    {
      category: 'Invoicing & VAT',
      question: 'Can corporate clients receive tax compliant monthly VAT invoices?',
      answer:
        'Yes. All corporate clients receive formal itemized VAT invoices reflecting base rental, verified running chart kilometres, driver overtime, and applicable statutory taxes with standard 15 to 30-day corporate credit payment terms.',
    },
    {
      category: 'Customer Portal',
      question: 'How can I access my quotations, bookings, and invoices online?',
      answer:
        'After registering for a customer account, you can log in to your private Customer Portal (/portal) where you can review quotation requests, download formal quotation PDFs, monitor active bookings, and access historic invoices.',
    },
    {
      category: 'Booking & Cancellations',
      question: 'What is the booking cancellation policy for daily hires?',
      answer:
        'Notice of cancellation provided at least 24 hours prior to scheduled vehicle dispatch is accepted without penalty. Cancellations within 12 hours or after vehicle dispatch may incur a nominal mobilization fee.',
    },
  ];

  const faqs = content?.faqs?.length ? content.faqs : defaultFaqs;

  const categories = ['All', 'Monthly Hire', 'Billing & Rates', 'Fleet & Pickups', 'Passenger Vans', 'Customer Portal'];

  const filteredFaqs = faqs.filter((f: any) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      f.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Fleet & Pickups' && (f.category?.includes('Fleet') || f.category?.includes('Double Cab')));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Find answers regarding corporate hire terms, running charts, billing, driver provisions, and quotation procedures.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics (e.g. kilometre allowances, double cab, invoices, overtime...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-xs"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-3 pt-2">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No questions found matching your search. Try another query or contact our operations desk.
              </div>
            ) : (
              filteredFaqs.map((faq: any, idx: number) => {
                const isOpen = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-sky-600 transition cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-sky-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still have questions */}
          <div className="p-8 bg-slate-900 text-white rounded-3xl text-center space-y-4">
            <HelpCircle size={32} className="text-sky-400 mx-auto" />
            <h3 className="text-lg font-bold">Have a Specific Operational Question?</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Our operations coordinators can explain agreement clauses, rate structures, and vehicle allocations for your company.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Contact Support Desk
              </Link>
              <Link
                href="/request-quotation"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition"
              >
                Request Quotation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
