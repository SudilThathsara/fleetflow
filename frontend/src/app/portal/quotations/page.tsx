'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortalLayout } from '@/components/portal/PortalLayout';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Clock,
  Printer,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = () => {
    setLoading(true);
    fetch('/api/portal/quotations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setQuotations(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    if (!confirm(`Are you sure you want to ${action} this quotation?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/portal/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage(data.message);
        fetchQuotations();
        if (selectedQuote && selectedQuote._id === id) {
          setSelectedQuote({ ...selectedQuote, status: action === 'accept' ? 'Accepted' : 'Rejected' });
        }
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Connection error');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadPdf = (q: any) => {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Lanka Premier Transport & Vehicle Hire', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Enterprise Vehicle Fleet & Transport Operations Management', 14, 26);
    doc.text('No. 142/B, High Level Road, Nugegoda, Sri Lanka | Phone: +94 11 234 5678', 14, 31);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // Quotation Metadata
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`OFFICIAL QUOTATION: ${q.quotationNumber}`, 14, 44);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${q.customerName}`, 14, 52);
    doc.text(`Phone: ${q.customerPhone || 'N/A'}`, 14, 57);
    doc.text(`Email: ${q.customerEmail || 'N/A'}`, 14, 62);

    doc.text(`Issue Date: ${new Date(q.issueDate).toLocaleDateString()}`, 130, 52);
    doc.text(`Valid Until: ${new Date(q.validUntil).toLocaleDateString()}`, 130, 57);
    doc.text(`Status: ${q.status.toUpperCase()}`, 130, 62);

    // Items Table
    const tableData = (q.items || []).map((item: any, i: number) => [
      i + 1,
      item.description,
      item.vehicleType,
      item.quantity,
      `LKR ${item.unitPrice?.toLocaleString()}`,
      `LKR ${item.total?.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Description', 'Vehicle Category', 'Qty', 'Unit Rate', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: LKR ${q.subtotal?.toLocaleString()}`, 130, finalY);
    if (q.taxAmount) doc.text(`VAT / Tax: LKR ${q.taxAmount?.toLocaleString()}`, 130, finalY + 6);
    doc.text(`Total Amount: LKR ${q.totalAmount?.toLocaleString()}`, 130, finalY + 12);

    // Terms
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Agreed Terms & Operational Policies:', 14, finalY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(
      q.terms ||
        'Standard 3,000 KM included per monthly billing cycle. Additional mileage and driver overtime calculated on audited daily running charts.',
      180
    );
    doc.text(termsLines, 14, finalY + 28);

    doc.save(`Quotation_${q.quotationNumber}.pdf`);
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Formal Quotations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review official rate quotations prepared for your account, download PDFs, and accept terms.
            </p>
          </div>

          <Link
            href="/request-quotation"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            <span>Request New Quotation</span>
          </Link>
        </div>

        {feedbackMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage('')} className="text-emerald-600 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <FileText size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Formal Quotations Issued Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When our operations team evaluates your quotation requests, formal quotation documents will be published here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left List */}
            <div className="lg:col-span-5 space-y-3">
              {quotations.map((q) => {
                const isSelected = selectedQuote?._id === q._id;
                return (
                  <div
                    key={q._id}
                    onClick={() => setSelectedQuote(q)}
                    className={`bg-white rounded-2xl p-5 border transition cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-mono font-bold text-sm text-slate-900">{q.quotationNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <p className="font-bold text-slate-800">
                        Total: LKR {q.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Valid Until: {new Date(q.validUntil).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Items: {q.items?.length || 1} vehicle specification(s)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Detailed View */}
            <div className="lg:col-span-7">
              {selectedQuote ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">Quotation Document</span>
                      <h3 className="text-xl font-black text-slate-900">{selectedQuote.quotationNumber}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadPdf(selectedQuote)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Validity Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Issue Date</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedQuote.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valid Until</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedQuote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Current Status</span>
                      <span className="font-bold text-sky-700">{selectedQuote.status}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Line Items</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedQuote.items?.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                              <td className="py-2.5 px-3 text-slate-500">{item.vehicleType}</td>
                              <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                LKR {item.unitPrice?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                                LKR {item.total?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-1.5 text-xs text-right">
                    <p className="text-slate-600">Subtotal: LKR {selectedQuote.subtotal?.toLocaleString()}</p>
                    {selectedQuote.taxAmount > 0 && (
                      <p className="text-slate-600">VAT / Tax: LKR {selectedQuote.taxAmount?.toLocaleString()}</p>
                    )}
                    <p className="text-base font-black text-slate-900">
                      Total: LKR {selectedQuote.totalAmount?.toLocaleString()}
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">Agreed Terms & Conditions:</p>
                    <p className="leading-relaxed">
                      {selectedQuote.terms ||
                        'Standard annual service agreement terms apply. Monthly kilometre allowance and verified running charts govern overtime and extra kilometres.'}
                    </p>
                  </div>

                  {/* Accept / Decline actions */}
                  {selectedQuote.status === 'Draft' || selectedQuote.status === 'Sent' ? (
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        onClick={() => handleAction(selectedQuote._id, 'decline')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition cursor-pointer"
                      >
                        Decline Quotation
                      </button>
                      <button
                        onClick={() => handleAction(selectedQuote._id, 'accept')}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                      >
                        Accept Quotation
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                      This quotation was marked as <strong>{selectedQuote.status}</strong>.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                  Select a quotation from the list on the left to view complete details, download the PDF, or accept terms.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
