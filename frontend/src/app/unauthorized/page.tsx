'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, UserCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-sm text-slate-600 mt-2">
          You do not have administrative or staff privileges to access this internal management module.
        </p>

        {user ? (
          <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-700 space-y-1">
            <p>
              Signed in as: <strong>{user.name}</strong>
            </p>
            <p>
              Email: <strong>{user.email}</strong>
            </p>
            <p>
              Account Role: <span className="uppercase font-semibold text-sky-700">{user.role}</span>
            </p>
          </div>
        ) : (
          <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            You are currently browsing as a guest. Please sign in with an authorized account.
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {user?.role === 'customer' ? (
            <Link
              href="/portal"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition"
            >
              <UserCheck size={16} />
              <span>Go to Customer Portal</span>
            </Link>
          ) : user ? (
            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition"
            >
              <LayoutDashboard size={16} />
              <span>Go to Staff Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition"
            >
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition"
          >
            <Home size={16} />
            <span>Return to Public Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
