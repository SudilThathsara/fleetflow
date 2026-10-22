'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const [content, setContent] = useState({
    businessName: 'Lanka Premier Transport & Vehicle Hire',
    tagline: 'Reliable Vehicle Hire & Corporate Transport Solutions in Sri Lanka',
    phone: '+94 11 234 5678 / +94 77 123 4567',
    whatsappNumber: '+94771234567',
    publicEmail: 'inquiries@transportlanka.lk',
    address: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka',
    businessHours: 'Monday - Saturday: 7:00 AM – 8:00 PM | 24/7 Roadside Assistance',
    brNumberPlaceholder: 'PV-98765/2024 (Registered Transport Provider)',
  });

  useEffect(() => {
    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent({
            businessName: data.data.businessName || content.businessName,
            tagline: data.data.tagline || content.tagline,
            phone: data.data.phone || content.phone,
            whatsappNumber: data.data.whatsappNumber || content.whatsappNumber,
            publicEmail: data.data.publicEmail || content.publicEmail,
            address: data.data.address || content.address,
            businessHours: data.data.businessHours || content.businessHours,
            brNumberPlaceholder: data.data.brNumberPlaceholder || content.brNumberPlaceholder,
          });
        }
      })
      .catch(() => {});
  }, []);

  const cleanWhatsApp = content.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Truck size={22} />
              </div>
              <span className="font-bold text-white text-base leading-tight">
                {content.businessName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {content.tagline}. High-performing double-cab pickups, passenger vans, and long-term corporate vehicle contracts across Sri Lanka.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                {content.brNumberPlaceholder}
              </span>
            </div>
          </div>

          {/* Column 2: Vehicle & Transport Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-sky-500 pl-2.5">
              Transport Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/services/monthly-vehicle-hire" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Monthly Corporate Vehicle Hire</span>
                </Link>
              </li>
              <li>
                <Link href="/services/double-cab-hire" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Double-Cab 4x4 Pickup Hire</span>
                </Link>
              </li>
              <li>
                <Link href="/services/van-hire" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Passenger & Tourism Van Hire</span>
                </Link>
              </li>
              <li>
                <Link href="/services/daily-hire" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Daily & Short-Term Hire</span>
                </Link>
              </li>
              <li>
                <Link href="/corporate-transport" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Project & Industrial Fleet Solutions</span>
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-sky-400 transition flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-sky-500" />
                  <span>Approved Public Fleet Catalogue</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Customer Portal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-sky-500 pl-2.5">
              Customer & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/request-quotation" className="hover:text-sky-400 transition">
                  • Request a Quotation
                </Link>
              </li>
              <li>
                <Link href="/request-booking" className="hover:text-sky-400 transition">
                  • Book a Vehicle
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-400 transition">
                  • Customer Portal Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-sky-400 transition">
                  • Register Customer Account
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-sky-400 transition">
                  • Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-400 transition">
                  • Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-sky-400 transition">
                  • Terms & Hire Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Operating Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-sky-500 pl-2.5">
              Contact & Dispatch
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-sky-400 shrink-0 mt-0.5" />
                <span>{content.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-sky-400 shrink-0" />
                <span>{content.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-sky-400 shrink-0" />
                <span>{content.publicEmail}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={15} className="text-sky-400 shrink-0 mt-0.5" />
                <span>{content.businessHours}</span>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition"
                >
                  <MessageSquare size={14} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {content.businessName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Full Operational Privacy & Data Protection</span>
            </span>
            <Link href="/privacy" className="hover:text-slate-400 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
