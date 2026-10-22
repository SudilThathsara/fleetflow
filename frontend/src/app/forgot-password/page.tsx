'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Home, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Unable to process password reset request.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
        <div className="bg-slate-950 p-8 text-center text-white border-b border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
            <KeyRound size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-semibold">
            Account Recovery
          </p>
        </div>

        <div className="p-8">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
              <p className="text-sm text-slate-600">
                If an account exists with the email <strong>{email}</strong>, a password reset link has been dispatched.
              </p>
              <p className="text-xs text-slate-500">
                The link will expire in 1 hour. Please check your inbox and spam folder.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition"
                >
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-6">
                Enter your registered customer or employee email address below and we will send you a secure link to reset your password.
              </p>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
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
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link href="/login" className="text-sm text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
