'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { CreditCard, CheckCircle2, Calendar, FileText } from 'lucide-react';

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPayments(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment History & Official Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified bank transfers, cheques, and credit receipts recorded against your transport contracts.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading payment receipts...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CreditCard size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Payment Receipts Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When bank transfers or payments are credited against your invoices, official receipt entries are published here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt Ref</th>
                    <th className="py-3 px-4">Invoice Number</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4 text-right">Amount Credited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sky-700 font-semibold">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.paymentMethod || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {p.transactionReference || 'Direct Deposit'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono">
                        LKR {p.amount?.toLocaleString()}
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
