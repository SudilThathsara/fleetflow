'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck, Phone, MessageSquare, Menu, X, User, FileText,
  ChevronDown, Shield, Clock, Building2, Users, Calendar,
  Car, Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BrandingData {
  businessName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  whatsappNumber: string;
  businessHours: string;
  servicesEnabled: {
    monthlyHire?: boolean;
    doubleCabHire?: boolean;
    vanHire?: boolean;
    dailyHire?: boolean;
    corporateHire?: boolean;
  };
}

const DEFAULTS: BrandingData = {
  businessName: 'Lanka Premier Transport',
  tagline: 'Vehicle Hire & Corporate Fleet Solutions',
  logoUrl: '',
  phone: '+94 11 234 5678',
  whatsappNumber: '+94771234567',
  businessHours: 'Mon–Sat 7 AM–8 PM | 24/7 Dispatch',
  servicesEnabled: {
    monthlyHire: true,
    doubleCabHire: true,
    vanHire: true,
    dailyHire: true,
    corporateHire: true,
  },
};

interface NavItem {
  name: string;
  href: string;
  subItems?: { name: string; href: string; icon?: React.ElementType }[];
}

export const PublicHeader: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingData>(DEFAULTS);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/public/content')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setBranding({
            businessName: d.data.businessName || DEFAULTS.businessName,
            tagline: d.data.tagline || DEFAULTS.tagline,
            logoUrl: d.data.logoUrl || '',
            phone: (d.data.phone || DEFAULTS.phone).split('/')[0].trim(),
            whatsappNumber: d.data.whatsappNumber || DEFAULTS.whatsappNumber,
            businessHours: d.data.businessHours || DEFAULTS.businessHours,
            servicesEnabled: d.data.servicesEnabled || DEFAULTS.servicesEnabled,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  const cleanWA = branding.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = branding.phone.replace(/[^0-9+]/g, '');

  const serviceSubItems = [
    { name: 'All Services', href: '/services', icon: Globe },
    ...(branding.servicesEnabled.monthlyHire
      ? [{ name: 'Monthly Corporate Hire', href: '/services/monthly-vehicle-hire', icon: Building2 }]
      : []),
    ...(branding.servicesEnabled.doubleCabHire
      ? [{ name: 'Double-Cab Hire (4×4)', href: '/services/double-cab-hire', icon: Truck }]
      : []),
    ...(branding.servicesEnabled.vanHire
      ? [{ name: 'Passenger Van Hire', href: '/services/van-hire', icon: Users }]
      : []),
    ...(branding.servicesEnabled.dailyHire
      ? [{ name: 'Daily & Short-Term Hire', href: '/services/daily-hire', icon: Calendar }]
      : []),
  ];

  const navLinks: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services', subItems: serviceSubItems },
    { name: 'Corporate Transport', href: '/corporate-transport' },
    { name: 'Our Fleet', href: '/fleet' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled
          ? 'bg-white shadow-md shadow-slate-200/60 border-b border-slate-200'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100'
      }`}
    >
      {/* ── Top micro-bar (desktop only) ── */}
      <div className="hidden md:block bg-slate-900 text-slate-300 text-[11px] py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Clock size={11} className="text-sky-400 shrink-0" />
              <span className="truncate">{branding.businessHours}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={11} className="text-emerald-400 shrink-0" />
              <span>Commercially Insured · Verified Drivers</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <Phone size={11} className="text-sky-400" />
              <span>{branding.phone}</span>
            </a>
            <a
              href={`https://wa.me/${cleanWA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              <MessageSquare size={11} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-sky-900 to-sky-600 flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition overflow-hidden p-1.5">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.businessName} className="h-full w-full object-contain" />
              ) : (
                <Truck className="text-white" size={22} />
              )}
            </div>
            <div className="hidden sm:block">
              <span className="block font-bold text-slate-900 text-[15px] leading-tight tracking-tight">
                {branding.businessName}
              </span>
              <span className="block text-[10px] text-sky-600 font-medium tracking-wide leading-tight">
                {branding.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              if (link.subItems) {
                return (
                  <div
                    key={link.name}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <button
                      onClick={() => setServicesOpen((p) => !p)}
                      className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition flex items-center gap-1 ${
                        active
                          ? 'text-sky-600 bg-sky-50'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform ${servicesOpen ? 'rotate-180 text-sky-500' : 'opacity-60'}`}
                      />
                    </button>

                    {/* Dropdown panel */}
                    <div
                      className={`absolute top-full left-0 w-60 bg-white rounded-xl shadow-xl shadow-slate-200/80 border border-slate-100 py-1.5 z-50 transition-all duration-150 origin-top ${
                        servicesOpen
                          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                      }`}
                    >
                      {link.subItems.map((sub) => {
                        const Icon = sub.icon;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setServicesOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold transition ${
                              pathname === sub.href
                                ? 'text-sky-600 bg-sky-50/70'
                                : 'text-slate-700 hover:text-sky-600 hover:bg-slate-50'
                            }`}
                          >
                            {Icon && <Icon size={14} className="text-sky-500 shrink-0" />}
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition ${
                    active
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA (desktop + tablet) */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Link
                href={user.role === 'customer' ? '/portal' : '/dashboard'}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[13px] font-semibold flex items-center gap-1.5 transition"
              >
                <User size={15} className="text-sky-600" />
                <span className="hidden md:inline">
                  {user.role === 'customer' ? 'My Portal' : 'Dashboard'}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-[13px] font-semibold flex items-center gap-1.5 transition"
              >
                <User size={15} className="text-slate-400" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}
            <Link
              href="/request-quotation"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-bold shadow-md shadow-sky-600/25 flex items-center gap-1.5 transition"
            >
              <FileText size={14} />
              <span>Get Quotation</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/request-quotation"
              className="sm:hidden px-3 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1"
            >
              <FileText size={13} />
              Quote
            </Link>
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-slate-100 shadow-xl px-4 pt-3 pb-6 overflow-y-auto max-h-[80vh]">

          {/* Nav links */}
          <div className="space-y-0.5 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              if (link.subItems) {
                return (
                  <div key={link.name}>
                    <button
                      onClick={() => setMobileServicesOpen((p) => !p)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-semibold transition ${
                        active ? 'text-sky-600 bg-sky-50' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform text-slate-400 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileServicesOpen && (
                      <div className="pl-4 mt-0.5 space-y-0.5 pb-1">
                        {link.subItems.map((sub) => {
                          const Icon = sub.icon;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition ${
                                pathname === sub.href
                                  ? 'text-sky-600 bg-sky-50'
                                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                              }`}
                            >
                              {Icon && <Icon size={13} className="text-sky-500" />}
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-[14px] font-semibold transition ${
                    active ? 'text-sky-600 bg-sky-50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth + CTA buttons */}
          <div className="pt-3 space-y-2">
            {user ? (
              <Link
                href={user.role === 'customer' ? '/portal' : '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] flex items-center justify-center gap-2"
              >
                <User size={15} />
                {user.role === 'customer' ? 'Customer Portal' : 'Staff Dashboard'}
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[13px] text-center hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-sky-50 text-sky-700 font-semibold text-[13px] text-center hover:bg-sky-100 transition"
                >
                  Register
                </Link>
              </div>
            )}
            <Link
              href="/request-quotation"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition"
            >
              <FileText size={15} />
              Request a Quotation
            </Link>
          </div>

          {/* Contact strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <a href={`tel:${cleanPhone}`} className="flex items-center gap-1.5 text-[12px] text-slate-600">
              <Phone size={13} className="text-sky-600" />
              {branding.phone}
            </a>
            <a
              href={`https://wa.me/${cleanWA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold"
            >
              <MessageSquare size={13} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
