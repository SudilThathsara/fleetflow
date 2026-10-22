'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight, Home, ShieldCheck, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setLoading(false);
      setMessage('Missing verification token or email parameter.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setMessage(data.message || 'Your email has been verified successfully!');
        } else {
          setSuccess(false);
          setMessage(data.message || 'Verification failed. The token may be invalid or expired.');
        }
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.message || 'Verification connection error.');
      })
      .finally(() => setLoading(false));
  }, [token, email]);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-slate-950 p-8 text-center text-white border-b border-slate-800">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
          <Mail size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
        <p className="text-xs text-sky-400 mt-1 uppercase tracking-wider font-semibold">
          Customer Portal Security
        </p>
      </div>

      <div className="p-8 text-center">
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-600 font-medium">Verifying your email token...</p>
          </div>
        ) : success ? (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Email Verified!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">{message}</p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-600/30 transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verification Link Invalid</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">{message}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition"
              >
                <span>Go to Sign In</span>
              </Link>
              <Link
                href="/register"
                className="text-xs text-sky-600 font-medium hover:underline mt-2"
              >
                Register a new customer account
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Server Verified</span>
        </div>
        <span>FleetFlow Lanka</span>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
