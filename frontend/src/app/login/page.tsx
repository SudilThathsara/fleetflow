'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Truck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, UserPlus, Home } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    companyName: 'Lanka Premier Transport',
    tagline: 'Reliable Vehicle Hire & Corporate Fleet Solutions',
    logoUrl: '',
  });
  const { login } = useAuth();

  useEffect(() => {
    // Read saved rememberMe email if exists
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fleetflow_remembered_email');
      if (saved) setEmail(saved);

      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setBranding((b) => ({
            companyName: parsed.companyName || b.companyName,
            tagline: parsed.tagline || b.tagline,
            logoUrl: parsed.logoUrl || '',
          }));
        } catch {}
      }
    }

    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBranding((b) => ({
            companyName: data.data.businessName || b.companyName,
            tagline: data.data.tagline || b.tagline,
            logoUrl: data.data.logoUrl || '',
          }));
        }
      })
      .catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setBranding((b) => ({
          companyName: e.detail.companyName || b.companyName,
          tagline: e.detail.tagline || b.tagline,
          logoUrl: e.detail.logoUrl !== undefined ? e.detail.logoUrl : b.logoUrl,
        }));
      }
    };
    window.addEventListener('fleetflow:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleSettingsUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('fleetflow_remembered_email', email);
      } else {
        localStorage.removeItem('fleetflow_remembered_email');
      }

      const res = await login(email, password);
      if (res.success) {
        const dest = res.redirectUrl || (res.role === 'customer' ? '/portal' : '/dashboard');
        window.location.replace(dest);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm border border-slate-700 transition"
        >
          <Home size={16} />
          <span>Back to Public Website</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Top Header */}
        <div className="bg-slate-950 p-5 sm:p-8 text-center text-white relative border-b border-slate-800">
          {branding.logoUrl ? (
            <div className="mx-auto h-14 flex items-center justify-center mb-4">
              <img src={branding.logoUrl} alt={branding.companyName} className="h-full w-auto max-w-[200px] object-contain rounded-xl" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
              <Truck size={32} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{branding.companyName}</h1>
          <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-semibold">
            {branding.tagline}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Access your customer portal, quotations, bookings, or staff dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Authentication failed</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span>Remember my email</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Customer registration prompt */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              New to our transport services?{' '}
              <Link
                href="/register"
                className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1 hover:underline ml-1"
              >
                <UserPlus size={15} />
                <span>Create customer account</span>
              </Link>
            </p>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-xs text-slate-500">
              Need corporate rates or custom fleet contracts?{' '}
              <Link href="/request-quotation" className="text-sky-600 font-medium hover:underline">
                Request a formal quotation
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-8 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>256-Bit Encrypted Session</span>
          </div>
          <span>FleetFlow Suite v2.6</span>
        </div>
      </div>
    </div>
  );
}
