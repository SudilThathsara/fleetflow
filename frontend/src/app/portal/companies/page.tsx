'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Building, Phone, Mail, MapPin, FileText, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function CustomerCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const compList = data.user.companies || [];
          if (data.user.customer?.companyName && compList.length === 0) {
            compList.push({
              company: {
                name: data.user.customer.companyName,
                contactPerson: data.user.customer.name,
                phone: data.user.customer.phone,
                email: data.user.customer.email,
                billingAddress: data.user.customer.billingAddress,
                status: 'Active',
              },
              role: 'Account Owner',
            });
          }
          setCompanies(compList);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Corporate Companies & Memberships</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered corporate profiles, billing addresses, and tax identities associated with your customer account.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading corporate memberships...</div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Building size={36} className="text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Corporate Company Linked</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your account is currently registered as an Individual customer. To register a corporate identity for consolidated VAT invoices, contact your account manager.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((item, idx) => {
              const comp = item.company || {};
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <Building size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{comp.name || 'Corporate Entity'}</h3>
                        <p className="text-[11px] text-slate-400">BR: {comp.brNumber || 'Registered Corporate Partner'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {item.role || 'Member'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>Contact: <strong>{comp.contactPerson || 'Account Officer'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{comp.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span>{comp.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{comp.billingAddress || 'Standard Delivery / Pickup Address'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Terms: {comp.paymentTerms || '15 Days Net'}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Approved Account</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
