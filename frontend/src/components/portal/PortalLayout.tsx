'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck2,
  Receipt,
  CreditCard,
  FolderOpen,
  LifeBuoy,
  User,
  Building,
  LogOut,
  Bell,
  Menu,
  X,
  PlusCircle,
  Truck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface PortalNavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [branding, setBranding] = useState({
    businessName: 'Lanka Premier Transport',
    logoUrl: '',
  });

  useEffect(() => {
    // Check cached settings
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.companyName || parsed.logoUrl) {
            setBranding({
              businessName: parsed.companyName || 'Lanka Premier Transport',
              logoUrl: parsed.logoUrl || '',
            });
          }
        } catch {}
      }
    }

    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBranding({
            businessName: data.data.businessName || 'Lanka Premier Transport',
            logoUrl: data.data.logoUrl || '',
          });
        }
      })
      .catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setBranding({
          businessName: e.detail.companyName || 'Lanka Premier Transport',
          logoUrl: e.detail.logoUrl || '',
        });
      }
    };
    window.addEventListener('fleetflow:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/portal/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const unread = data.data.filter((n: any) => !n.read).length;
          setUnreadNotifications(unread);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems: PortalNavItem[] = [
    { name: 'Portal Overview', href: '/portal', icon: LayoutDashboard },
    { name: 'Quotation Requests', href: '/portal/quotation-requests', icon: FileText },
    { name: 'Formal Quotations', href: '/portal/quotations', icon: FileText },
    { name: 'My Bookings', href: '/portal/bookings', icon: CalendarCheck2 },
    { name: 'Invoices & Billing', href: '/portal/invoices', icon: Receipt },
    { name: 'Payment Receipts', href: '/portal/payments', icon: CreditCard },
    { name: 'Customer Documents', href: '/portal/documents', icon: FolderOpen },
    { name: 'Support Tickets', href: '/portal/support', icon: LifeBuoy },
    { name: 'Corporate Companies', href: '/portal/companies', icon: Building },
    { name: 'Profile & Security', href: '/portal/profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">Loading Customer Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          {branding.logoUrl ? (
            <div className="h-10 flex items-center justify-center shrink-0">
              <img src={branding.logoUrl} alt={branding.businessName} className="h-full w-auto max-w-[140px] object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
              <Truck size={22} className="text-sky-400" />
            </div>
          )}
          <div className="overflow-hidden truncate">
            <h2 className="font-bold text-white text-base leading-tight">Customer Portal</h2>
            <p className="text-xs text-sky-400 font-medium truncate">{branding.businessName}</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-900 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-600/30 text-sky-300 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] uppercase font-bold tracking-wider">
              {user?.role || 'Customer'}
            </span>
            <Link href="/portal/profile" className="text-slate-400 hover:text-white transition">
              Settings
            </Link>
          </div>
        </div>

        {/* Quick CTA */}
        <div className="px-4 mb-2">
          <Link
            href="/request-quotation"
            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle size={15} />
            <span>New Quotation Request</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition"
          >
            <ExternalLink size={14} />
            <span>Public Website</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              {navItems.find((n) => n.href === pathname)?.name || 'Customer Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/request-booking"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition"
            >
              <CalendarCheck2 size={14} />
              <span>Request Booking</span>
            </Link>

            <Link
              href="/portal/support"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Notifications & Support"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden md:inline text-slate-600 font-medium">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-slate-950 text-slate-300 border-b border-slate-800 p-4 space-y-1 z-40">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <Link href="/" className="text-slate-400">
                Public Website
              </Link>
              <button onClick={() => logout()} className="text-red-400 font-semibold">
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
