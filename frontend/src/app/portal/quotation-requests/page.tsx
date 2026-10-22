'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { FileText, PlusCircle, Calendar, MapPin, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function QuotationRequestsPortalPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/quotation-request')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setRequests(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Quotation Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review history and live status of quotation requests submitted for your account.
            </p>
          </div>

          <Link
            href="/request-quotation"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle size={15} />
            <span>New Quotation Request</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading your quotation requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <FileText size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Quotation Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t submitted any quotation requests yet. Request tailored rates for double-cabs, vans, or monthly contracts.
            </p>
            <div className="pt-2">
              <Link
                href="/request-quotation"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                <PlusCircle size={14} />
                <span>Submit First Request</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Request Ref</th>
                    <th className="py-3 px-4">Vehicle & Service</th>
                    <th className="py-3 px-4">Start Date & Area</th>
                    <th className="py-3 px-4">KM & Driver Policy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Formal Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {r.requestId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">
                          {r.numberOfVehicles || 1}x {r.vehicleCategory}
                        </span>
                        <span className="text-[11px] text-slate-500">{r.serviceCategory} ({r.hireType})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{new Date(r.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin size={11} />
                          <span>{r.serviceArea}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{r.estimatedKmPerMonth || 3000} KM / month</span>
                        <div className="text-[10px] text-slate-400">{r.driverRequirement}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.status === 'Quoted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'Under Review'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.convertedQuotationId ? (
                          <Link
                            href="/portal/quotations"
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                          >
                            View Formal Quote →
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-400">In Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
