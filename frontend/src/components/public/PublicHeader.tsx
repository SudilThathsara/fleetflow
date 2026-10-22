'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  Phone,
  MessageSquare,
  Menu,
  X,
  User,
  FileText,
  ChevronDown,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const PublicHeader: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [branding, setBranding] = useState({
    businessName: 'Lanka Premier Transport',
    tagline: 'Vehicle Hire & Corporate Fleet Solutions',
    logoUrl: '',
    phone: '+94 11 234 5678',
    whatsappNumber: '+94771234567',
  });

  useEffect(() => {
    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBranding({
            businessName: data.data.businessName || 'Lanka Premier Transport',
            tagline: data.data.tagline || 'Vehicle Hire & Corporate Fleet Solutions',
            logoUrl: data.data.logoUrl || '',
            phone: data.data.phone?.split('/')[0]?.trim() || '+94 11 234 5678',
            whatsappNumber: data.data.whatsappNumber || '+94771234567',
          });
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    {
      name: 'Services',
      href: '/services',
      hasDropdown: true,
      subItems: [
        { name: 'All Services Overview', href: '/services' },
        { name: 'Monthly Corporate Hire', href: '/services/monthly-vehicle-hire' },
        { name: 'Double-Cab Hire (4x4)', href: '/services/double-cab-hire' },
        { name: 'Passenger Van Hire', href: '/services/van-hire' },
        { name: 'Daily & Short-Term Hire', href: '/services/daily-hire' },
      ],
    },
    { name: 'Corporate Transport', href: '/corporate-transport' },
    { name: 'Our Fleet', href: '/fleet' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const cleanWhatsAppNumber = branding.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-sky-400" />
              <span>Daily Dispatch & 24/7 Roadside Assistance: Island-wide</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-400" />
              <span>Commercial Insurance & Verified Drivers</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${branding.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition"
            >
              <Phone size={12} className="text-sky-400" />
              <span>{branding.phone}</span>
            </a>
            <a
              href={`https://wa.me/${cleanWhatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              <MessageSquare size={12} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 via-sky-900 to-sky-600 flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition overflow-hidden p-1.5">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.businessName} className="h-full w-full object-contain" />
              ) : (
                <Truck className="text-white" size={24} />
              )}
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-lg leading-tight tracking-tight">
                {branding.businessName}
              </span>
              <span className="block text-xs text-sky-600 font-medium tracking-wide">
                {branding.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.hasDropdown && pathname.startsWith(link.href));
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
                        isActive
                          ? 'text-sky-600 bg-sky-50'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown size={14} className="opacity-70" />
                    </Link>

                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                        {link.subItems?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`block px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition ${
                              pathname === sub.href ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === 'customer' ? '/portal' : '/dashboard'}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold flex items-center gap-2 transition"
              >
                <User size={16} className="text-sky-600" />
                <span>{user.role === 'customer' ? 'My Portal' : 'Staff Dashboard'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <User size={16} className="text-slate-500" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              href="/request-quotation"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/25 flex items-center gap-2 transition"
            >
              <FileText size={16} />
              <span>Get Quotation</span>
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/request-quotation"
              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold flex items-center gap-1 sm:hidden"
            >
              <FileText size={14} />
              <span>Quote</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="pt-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => (
              <div key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    pathname === link.href ? 'text-sky-600 bg-sky-50 font-semibold' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
                {link.hasDropdown && (
                  <div className="pl-6 space-y-1 my-1">
                    {link.subItems?.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-xs text-slate-600 hover:text-sky-600"
                      >
                        • {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 space-y-2">
            {user ? (
              <Link
                href={user.role === 'customer' ? '/portal' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <User size={16} />
                <span>{user.role === 'customer' ? 'Customer Portal' : 'Staff Dashboard'}</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-sky-50 text-sky-700 font-semibold text-sm text-center"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/request-quotation"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <FileText size={16} />
              <span>Request a Quotation</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <a href={`tel:${branding.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5">
              <Phone size={13} className="text-sky-600" />
              <span>{branding.phone}</span>
            </a>
            <a
              href={`https://wa.me/${cleanWhatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-600 font-medium"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
