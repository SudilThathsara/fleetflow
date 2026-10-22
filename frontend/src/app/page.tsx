'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Car,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  FileText,
  Phone,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  ChevronDown,
  Building2,
  Award,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { QuickEnquiryCard } from '@/components/public/QuickEnquiryCard';

export default function HomePage() {
  const [content, setContent] = useState<any>(null);
  const [fleetHighlights, setFleetHighlights] = useState<any[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    // 1. Fetch website content
    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent(data.data);
        }
      })
      .catch(() => {});

    // 2. Fetch public fleet highlights
    fetch('/api/public/fleet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFleetHighlights(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const headline = content?.heroHeadline || 'Reliable Vehicle Hire & Corporate Transport Solutions';
  const subheadline =
    content?.heroSubheadline ||
    'Premium double cabs, spacious passenger vans, monthly corporate transport, and island-wide vehicle hire services with verified professional drivers.';
  const businessName = content?.businessName || 'Lanka Premier Transport';
  const phone = content?.phone || '+94 11 234 5678 / +94 77 123 4567';
  const whatsappNumber = content?.whatsappNumber || '+94771234567';
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');

  const services = [
    {
      title: 'Monthly Corporate Hire',
      desc: 'Long-term vehicle assignments with transparent monthly billing, agreed kilometre allowances, replacement vehicle guarantee, and professional chauffeurs.',
      icon: Building2,
      href: '/services/monthly-vehicle-hire',
      badge: 'Popular for Companies',
    },
    {
      title: 'Double-Cab Hire (4x4)',
      desc: 'Rugged Toyota Hilux, Mitsubishi L200, and Isuzu D-Max pickups ideal for engineering supervision, construction sites, and rugged terrain across Sri Lanka.',
      icon: Truck,
      href: '/services/double-cab-hire',
      badge: 'Heavy-Duty & 4WD',
    },
    {
      title: 'Passenger Van Hire',
      desc: 'Toyota KDH High Roof, Standard Roof, and Commuter vans with dual AC, spacious luggage compartments, and reclining luxury seats for groups and tours.',
      icon: Users,
      href: '/services/van-hire',
      badge: 'Up to 14 Passengers',
    },
    {
      title: 'Daily & Short-Term Hire',
      desc: 'Flexible daily bookings, 2-day tours, corporate airport transfers, and outstation round trips with punctual, verified professional drivers.',
      icon: Calendar,
      href: '/services/daily-hire',
      badge: 'Flexible Day Hire',
    },
    {
      title: 'Corporate Transport SLAs',
      desc: 'Multi-vehicle contracts, dedicated fleet management, verified running charts, and monthly consolidated VAT invoices for enterprise compliance.',
      icon: Award,
      href: '/corporate-transport',
      badge: 'Annual Agreements',
    },
    {
      title: 'Public Fleet Catalogue',
      desc: 'Browse our publicly approved vehicle models, passenger capacities, air conditioning specifications, and luggage capabilities.',
      icon: Car,
      href: '/fleet',
      badge: 'Verified Fleet',
    },
  ];

  const faqs = content?.faqs?.length
    ? content.faqs
    : [
        {
          question: 'What is included in a monthly vehicle hire contract?',
          answer:
            'Monthly agreements typically include a standard kilometre allowance (e.g. 3,000 km/month), full comprehensive insurance, routine scheduled maintenance, a professional driver (or self-drive options subject to approval), and backup vehicle replacement guarantees.',
        },
        {
          question: 'How do you calculate additional kilometres and overtime charges?',
          answer:
            'Excess kilometres beyond the agreed monthly threshold are billed at the transparent contracted extra-km rate. Driver overtime beyond the standard 8 or 9-hour working window is calculated at agreed hourly overtime rates based on signed daily running charts.',
        },
        {
          question: 'What types of double-cab pickups do you offer?',
          answer:
            'We provide modern 4x4 Toyota Hilux, Mitsubishi L200, and Isuzu D-Max crew-cab pickups ideal for construction supervision, engineering fieldwork, corporate site visits, and rugged terrain transport.',
        },
        {
          question: 'Can corporate clients receive consolidated monthly VAT invoices?',
          answer:
            'Yes. Our corporate accounting engine generates consolidated or per-vehicle invoices itemizing base rental, verified running chart kilometres, driver allowances, and tax schedules on agreed credit payment terms.',
        },
        {
          question: 'How do I request a formal quotation?',
          answer:
            'You can submit your requirements via our online "Request a Quotation" form or contact our corporate desk. Our operations team reviews vehicle availability, calculates customized terms, and delivers an official quotation PDF to your account within 24 hours.',
        },
      ];

  const testimonials = content?.testimonials?.length
    ? content.testimonials
    : [
        {
          author: 'Infrastructure Project Director',
          company: 'Civil Engineering JV, Colombo',
          quote:
            'The double-cab fleet supplied for our highway package has operated reliably with zero downtime. Running charts and monthly invoicing are always transparent and accurate.',
        },
        {
          author: 'Operations Manager',
          company: 'Telecommunications Services Group',
          quote:
            'Outstanding monthly transport service. Drivers are disciplined, vehicles are spotless, and the corporate portal makes invoice tracking effortless.',
        },
      ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* ─── SECTION 1: HERO WITH QUICK ENQUIRY FORM ────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.15),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles size={14} />
                <span>Premier Sri Lankan Fleet Operations</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                {headline}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {subheadline}
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Comprehensive Insurance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Punctual Verified Drivers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>24/7 Breakdown Backup</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/request-quotation"
                  className="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center gap-2 transition"
                >
                  <FileText size={18} />
                  <span>Request a Quotation</span>
                </Link>

                <Link
                  href="/services"
                  className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <span>Explore Our Services</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 transition"
                >
                  <MessageSquare size={17} />
                  <span>WhatsApp Desk</span>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Quick Enquiry Card */}
            <div className="lg:col-span-5">
              <QuickEnquiryCard defaultService="Monthly Vehicle Hire" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: KEY STATS / METRICS ──────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-sky-600">3,000+ KM</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Standard Monthly Contract Packages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Verified Scheduled Maintenance</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">24 / 7</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Operational Dispatch & Backup</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">Island-wide</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Corporate Service Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: CORE SERVICES CATEGORIES ────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-sky-600 tracking-wider uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Our Transport Offerings
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              Comprehensive Vehicle Hire Solutions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From corporate long-term contracts to 4x4 rugged double cabs and spacious passenger vans, discover tailored mobility for your business or tour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition">
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{svc.desc}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
                    >
                      <span>Explore Service Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 & 5: SPOTLIGHT DOUBLE-CAB & VAN ────────────────────── */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Spotlight 1: Double-Cab Pickups */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full">
                4x4 Crew-Cab Transport
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Rugged Double-Cab Pickups for Projects & Site Work
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We supply dependable four-wheel-drive double cabs (Toyota Hilux, Mitsubishi L200, Isuzu D-Max) built for heavy duty applications, civil engineering packages, power plant projects, and demanding topography throughout Sri Lanka.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>5-passenger dual cab comfort with heavy cargo bed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>High ground clearance and selectable 4WD low range</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Available on monthly corporate contracts or short-term project hire</span>
                </li>
              </ul>

              <div className="pt-3 flex items-center gap-4">
                <Link
                  href="/services/double-cab-hire"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition"
                >
                  <span>Double-Cab Details</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/request-quotation"
                  className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition"
                >
                  Request Double-Cab Quote
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-16/10 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"
                  alt="4x4 Double Cab in Sri Lanka"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl text-white text-xs border border-white/10">
                  <p className="font-bold text-sm">4WD Crew Cab Fleet</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">Toyota Hilux / Isuzu D-Max / Mitsubishi L200</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spotlight 2: Passenger Vans */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-5">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full">
                Passenger & Tourism Mobility
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Spacious Passenger Vans for Corporate & Tour Groups
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our fleet of Toyota KDH Commuters and High Roof vans provide the ideal seating capacity (up to 14 passengers) with dual air-conditioning, tinted privacy glass, and ample luggage boot space for airport transfers, corporate delegations, and round-island tourism.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Dual line A/C cooling throughout all passenger rows</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Reclining ergonomic passenger seating with three-point seatbelts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Experienced chauffeurs with tourist board route knowledge</span>
                </li>
              </ul>

              <div className="pt-3 flex items-center gap-4">
                <Link
                  href="/services/van-hire"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition"
                >
                  <span>Passenger Van Details</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/request-quotation"
                  className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition"
                >
                  Request Van Quotation
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-16/10 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000"
                  alt="Passenger Van in Sri Lanka"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl text-white text-xs border border-white/10">
                  <p className="font-bold text-sm">Toyota KDH & Commuter Series</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">High-roof passenger comfort with maximum luggage capacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-sky-400 tracking-wider uppercase bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-black text-white mt-3 tracking-tight">
              How the Booking & Quotation Process Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From online submission to vehicle assignment, experience transparent corporate transport management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white">Submit Request</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Complete our online Quotation Request or Booking form with dates, vehicle type, and service area.
              </p>
            </div>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white">Custom Quotation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Our operations coordinators evaluate availability, contract rates, and extra-km allowances to issue an official quotation.
              </p>
            </div>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white">Vehicle Dispatch</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Upon agreement, vehicles are inspected, assigned, and dispatched with verified professional chauffeurs.
              </p>
            </div>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white">Track & Invoicing</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log into your customer portal to view running chart logs, download formal invoices, and track payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: SERVICE AREAS ACROSS SRI LANKA ─────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full">
                Coverage & Hubs
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Island-wide Transport Service Areas
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our dispatch network maintains primary hubs in Colombo with direct operational coverage spanning Bandaranaike International Airport, Southern Expressway corridors, Central Province, and remote infrastructure project sites.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <MapPin size={16} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Western Province & Colombo Commercial Center</p>
                    <p className="text-slate-500 text-[11px]">Corporate head offices, industrial zones, and daily urban staff transport</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <MapPin size={16} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Katunayake Airport (CMB) Corridor</p>
                    <p className="text-slate-500 text-[11px]">VIP airport pickups, flight crew logistics, and rapid cargo transfers</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <MapPin size={16} className="text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Kandy, Galle & Outstation Projects</p>
                    <p className="text-slate-500 text-[11px]">Southern highway link, tea plantation estates, power plants, and civil works</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-gradient-to-tr from-slate-900 to-sky-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Need Island-wide Project Mobility?</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We specialize in multi-vehicle deployment for turnkey engineering projects, telecommunications site rollouts, and renewable energy installations. All contracts include mandatory vehicle replacement SLAs and dedicated fleet running charts.
                  </p>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <Link
                      href="/corporate-transport"
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md transition"
                    >
                      Corporate Transport Details
                    </Link>
                    <Link
                      href="/contact"
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition"
                    >
                      Contact Our Operations Desk
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: FAQ ACCORDION ───────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              Everything you need to know about vehicle hire conditions, billing, drivers, and contracts.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq: any, idx: number) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-sky-600 transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              View all FAQs and policies →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
              Client Feedback
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              Trusted by Sri Lankan Enterprises
            </h2>
            <p className="text-xs text-slate-600 mt-2">
              Verified experiences from corporate partners and project management teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-xs relative"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {'★'.repeat(t.rating || 5)}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="font-bold text-xs text-slate-900">{t.author}</p>
                  <p className="text-[11px] text-slate-500">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: BOTTOM CALL TO ACTION ─────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-sky-900 via-sky-800 to-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-black tracking-tight">
            Ready to Streamline Your Transport Requirements?
          </h2>
          <p className="text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            Submit an enquiry online or call our corporate desk today. We review your requirements and provide verified vehicle availability with formal quotations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/request-quotation"
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-xl transition"
            >
              Request a Free Quotation
            </Link>
            <Link
              href="/request-booking"
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-xl transition"
            >
              Book a Vehicle Online
            </Link>
            <a
              href={`tel:${phone.split('/')[0]?.trim().replace(/[^0-9+]/g, '')}`}
              className="px-5 py-3.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm border border-white/20 transition flex items-center gap-2"
            >
              <Phone size={16} />
              <span>{phone.split('/')[0]?.trim()}</span>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
