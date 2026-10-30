'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Car,
  UserCheck,
  Users,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  Wrench,
  FileText,
  DollarSign,
  FileCheck2,
  Receipt,
  CreditCard,
  Share2,
  Globe,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Package,
  Calculator,
  ExternalLink,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  category?: string;
}

const navigationItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Car, category: 'Fleet & Operations' },
  { name: 'Companies & Projects', href: '/companies', icon: Building2, category: 'Fleet & Operations' },
  { name: 'Annual Contracts & Rates', href: '/contracts', icon: FileCheck2, category: 'Fleet & Operations' },
  { name: 'Drivers', href: '/drivers', icon: UserCheck, category: 'Fleet & Operations' },
  { name: 'External Owners & Suppliers', href: '/suppliers', icon: Users, category: 'Fleet & Operations' },
  { name: 'Bookings & Daily/2-Day Hire', href: '/bookings', icon: CalendarDays, category: 'Fleet & Operations' },
  { name: 'Monthly Running Charts', href: '/running-charts', icon: FileSpreadsheet, category: 'Fleet & Operations' },
  { name: 'Spare-Parts Inventory', href: '/inventory', icon: Package, category: 'Maintenance & Stores' },
  { name: 'Service & Maintenance', href: '/maintenance', icon: Wrench, category: 'Maintenance & Stores' },
  { name: 'Expiring Documents', href: '/documents', icon: FileText, category: 'Maintenance & Stores' },
  { name: 'Monthly Billing', href: '/billing-engine', icon: Calculator, category: 'Finance & Invoicing' },
  { name: 'Driver Payroll & EPF/ETF', href: '/payroll', icon: DollarSign, category: 'Finance & Invoicing' },
  { name: 'Invoices', href: '/invoices', icon: Receipt, category: 'Finance & Invoicing' },
  { name: 'Quotations', href: '/quotations', icon: FileText, category: 'Finance & Invoicing' },
  { name: 'Payments & Receipts', href: '/payments', icon: CreditCard, category: 'Finance & Invoicing' },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, category: 'Finance & Invoicing' },
  { name: 'Social Post Creator', href: '/social-posts', icon: Share2, category: 'Marketing & Leads' },
  { name: 'Social Media Groups', href: '/social-groups', icon: Globe, category: 'Marketing & Leads' },
  { name: 'Social Leads & CRM', href: '/social-leads', icon: Users, category: 'Marketing & Leads' },
  { name: 'User Management', href: '/users', icon: Users, category: 'System' },
  { name: 'Settings', href: '/settings', icon: Settings, category: 'System' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('FleetFlow Lanka');
  const [companyLogo, setCompanyLogo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) 
        {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.companyName) setCompanyName(parsed.companyName);
          if (parsed.logoUrl !== undefined) setCompanyLogo(parsed.logoUrl);
        } catch {}
      } else {
        fetch('/api/settings')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data) {
              if (data.data.companyName) setCompanyName(data.data.companyName);
              if (data.data.logoUrl) setCompanyLogo(data.data.logoUrl);
              localStorage.setItem('fleetflow_settings', JSON.stringify(data.data));
            }
          })
          .catch(() => {});
      }
    }

    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.companyName) {
        setCompanyName(e.detail.companyName);
      }
      if (e.detail?.logoUrl !== undefined) {
        setCompanyLogo(e.detail.logoUrl);
      }
    };
    window.addEventListener('fleetflow:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Group by category
  const categories = ['Fleet & Operations', 'Maintenance & Stores', 'Finance & Invoicing', 'Marketing & Leads', 'System'];

  return (
    <div className="min-h-screen min-w-0 bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top bar */}
      <header className="md:hidden bg-slate-900 text-white flex items-center justify-between gap-3 px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          {companyLogo ? (
            <div className="h-8 flex items-center justify-center shrink-0">
              <img src={companyLogo} alt="Logo" className="h-full w-auto max-w-[120px] object-contain" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              {companyName ? companyName.charAt(0).toUpperCase() : 'FL'}
            </div>
          )}
          <span className="font-bold text-lg tracking-tight truncate max-w-[200px]">{companyName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:text-white hover:bg-sky-500/30 text-xs font-semibold border border-sky-400/30 transition"
            title="Open Public Website"
          >
            <Globe size={14} className="text-sky-400" />
            <span>Website</span>
            <ExternalLink size={11} className="opacity-75" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            className="shrink-0 rounded-md p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <button
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[min(18rem,calc(100vw-2rem))] bg-slate-900 text-slate-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {companyLogo ? (
              <div className="h-10 flex items-center justify-center shrink-0">
                <img src={companyLogo} alt="Company Logo" className="h-full w-auto max-w-[140px] object-contain" />
              </div>
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/30">
                {companyName ? companyName.charAt(0).toUpperCase() : 'F'}
              </div>
            )}
            <div className="truncate">
              <h1 className="font-extrabold text-base text-white tracking-wide truncate">{companyName}</h1>
              <p className="text-xs text-blue-400 font-medium tracking-tight">Transport ERP Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{cat}</div>
              {navigationItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-4 border-blue-500 pl-2'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-blue-400" />}
                    </Link>
                  );
                })}
            </div>
          ))}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-3 truncate">
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-400 capitalize truncate">{user?.role || 'super_admin'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 min-h-16 items-center justify-between gap-6 px-4 lg:px-8 py-2 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-4 w-full max-w-96">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Global search (Vehicles, Drivers, Bookings, Invoices)..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* View Live Website Button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 hover:shadow-sky-600/35 transition-all hover:scale-[1.02]"
              title="Open the customer-facing business website in a new tab"
            >
              <Globe size={15} />
              <span>View Public Website</span>
              <ExternalLink size={12} className="opacity-80" />
            </Link>

            <Link
              href="/documents"
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              title="Document Alerts"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
            </Link>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Super Admin'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page children */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};
