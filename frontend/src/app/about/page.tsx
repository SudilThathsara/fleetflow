'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Truck,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Building,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function AboutPage() {
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
  const aboutIntro =
    content?.aboutIntro ||
    'We are an established Sri Lankan passenger and corporate transport solutions provider, delivering reliable, well-maintained double cabs, passenger vans, and tailored long-term fleet contracts for multinational companies, local enterprises, tourism partners, and project teams.';
  const aboutMission =
    content?.aboutMission ||
    'To deliver dependable, transparent, and safe vehicular mobility across Sri Lanka with rigorously maintained vehicles, verified professional chauffeurs, and predictable corporate billing.';
  const aboutFleetPractices =
    content?.aboutFleetPractices ||
    'Every vehicle in our fleet undergoes strict scheduled preventative maintenance, computerized tyre and brake checks, and continuous fitness inspections. GPS telemetry and running chart verifications ensure operational transparency.';
  const aboutReliability =
    content?.aboutReliability ||
    'With dedicated replacement vehicle contingency policies and a 24/7 operations control desk, our clients experience uninterrupted commercial continuity and dependable punctuality.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Company Profile
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">About {businessName}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Professional transport services, transparent fleet management, and dedicated vehicle hire solutions throughout Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Intro & Mission */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Operational Philosophy & Mission
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{aboutIntro}</p>

              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-sky-600 space-y-2">
                <h3 className="font-bold text-sm text-slate-900">Our Mission</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{aboutMission}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Clock className="text-sky-600 mb-2" size={20} />
                  <h4 className="font-bold text-xs text-slate-900">Punctual & Reliable</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Strict adherence to daily reporting schedules and route planning.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <ShieldCheck className="text-emerald-600 mb-2" size={20} />
                  <h4 className="font-bold text-xs text-slate-900">Commercial Safety</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Comprehensive passenger and vehicle insurance coverage.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-4/3 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
                  alt="Transport Fleet Operations"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet & Driver Practices */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fleet Maintenance & Driver Standards
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              We operate an integrated maintenance and driver management system to ensure vehicle safety and service consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Preventative Maintenance Policy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{aboutFleetPractices}</p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Routine 5,000 km oil and filter service intervals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Documented running chart odometer tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Backup replacement guarantee within 4 hours in Western Province</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Verified Chauffeurs & Conduct</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{aboutReliability}</p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Background verified, commercial driving license holders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Professional uniform attire and courteous passenger etiquette</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Trained on expressway safety protocols and regional tour routes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Discuss Your Corporate Transport Needs</h2>
          <p className="text-xs text-slate-600">
            Our corporate transport desk is available to tailor annual agreements, monthly double-cab allocations, or tour itineraries.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/request-quotation"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Request a Quotation
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
