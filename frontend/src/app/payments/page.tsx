'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreditCard, Plus, Search, FileDown, CheckCircle2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice: '',
    invoiceNumber: '',
    customer: '',
    customerName: '',
    amount: 10000,
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, iRes] = await Promise.all([fetch('/api/payments'), fetch('/api/invoices')]);
      const [pData, iData] = await Promise.all([pRes.json(), iRes.json()]);
      if (pData.success) setPayments(pData.data);
      if (iData.success) setInvoices(iData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    const defInv = invoices.find((x) => x.balanceDue > 0) || invoices[0];
    setFormData({
      invoice: defInv?._id || '',
      invoiceNumber: defInv?.invoiceNumber || '',
      customer: defInv?.customer || '',
      customerName: defInv?.customerName || '',
      amount: defInv?.balanceDue || 25000,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      transactionReference: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Payment received towards invoice settlement',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Download Receipt PDF
  const downloadReceiptPDF = (pay: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('FleetFlow Lanka (Pvt) Ltd', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Official Payment Receipt', 14, 26);
    doc.text('No 142/B, High Level Road, Nugegoda, Sri Lanka', 14, 31);

    doc.setDrawColor(220);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`PAYMENT RECEIPT: ${pay.receiptNumber}`, 14, 48);

    doc.setFontSize(10);
    doc.text(`Received From: ${pay.customerName}`, 14, 56);
    doc.text(`Date: ${new Date(pay.paymentDate).toLocaleDateString()}`, 14, 62);
    doc.text(`Applied Invoice: ${pay.invoiceNumber}`, 14, 68);
    doc.text(`Payment Mode: ${pay.paymentMethod}`, 14, 74);
    if (pay.transactionReference) {
      doc.text(`Transaction Reference: ${pay.transactionReference}`, 14, 80);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Amount Received: Rs. ${pay.amount?.toLocaleString()} LKR`, 14, 95);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Thank you for your business. Generated securely by FleetFlow Lanka Transport ERP.', 14, 115);

    doc.save(`${pay.receiptNumber}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments & Official Receipts</h1>
            <p className="text-sm text-slate-500">
              Record incoming customer payments, reduce invoice balances & issue printable official receipts
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Receipt #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Invoice Ref</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Method & Ref</th>
                  <th className="p-4 text-right">Amount (LKR)</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Loading payment ledger...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No payments recorded yet. Click "Record Payment" to post a receipt.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{p.receiptNumber}</td>
                      <td className="p-4 font-semibold text-slate-900">{p.customerName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800">
                          {p.invoiceNumber}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{p.paymentMethod}</p>
                        {p.transactionReference && (
                          <p className="text-xs text-slate-500 font-mono">{p.transactionReference}</p>
                        )}
                      </td>
                      <td className="p-4 text-right font-extrabold text-emerald-600">
                        Rs. {p.amount?.toLocaleString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => downloadReceiptPDF(p)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center space-x-1 ml-auto"
                        >
                          <FileDown size={14} />
                          <span>Receipt PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Post Customer Payment</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Invoice *</label>
                <select
                  required
                  value={formData.invoice}
                  onChange={(e) => {
                    const inv = invoices.find((x) => x._id === e.target.value);
                    setFormData({
                      ...formData,
                      invoice: e.target.value,
                      invoiceNumber: inv?.invoiceNumber || '',
                      customer: inv?.customer || '',
                      customerName: inv?.customerName || '',
                      amount: inv?.balanceDue || 0,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select Invoice to settle</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.customerName} (Due: Rs. {inv.balanceDue?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Received Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bank Reference / Cheque No
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-998822 / Chq 001928"
                  value={formData.transactionReference}
                  onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  Post Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
