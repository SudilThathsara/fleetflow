'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, ChevronRight } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

const DEFAULT_FAQS = [
  { question: 'What is included in a monthly vehicle hire contract?', answer: 'Monthly agreements typically include a standard kilometre allowance (e.g. 3,000 km/month), full comprehensive insurance, routine scheduled maintenance, a professional driver, and backup vehicle replacement guarantees.', category: 'Monthly Hire' },
  { question: 'How do you calculate additional kilometres and overtime charges?', answer: 'Excess kilometres beyond the agreed monthly threshold are billed at the contracted extra-km rate. Driver overtime beyond the standard working window is calculated at agreed hourly overtime rates based on signed daily running charts.', category: 'Billing & Rates' },
  { question: 'What types of double-cab pickups do you offer?', answer: 'We provide modern 4x4 Toyota Hilux, Mitsubishi L200, and Isuzu D-Max crew-cab pickups ideal for construction supervision, engineering fieldwork, and rugged terrain transport.', category: 'Fleet & Vehicles' },
  { question: 'Can corporate clients receive consolidated monthly VAT invoices?', answer: 'Yes. Our accounting engine generates consolidated or per-vehicle invoices itemizing base rental, verified running chart kilometres, driver allowances, and tax schedules on agreed credit payment terms.', category: 'Corporate Invoicing' },
  { question: 'How do I request a formal quotation?', answer: 'Submit your requirements via our online "Request a Quotation" form. Our operations team reviews vehicle availability, calculates customised terms, and delivers an official quotation PDF to your account within 24 hours.', category: 'Quotations' },
  { question: 'Are your drivers background-checked and licensed?', answer: 'Yes. All chauffeurs are rigorously background-verified, hold valid commercial driving licences, and undergo continuous training in professional driving standards and client service etiquette.', category: 'Drivers' },
  { question: 'Do you provide vehicles for tourism and group travel?', answer: 'Yes. We offer Toyota KDH passenger vans and other suitable vehicles for tourism groups, cultural tours, airport transfers, and intercity travel with experienced route-familiar drivers.', category: 'Tourism & Travel' },
  { question: 'What happens if a vehicle breaks down mid-contract?', answer: 'All our monthly contracts include a mandatory replacement vehicle guarantee. In the event of a mechanical issue, a replacement vehicle is dispatched from our contingency fleet to minimise operational disruption.', category: 'Reliability' },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data?.faqs?.length) setFaqs(d.data.faqs); })
      .catch(() => {});
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((f: any) => f.category).filter(Boolean)))];

  const filtered = faqs.filter((f: any) => {
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">FAQs</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm text-slate-300 mt-3">Everything you need to know about vehicle hire conditions, billing, drivers, and contracts.</p>

          {/* Search */}
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setExpanded(null); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-[68px] z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setExpanded(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-bold">No questions found</p>
              <p className="text-sm mt-1">Try a different search term or category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq: any, idx: number) => {
                const open = expanded === idx;
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      onClick={() => setExpanded(open ? null : idx)}
                      className="w-full p-5 text-left flex items-start justify-between gap-4 hover:text-sky-600 transition cursor-pointer"
                    >
                      <div className="flex-1">
                        {faq.category && (
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full mr-2">{faq.category}</span>
                        )}
                        <span className="font-bold text-sm text-slate-800">{faq.question}</span>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 mt-0.5 ${open ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <p className="font-bold text-slate-900 text-lg">Still have questions?</p>
            <p className="text-sm text-slate-600 mt-1">Our operations team is happy to help with any enquiries.</p>
            <div className="flex flex-wrap gap-3 justify-center mt-5">
              <Link href="/contact"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition">
                Contact Us
              </Link>
              <Link href="/request-quotation"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition flex items-center gap-1.5">
                Get a Quotation <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
