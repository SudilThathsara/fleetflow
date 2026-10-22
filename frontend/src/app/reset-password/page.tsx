'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Home, KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid password reset link. Please request a new link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Unable to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-slate-950 p-8 text-center text-white border-b border-slate-800">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
          <KeyRound size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-semibold">
          Secure Account Access
        </p>
      </div>

      <div className="p-8">
        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Password Reset Successfully</h3>
            <p className="text-sm text-slate-600">
              Your password has been securely updated. You can now log in to your account with your new credentials.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition"
              >
                <span>Sign In Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {!token || !email ? (
              <div className="text-center py-4 space-y-3">
                <AlertCircle size={32} className="text-amber-500 mx-auto" />
                <p className="text-sm text-slate-600">
                  This reset link is missing required authorization parameters.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-block text-sm text-sky-600 font-semibold hover:underline"
                >
                  Request a new password reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
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
                      <span>Update Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link href="/login" className="text-sm text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                Return to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
