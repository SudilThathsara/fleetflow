'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, MapPin, Phone, Mail, ArrowRight, Shield, Truck,
  Clock, Users, Star, Building2,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function AboutPage() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setContent(d.data); })
      .catch(() => {});
  }, []);

  const c = content || {};
  const businessName = c.businessName || 'Lanka Premier Transport & Vehicle Hire';
  const tagline = c.tagline || 'Reliable Vehicle Hire & Corporate Transport Solutions in Sri Lanka';
  const phone = c.phone || '+94 11 234 5678';
  const email = c.publicEmail || 'inquiries@transportlanka.lk';
  const address = c.address || 'No. 142/B, High Level Road, Nugegoda, Sri Lanka';
  const hours = c.businessHours || 'Monday – Saturday: 7:00 AM – 8:00 PM | 24/7 Dispatch';
  const serviceAreas = c.serviceAreas || ['Colombo & Western Province', 'Bandaranaike Airport (CMB)', 'Kandy & Central Province', 'Galle & Southern Corridor', 'Island-wide Project Sites'];
  const aboutIntro = c.aboutIntro || 'We are an established Sri Lankan passenger and corporate transport solutions provider, delivering reliable, well-maintained double cabs, passenger vans, and tailored long-term fleet contracts for multinational companies, local enterprises, tourism partners, and project teams.';
  const aboutMission = c.aboutMission || 'To deliver dependable, transparent, and safe vehicular mobility across Sri Lanka with rigorously maintained vehicles, verified professional chauffeurs, and predictable corporate billing.';
  const aboutFleetPractices = c.aboutFleetPractices || 'Every vehicle in our fleet undergoes strict scheduled preventative maintenance, computerized tyre and brake checks, and continuous fitness inspections. GPS telemetry and running chart verifications ensure operational transparency.';
  const aboutReliability = c.aboutReliability || 'With dedicated replacement vehicle contingency policies and a 24/7 operations control desk, our clients experience uninterrupted commercial continuity and dependable punctuality.';

  const values = [
    { icon: Shield, title: 'Operational Reliability', desc: aboutReliability },
    { icon: Truck, title: 'Fleet & Maintenance Standards', desc: aboutFleetPractices },
    { icon: Users, title: 'Professional Chauffeurs', desc: 'All drivers are background-verified, licensed, and continuously trained in safe driving practices, client etiquette, and route familiarity across Sri Lanka.' },
    { icon: Building2, title: 'Corporate Billing Transparency', desc: 'Itemised invoices with GPS-verified kilometre readings, agreed contract rates, and structured monthly billing cycles for enterprise compliance.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">About Us</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">{businessName}</h1>
            <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">{tagline}</p>
          </div>
        </div>
      </section>

      {/* Company Intro */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Who We Are</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">About Our Company</h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">{aboutIntro}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/request-quotation"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-2 transition">
                  Request a Quotation <ArrowRight size={14} />
                </Link>
                <Link href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                <Star size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Our Mission</p>
                  <p className="text-xs text-slate-600 mt-1 font-normal leading-relaxed">{aboutMission}</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Phone size={13} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail size={13} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>{email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={13} className="text-sky-600 shrink-0 mt-0.5" />
                  <span>{hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values / Practices */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Our Standards</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">How We Operate</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-sky-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Coverage</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Service Areas Across Sri Lanka</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {serviceAreas.map((area: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin size={16} className="text-sky-600 shrink-0" />
                <span className="text-sm font-semibold text-slate-800">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Partner with {businessName}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">Contact our corporate transport desk to discuss your fleet requirements, request a formal quotation, or arrange a consultation.</p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link href="/request-quotation"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition">
              Request Quotation
            </Link>
            <Link href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
