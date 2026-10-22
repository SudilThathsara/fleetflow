'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Users,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  Award,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function ServicesPage() {
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

  const servicesList = [
    {
      id: 'monthly-vehicle-hire',
      title: 'Monthly Vehicle Hire',
      category: 'Corporate & Long-Term',
      desc: 'Dedicated vehicle allocation on transparent monthly contracts. Includes standard 3,000 KM allowance, routine servicing, replacement vehicle guarantee, and verified driver options.',
      icon: Building2,
      href: '/services/monthly-vehicle-hire',
      enabled: content?.servicesEnabled?.monthlyHire ?? true,
      features: ['3,000 Included Monthly KM', 'Full Comprehensive Insurance', 'Scheduled Routine Maintenance', 'Backup Vehicle Guarantee'],
    },
    {
      id: 'double-cab-hire',
      title: 'Double-Cab Hire (4x4)',
      category: 'Heavy-Duty & Site Transport',
      desc: 'Rugged Toyota Hilux, Mitsubishi L200, and Isuzu D-Max pickups with high ground clearance and selectable 4WD. Engineered for infrastructure construction, civil sites, and rough roads.',
      icon: Truck,
      href: '/services/double-cab-hire',
      enabled: content?.servicesEnabled?.doubleCabHire ?? true,
      features: ['5-Passenger Double Cab', 'Heavy Payload Cargo Bed', 'Selectable 4WD Low Range', 'Monthly & Project Hire'],
    },
    {
      id: 'van-hire',
      title: 'Passenger Van Hire',
      category: 'Group & Tourism Transport',
      desc: 'Toyota KDH Commuter and High Roof vans with dual air conditioning, reclining luxury seating, and generous luggage storage. Perfect for corporate delegations, family tours, and airport transfers.',
      icon: Users,
      href: '/services/van-hire',
      enabled: content?.servicesEnabled?.vanHire ?? true,
      features: ['Up to 14 Passengers', 'Dual Air Conditioning', 'Large Luggage Boot', 'Tourist Chauffeur Chaperone'],
    },
    {
      id: 'daily-hire',
      title: 'Daily & Short-Term Hire',
      category: 'Flexible Trips & Day Hires',
      desc: 'Flexible daily bookings, 2-day outstation tours, Colombo city corporate visits, and airport transfers with professional drivers. Clear daily kilometre policies and transparent overtime billing.',
      icon: Calendar,
      href: '/services/daily-hire',
      enabled: content?.servicesEnabled?.dailyHire ?? true,
      features: ['Daily 100/150 KM Base', 'Dedicated Professional Driver', 'Colombo & Outstation Trips', 'Online Booking Enquiry'],
    },
    {
      id: 'corporate-transport',
      title: 'Corporate Transport SLAs',
      category: 'Enterprise Fleets',
      desc: 'Multi-vehicle corporate fleet management with annual agreements, consolidated monthly VAT billing, automated running charts, and designated account management.',
      icon: Award,
      href: '/corporate-transport',
      enabled: content?.servicesEnabled?.corporateHire ?? true,
      features: ['Annual Master Service Agreements', 'Consolidated VAT Invoices', 'Running Chart Telemetry', 'Driver Overtime Governance'],
    },
    {
      id: 'public-fleet',
      title: 'Approved Public Fleet',
      category: 'Fleet Catalogue',
      desc: 'Explore our publicly approved vehicle models, seating capacities, air conditioning systems, and passenger specifications.',
      icon: Car,
      href: '/fleet',
      enabled: true,
      features: ['Approved Models', 'Sanitized Public Specs', 'Seating & Luggage Guidance', 'Direct Availability Check'],
    },
  ];

  const visibleServices = servicesList.filter((s) => s.enabled);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Transport Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Our Transport Services</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tailored vehicle hire and fleet operations for corporations, infrastructure teams, tourism delegations, and private clients across Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-100/60 px-2.5 py-1 rounded-full">
                        {svc.category}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                      {svc.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{svc.desc}</p>

                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Key Features:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {svc.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
                    >
                      <span>Service Details</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      href="/request-quotation"
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                      Quote →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h3 className="text-xl font-bold">Require a Custom Vehicle Package?</h3>
          <p className="text-xs text-slate-300">
            Tell us your project scope, monthly distance requirements, or multi-vehicle fleet requirements. We will prepare an itemized corporate proposal.
          </p>
          <div className="pt-2">
            <Link
              href="/request-quotation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Submit Quotation Request</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
