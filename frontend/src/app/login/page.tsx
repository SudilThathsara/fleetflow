'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Truck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@fleetflow.lk');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Top Header */}
        <div className="bg-slate-950 p-8 text-center text-white relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">FleetFlow Lanka</h1>
          <p className="text-xs text-blue-400 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Fleet & Transport Operations
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Access vehicle charts, bookings, invoices and drivers</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fleetflow.lk"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md shadow-blue-600/30 disabled:opacity-70 mt-6"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Demo Credential badge */}
          <div className="mt-8 pt-5 border-t border-slate-100 bg-slate-50 -mx-8 -mb-8 p-6 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Default Administrator Access:</span>
            </div>
            <div className="space-y-1 text-slate-500 font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200">
              <p>Email: <span className="text-blue-600 font-semibold">admin@fleetflow.lk</span></p>
              <p>Password: <span className="text-blue-600 font-semibold">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
