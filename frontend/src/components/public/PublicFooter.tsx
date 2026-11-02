'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck, Phone, Mail, MapPin, Clock, MessageSquare,
  Globe, Globe2, Link2, ExternalLink, Share2, Video,
  ArrowRight, Shield,
} from 'lucide-react';

interface SiteContent {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  publicEmail: string;
  address: string;
  businessHours: string;
  brNumberPlaceholder: string;
  logoUrl: string;
  socialLinks: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string; whatsapp?: string };
  servicesEnabled: { monthlyHire?: boolean; doubleCabHire?: boolean; vanHire?: boolean; dailyHire?: boolean; corporateHire?: boolean; tourismTravel?: boolean; projectTransport?: boolean };
}

const DEF: SiteContent = {
  businessName: 'Tourism & Transport',
  tagline: 'Professional Fleet & Operational Management',
  phone: '+94 11 234 5678 / +94 77 123 4567',
  whatsappNumber: '+94771234567',
  publicEmail: 'inquiries@transportlanka.lk',
  address: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka',
  businessHours: 'Monday – Saturday: 7:00 AM – 8:00 PM | 24/7 Roadside Assistance & Dispatch',
  brNumberPlaceholder: 'PV-98765/2024',
  logoUrl: '',
  socialLinks: {},
  servicesEnabled: { monthlyHire: true, doubleCabHire: true, vanHire: true, dailyHire: true, corporateHire: true },
};

export const PublicFooter: React.FC = () => {
  const [c, setC] = useState<SiteContent>(DEF);

  useEffect(() => {
    // Check localStorage cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setC((prev) => ({
            ...prev,
            businessName: parsed.companyName || prev.businessName,
            tagline: parsed.tagline || prev.tagline,
            logoUrl: parsed.logoUrl !== undefined ? parsed.logoUrl : prev.logoUrl,
          }));
        } catch {}
      }
    }

    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setC({ ...DEF, ...d.data }); })
      .catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setC((prev) => ({
          ...prev,
          businessName: e.detail.companyName || prev.businessName,
          tagline: e.detail.tagline || prev.tagline,
          logoUrl: e.detail.logoUrl !== undefined ? e.detail.logoUrl : prev.logoUrl,
          phone: e.detail.phone || prev.phone,
          whatsappNumber: e.detail.whatsappNumber || prev.whatsappNumber,
          publicEmail: e.detail.publicEmail || prev.publicEmail,
          address: e.detail.address || prev.address,
          businessHours: e.detail.businessHours || prev.businessHours,
          brNumberPlaceholder: e.detail.brNumberPlaceholder || prev.brNumberPlaceholder,
          socialLinks: e.detail.socialLinks || prev.socialLinks,
          servicesEnabled: e.detail.servicesEnabled || prev.servicesEnabled,
        }));
      }
    };
    window.addEventListener('fleetflow:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleSettingsUpdate);
  }, []);

  const cleanWA = c.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = c.phone.split('/')[0].trim().replace(/[^0-9+]/g, '');

  const serviceLinks = [
    c.servicesEnabled.monthlyHire && { label: 'Monthly Corporate Hire', href: '/services/monthly-vehicle-hire' },
    c.servicesEnabled.doubleCabHire && { label: 'Double-Cab Hire (4×4)', href: '/services/double-cab-hire' },
    c.servicesEnabled.vanHire && { label: 'Passenger Van Hire', href: '/services/van-hire' },
    c.servicesEnabled.dailyHire && { label: 'Daily & Short-Term Hire', href: '/services/daily-hire' },
    c.servicesEnabled.corporateHire && { label: 'Corporate Transport SLAs', href: '/corporate-transport' },
    c.servicesEnabled.tourismTravel && { label: 'Tourism & Travel', href: '/services' },
    c.servicesEnabled.projectTransport && { label: 'Project Transport', href: '/services' },
  ].filter(Boolean) as { label: string; href: string }[];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Our Fleet', href: '/fleet' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ];

  const socials = [
    c.socialLinks.facebook && { icon: Globe2, href: c.socialLinks.facebook, label: 'Facebook', color: 'hover:text-blue-400' },
    c.socialLinks.instagram && { icon: Share2, href: c.socialLinks.instagram, label: 'Instagram', color: 'hover:text-pink-400' },
    c.socialLinks.linkedin && { icon: Link2, href: c.socialLinks.linkedin, label: 'LinkedIn', color: 'hover:text-sky-400' },
    c.socialLinks.youtube && { icon: Video, href: c.socialLinks.youtube, label: 'YouTube', color: 'hover:text-red-400' },
    c.socialLinks.whatsapp && { icon: MessageSquare, href: c.socialLinks.whatsapp, label: 'WhatsApp', color: 'hover:text-emerald-400' },
  ].filter(Boolean) as { icon: React.ElementType; href: string; label: string; color: string }[];

  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Top CTA strip */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-base">Ready to hire a vehicle?</p>
            <p className="text-sm text-slate-400 mt-0.5">Submit an enquiry or call our operations desk today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request-quotation"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-sky-900/30"
            >
              Request Quotation <ArrowRight size={15} />
            </Link>
            <a
              href={`https://wa.me/${cleanWA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 transition"
            >
              <MessageSquare size={15} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              {c.logoUrl ? (
                <div className="h-10 flex items-center justify-center shrink-0">
                  <img src={c.logoUrl} alt={c.businessName} className="h-full w-auto max-w-[140px] object-contain rounded-lg" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shrink-0 text-white shadow-sm">
                  <Truck size={20} />
                </div>
              )}
              <div>
                <span className="block font-bold text-white text-sm leading-tight">{c.businessName}</span>
                <span className="block text-[10px] text-sky-500 leading-tight mt-0.5">{c.tagline.slice(0, 40)}{c.tagline.length > 40 ? '…' : ''}</span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 mb-5">
              {c.tagline}
            </p>

            <div className="space-y-2 text-xs">
              <a href={`tel:${cleanPhone}`} className="flex items-start gap-2 hover:text-sky-400 transition">
                <Phone size={13} className="text-sky-500 shrink-0 mt-0.5" />
                <span>{c.phone}</span>
              </a>
              <a href={`mailto:${c.publicEmail}`} className="flex items-start gap-2 hover:text-sky-400 transition">
                <Mail size={13} className="text-sky-500 shrink-0 mt-0.5" />
                <span>{c.publicEmail}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-sky-500 shrink-0 mt-0.5" />
                <span>{c.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={13} className="text-sky-500 shrink-0 mt-0.5" />
                <span>{c.businessHours}</span>
              </div>
            </div>

            {/* Social icons */}
            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`text-slate-500 ${s.color} transition`}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2 — Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Our Services</h4>
            <ul className="space-y-2">
              {serviceLinks.slice(0, 7).map((s) => (
                <li key={s.href + s.label}>
                  <Link
                    href={s.href}
                    className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center gap-1.5"
                  >
                    <span className="text-sky-700">›</span> {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center gap-1.5"
                  >
                    <span className="text-sky-700">›</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Portal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Access</h4>
            <ul className="space-y-2 mb-6">
              {[
                { label: 'Customer Portal', href: '/portal' },
                { label: 'Request a Quotation', href: '/request-quotation' },
                { label: 'Book a Vehicle', href: '/request-booking' },
                { label: 'Sign In', href: '/login' },
                { label: 'Register Account', href: '/register' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center gap-1.5"
                  >
                    <span className="text-sky-700">›</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Shield size={12} />
                Registered Transport Provider
              </div>
              <p>{c.brNumberPlaceholder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
          <p>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://raxwo.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline underline-offset-4 decoration-sky-400 hover:text-sky-300 hover:decoration-sky-300 transition-colors font-medium"
            >
              Raxwo (Pvt) LTD.
            </a>{' '}
            All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-200 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-200 transition">Terms & Conditions</Link>
            <Link href="/sitemap.xml" className="hover:text-slate-200 transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
