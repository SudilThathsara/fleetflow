'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck, Car, Shield, Clock, MapPin, CheckCircle2, ArrowRight,
  FileText, Phone, MessageSquare, Users, Calendar, Sparkles,
  ChevronDown, Building2, Award, Star, ChevronRight,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { QuickEnquiryCard } from '@/components/public/QuickEnquiryCard';

export default function HomePage() {
  const [content, setContent] = useState<any>(null);
  const [fleet, setFleet] = useState<any[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setContent(d.data); })
      .catch(() => {});

    fetch('/api/public/fleet')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setFleet(d.data.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const c = content || {};
  const svc = c.servicesEnabled || {};
  const headline = c.heroHeadline || 'Reliable Vehicle Hire & Corporate Transport Solutions';
  const subheadline = c.heroSubheadline || 'Premium double cabs, spacious passenger vans, monthly corporate transport, and island-wide vehicle hire services with verified professional drivers.';
  const businessName = c.businessName || 'Tourism & Transport';
  const phone = c.phone || '+94 11 234 5678';
  const whatsapp = c.whatsappNumber || '+94771234567';
  const heroImg = c.heroImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600';
  const cleanWA = whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = phone.split('/')[0].trim().replace(/[^0-9+]/g, '');

  const faqs = c.faqs || [
    { question: 'What is included in a monthly vehicle hire contract?', answer: 'Monthly agreements typically include a standard kilometre allowance, full comprehensive insurance, routine scheduled maintenance, a professional driver, and backup vehicle replacement guarantees.', category: 'Monthly Hire' },
    { question: 'How do additional kilometres and overtime charges work?', answer: 'Excess kilometres beyond the agreed monthly threshold are billed at the contracted extra-km rate. Driver overtime is calculated at agreed hourly rates based on signed daily running charts.', category: 'Billing & Rates' },
    { question: 'How do I request a formal quotation?', answer: 'Submit your requirements via our online "Request a Quotation" form. Our operations team reviews availability and delivers an official quotation PDF to your account within 24 hours.', category: 'Quotations' },
  ];

  const testimonials = (c.testimonials || []).filter((t: any) => t.isVerified);

  const serviceCards = [
    svc.monthlyHire !== false && {
      title: 'Monthly Corporate Hire', icon: Building2, href: '/services/monthly-vehicle-hire', badge: 'Most Popular',
      desc: 'Long-term vehicle assignments with transparent monthly billing, agreed kilometre allowances, and professional chauffeurs.',
    },
    svc.doubleCabHire !== false && {
      title: 'Double-Cab Hire (4×4)', icon: Truck, href: '/services/double-cab-hire', badge: 'Heavy-Duty',
      desc: 'Toyota Hilux, Mitsubishi L200 — ideal for engineering supervision, construction sites, and rugged terrain.',
    },
    svc.vanHire !== false && {
      title: 'Passenger Van Hire', icon: Users, href: '/services/van-hire', badge: 'Up to 14 Seats',
      desc: 'Toyota KDH High Roof and Commuter vans with dual AC, ample luggage space, and reclining seats.',
    },
    svc.dailyHire !== false && {
      title: 'Daily & Short-Term Hire', icon: Calendar, href: '/services/daily-hire', badge: 'Flexible',
      desc: 'Flexible daily bookings, airport transfers, and outstation round trips with verified professional drivers.',
    },
    svc.corporateHire !== false && {
      title: 'Corporate Transport SLAs', icon: Award, href: '/corporate-transport', badge: 'Enterprise',
      desc: 'Multi-vehicle contracts, dedicated fleet management, and monthly consolidated VAT invoices.',
    },
    {
      title: 'View Full Fleet Catalogue', icon: Car, href: '/fleet', badge: 'All Vehicles',
      desc: 'Browse our approved fleet of fully maintained vehicles available for hire across Sri Lanka.',
    },
  ].filter(Boolean) as { title: string; icon: React.ElementType; href: string; badge: string; desc: string }[];

  const serviceAreas = c.serviceAreas?.length
    ? c.serviceAreas
    : ['Colombo & Western Province', 'Bandaranaike Airport (CMB)', 'Kandy & Central Province', 'Galle & Southern Corridor', 'Island-wide Project Sites'];

  const steps = [
    { n: '01', title: 'Submit Request', desc: 'Fill our online Quotation or Booking form with your dates, vehicle type, and service area.', color: 'bg-sky-600' },
    { n: '02', title: 'Custom Quotation', desc: 'Our coordinators evaluate availability and issue an official quotation within 24 hours.', color: 'bg-sky-600' },
    { n: '03', title: 'Vehicle Dispatch', desc: 'Upon agreement, vehicles are inspected, assigned, and dispatched with verified chauffeurs.', color: 'bg-sky-600' },
    { n: '04', title: 'Track & Invoice', desc: 'Log into your portal to view running charts, download invoices, and track payments.', color: 'bg-emerald-600' },
  ];

  const advantages = [
    { icon: Shield, title: 'Commercially Insured', desc: 'Comprehensive vehicle insurance and driver liability coverage on every assignment.' },
    { icon: CheckCircle2, title: 'Verified Chauffeurs', desc: 'Background-checked, licensed drivers with professional safety records.' },
    { icon: Clock, title: '24/7 Dispatch Support', desc: 'Round-the-clock operations desk for emergencies and last-minute requirements.' },
    { icon: Sparkles, title: 'Transparent Billing', desc: 'Itemised invoices with verified odometer readings and agreed contract rates.' },
    { icon: MapPin, title: 'Island-wide Coverage', desc: 'Fleet operations spanning Colombo, airport corridors, provinces, and project sites.' },
    { icon: FileText, title: 'Running Chart Accuracy', desc: 'Digital GPS-verified running charts for precise kilometre and overtime billing.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] sm:min-h-[85vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-slate-950">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Fleet vehicle in Sri Lanka"
            className={`w-full h-full object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-40' : 'opacity-0'}`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="lg:col-span-7 text-white space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {headline.split(' ').slice(0, 3).join(' ')}{' '}
                <span className="text-sky-400">{headline.split(' ').slice(3).join(' ')}</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">{subheadline}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/request-quotation"
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-sky-900/40 transition">
                  <FileText size={16} /> Request a Quotation
                </Link>
                <Link href="/services"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center gap-2 border border-white/20 transition backdrop-blur-sm">
                  Explore Services <ChevronRight size={16} />
                </Link>
              </div>

              {/* Quick trust badges */}
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
                {['Commercially Insured', 'Verified Drivers', '24/7 Dispatch', 'Island-wide Coverage'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" /> {b}
                  </span>
                ))}
              </div>

              {/* Contact quick links */}
              <div className="flex flex-wrap gap-4 text-xs">
                <a href={`tel:${cleanPhone}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white transition">
                  <Phone size={13} className="text-sky-400" /> {phone.split('/')[0].trim()}
                </a>
                <a href={`https://wa.me/${cleanWA}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <MessageSquare size={13} /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Quick enquiry card */}
            <div className="lg:col-span-5">
              <QuickEnquiryCard />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500 animate-bounce hidden sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Scroll</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ─── SERVICES GRID ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">What We Offer</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Complete Vehicle Hire & Transport Services</h2>
            <p className="text-sm text-slate-600 mt-2">Professional, reliable, and fully insured vehicle hire solutions for corporate clients, projects, and daily needs across Sri Lanka.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCards.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.href + s.title} href={s.href}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:bg-sky-600 group-hover:border-sky-600 transition-all">
                      <Icon size={22} className="text-sky-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">{s.badge}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sky-600 font-bold text-xs group-hover:gap-2 transition-all">
                    <span>Learn More</span> <ArrowRight size={13} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ADVANTAGES ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Why Choose Us</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Built for Corporate Reliability</h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Every vehicle, driver, and billing process at {businessName} is designed around operational transparency, contractual clarity, and uninterrupted service delivery.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/about" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition">About Our Operations</Link>
                <Link href="/corporate-transport" className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-sm transition">Corporate Contracts</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advantages.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-sky-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{a.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── DOUBLE-CAB FEATURE ────────────────────────────────────── */}
      {svc.doubleCabHire !== false && (
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-video bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000"
                  alt="Double-Cab 4x4 Pickup"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl text-white border border-white/10">
                  <p className="font-bold text-sm">Toyota Hilux · Mitsubishi L200 · Isuzu D-Max</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">4WD crew-cab pickups for engineering and site work</p>
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Double-Cab Hire</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4×4 Pickups for Engineering & Construction</h2>
                <p className="text-sm text-slate-600 leading-relaxed">Rugged double-cab 4WD pickups ideal for civil engineering supervision, construction project coordination, NGO field work, and remote terrain transport across Sri Lanka's provinces.</p>
                <ul className="space-y-2 text-xs text-slate-700">
                  {['Crew-cab seating — up to 5 passengers + load bed', 'Full 4-wheel drive on rocky and steep terrain', 'Available with or without driver (subject to approval)', 'Daily, weekly, and monthly hire terms available', 'Commercial liability insurance included'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/services/double-cab-hire" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition">
                    Double-Cab Details <ArrowRight size={13} />
                  </Link>
                  <Link href="/request-quotation" className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition">
                    Get a Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── VAN HIRE FEATURE ──────────────────────────────────────── */}
      {svc.vanHire !== false && (
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4 lg:order-1">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Passenger Van Hire</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Toyota KDH & Commuter Vans — Up to 14 Passengers</h2>
                <p className="text-sm text-slate-600 leading-relaxed">High-roof Toyota KDH passenger vans with dual air conditioning, reclining luxury seats, and generous overhead luggage racks — ideal for corporate outstation trips, airport transfers, and tourism groups.</p>
                <ul className="space-y-2 text-xs text-slate-700">
                  {['Dual front & rear air conditioning for maximum comfort', 'Reclining seats with individual headrests', 'Large overhead luggage racks + boot space', 'Door-to-door pickup and drop service available', 'Experienced chauffeurs with route knowledge across Sri Lanka'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/services/van-hire" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition">
                    Van Hire Details <ArrowRight size={13} />
                  </Link>
                  <Link href="/request-quotation" className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition">
                    Request Van Quote
                  </Link>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-video bg-slate-800 lg:order-2">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000"
                  alt="Passenger Van"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl text-white border border-white/10">
                  <p className="font-bold text-sm">Toyota KDH & Commuter Series</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">High-roof passenger comfort with maximum luggage capacity</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-400 tracking-wider uppercase bg-sky-950 px-3 py-1 rounded-full border border-sky-800">Simple & Transparent</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">How the Booking & Quotation Process Works</h2>
            <p className="text-sm text-slate-400 mt-2">From online submission to vehicle assignment — fully transparent corporate transport management.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 relative">
                <div className={`w-10 h-10 rounded-xl ${s.color} text-white font-black flex items-center justify-center text-sm mb-4`}>{s.n}</div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2.5 text-slate-700">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/request-quotation"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-900/40 transition">
              Start Your Quotation Request <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SERVICE AREAS ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Coverage & Hubs</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Island-wide Transport Service Areas</h2>
              <p className="text-sm text-slate-600 leading-relaxed">Our dispatch network maintains primary hubs in Colombo with direct operational coverage spanning Bandaranaike International Airport, Southern Expressway corridors, Central Province, and remote infrastructure project sites.</p>
              <div className="space-y-2 pt-2">
                {serviceAreas.map((area: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <MapPin size={15} className="text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-tr from-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
              <h3 className="text-xl font-bold mb-3">Need Island-wide Project Mobility?</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">We specialise in multi-vehicle deployment for turnkey engineering projects, telecommunications rollouts, and renewable energy installations. All contracts include mandatory vehicle replacement SLAs and dedicated fleet running charts.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/corporate-transport"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md transition">
                  Corporate Transport Details
                </Link>
                <Link href="/contact"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition">
                  Contact Our Ops Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FLEET HIGHLIGHTS ──────────────────────────────────────── */}
      {fleet.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Available Fleet</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Approved Vehicles for Hire</h2>
              </div>
              <Link href="/fleet" className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 shrink-0">
                View Full Fleet <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {fleet.map((v: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition group">
                  <div className="h-44 bg-slate-100 overflow-hidden">
                    {v.publicPhotos?.[0] ? (
                      <img src={v.publicPhotos[0]} alt={v.make} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Truck size={40} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-slate-900">{v.make} {v.model} {v.year}</p>
                    <p className="text-xs text-slate-500 mt-1">{v.publicDescription || v.bodyType}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(v.publicFeatures || []).slice(0, 3).map((f: string) => (
                        <span key={f} className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-semibold">{f}</span>
                      ))}
                    </div>
                    <Link href="/request-quotation"
                      className="mt-4 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition">
                      Request Hire Quote <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ACCORDION ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-600 mt-2">Everything you need to know about vehicle hire conditions, billing, drivers, and contracts.</p>
          </div>
          <div className="space-y-3">
            {faqs.slice(0, 5).map((faq: any, idx: number) => {
              const open = expandedFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(open ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-sky-600 transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180 text-sky-600' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-sm font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
              View all FAQs <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Client Feedback</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">Trusted by Sri Lankan Enterprises</h2>
              <p className="text-xs text-slate-600 mt-2">Verified experiences from corporate partners and project management teams.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t: any, idx: number) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                    {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="font-bold text-sm text-slate-900">{t.author}</p>
                    {t.company && <p className="text-xs text-slate-500 mt-0.5">{t.company}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-sky-900 via-sky-800 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ready to Streamline Your Transport Requirements?</h2>
          <p className="text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            Submit an enquiry online or call our corporate desk. We review your requirements and provide verified vehicle availability with formal quotations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/request-quotation"
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-xl transition">
              Request a Free Quotation
            </Link>
            <Link href="/request-booking"
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-xl transition">
              Book a Vehicle Online
            </Link>
            <a href={`tel:${cleanPhone}`}
              className="px-5 py-3.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm border border-white/20 flex items-center gap-2 transition">
              <Phone size={16} /> {phone.split('/')[0].trim()}
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
