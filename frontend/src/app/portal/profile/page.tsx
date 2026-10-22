'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Phone,
  Mail,
  Lock,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    billingAddress: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const u = data.data.user;
          const c = data.data.customer;
          setProfile({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            billingAddress: c?.billingAddress || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          billingAddress: profile.billingAddress,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Profile details updated successfully.');
        updateUser({ name: profile.name, phone: profile.phone });
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters in length.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setPasswordError(data.message || 'Failed to change password. Verify your current password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Connection error.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile & Security Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal contact details, billing address, and account password.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 font-bold text-lg flex items-center justify-center">
              {profile.name.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{profile.name}</h3>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Email (Verified)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">To change your primary email, contact customer desk.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Billing / Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                  type="text"
                  value={profile.billingAddress}
                  onChange={(e) => setProfile({ ...profile, billingAddress: e.target.value })}
                  placeholder="No. 12, Galle Road, Colombo 03"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>{loading ? 'Saving...' : 'Update Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Lock size={18} className="text-slate-600" />
            <h3 className="font-bold text-sm text-slate-900">Change Password</h3>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-lg">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={14} />
                <span>{passwordLoading ? 'Updating Password...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
