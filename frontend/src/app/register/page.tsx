'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Mail, Lock, Phone, User, Building, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, Home } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    billingAddress: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          billingAddress: formData.billingAddress,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          data.message || 'Customer account created successfully! You can now sign in to your portal.'
        );
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm border border-slate-700 transition"
        >
          <Home size={16} />
          <span>Back to Public Website</span>
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-950 p-8 text-center text-white border-b border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
            <Truck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-semibold">
            Track Vehicle Hires, Quotations & Invoices Online
          </p>
        </div>

        <div className="p-8">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Registration Complete</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{successMessage}</p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 text-sm transition"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-semibold">Unable to register</p>
                    <p className="text-xs mt-0.5 text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Sunil Fernando"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 77 123 4567"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@company.lk"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company / Organization (Optional)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Apex Engineering JV"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service / Billing Address
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="No. 45, Galle Road, Colombo 03"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400" size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        required
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-sky-600 hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-sky-600 hover:underline">
                        Privacy Policy
                      </Link>
                      . I understand online requests remain non-binding quotations until approved.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Customer Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline ml-1">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Customer Data Strictly Protected</span>
          </div>
          <span>FleetFlow Lanka</span>
        </div>
      </div>
    </div>
  );
}
