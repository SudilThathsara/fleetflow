'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import {
  Receipt,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  CreditCard,
  DollarSign,
  Info,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [bankDetails, setBankDetails] = useState('');

  useEffect(() => {
    fetch('/api/portal/invoices')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setInvoices(data.data);
          if (data.data.length > 0) setSelectedInvoice(data.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.bankAccountDetails) {
          setBankDetails(data.data.bankAccountDetails);
        }
      })
      .catch(() => {});
  }, []);

  const downloadInvoicePdf = (inv: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Lanka Premier Transport & Vehicle Hire', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Enterprise Vehicle Fleet & Transport Operations Management', 14, 26);
    doc.text('No. 142/B, High Level Road, Nugegoda, Sri Lanka | Phone: +94 11 234 5678', 14, 31);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // Invoice Meta
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TAX INVOICE: ${inv.invoiceNumber}`, 14, 44);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${inv.customerName}`, 14, 52);
    doc.text(`Address: ${inv.customerAddress || 'N/A'}`, 14, 57);
    if (inv.projectName) doc.text(`Project: ${inv.projectName}`, 14, 62);

    doc.text(`Issue Date: ${new Date(inv.issueDate).toLocaleDateString()}`, 130, 52);
    doc.text(`Due Date: ${new Date(inv.dueDate).toLocaleDateString()}`, 130, 57);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 130, 62);

    // Items Table
    const tableData = (inv.items || []).map((item: any, i: number) => [
      i + 1,
      item.description,
      item.chargeType || 'Service',
      item.quantity,
      `LKR ${item.unitPrice?.toLocaleString()}`,
      `LKR ${item.total?.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Description', 'Charge Type', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: LKR ${inv.subtotal?.toLocaleString()}`, 130, finalY);
    if (inv.taxAmount) doc.text(`VAT / Tax: LKR ${inv.taxAmount?.toLocaleString()}`, 130, finalY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: LKR ${inv.totalAmount?.toLocaleString()}`, 130, finalY + 12);
    doc.text(`Paid to Date: LKR ${inv.paidAmount?.toLocaleString()}`, 130, finalY + 18);
    doc.text(`Balance Due: LKR ${inv.balanceDue?.toLocaleString()}`, 130, finalY + 24);

    // Bank Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Instructions / Direct Deposit Details:', 14, finalY + 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const bLines = doc.splitTextToSize(
      bankDetails ||
        'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: Lanka Premier Transport (Pvt) Ltd',
      180
    );
    doc.text(bLines, 14, finalY + 40);

    doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoices & Statements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review monthly fleet statements, outstanding balances, payment terms, and official tax invoice downloads.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading your invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Receipt size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Invoices Issued</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no outstanding or historical invoices issued against your customer account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: List of Invoices */}
            <div className="lg:col-span-5 space-y-3">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?._id === inv._id;
                return (
                  <div
                    key={inv._id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`bg-white rounded-2xl p-5 border transition cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.balanceDue === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.balanceDue === 0 ? 'Paid' : `Due: LKR ${inv.balanceDue?.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-800 font-bold">
                        <span>Total: LKR {inv.totalAmount?.toLocaleString()}</span>
                        <span className="text-slate-500 font-normal">Paid: {inv.paidAmount?.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                      {inv.projectName && (
                        <p className="text-[11px] text-slate-500 truncate">Project: {inv.projectName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Invoice Details & Payment Instructions */}
            <div className="lg:col-span-7">
              {selectedInvoice ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Title and Download */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">Tax Invoice</span>
                      <h3 className="text-xl font-black text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                    </div>

                    <button
                      onClick={() => downloadInvoicePdf(selectedInvoice)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Invoice PDF</span>
                    </button>
                  </div>

                  {/* Dates & Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Issue Date</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Due Date</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Amount</span>
                      <span className="font-bold text-slate-800">
                        LKR {selectedInvoice.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Balance Due</span>
                      <span className="font-bold text-amber-600 font-mono">
                        LKR {selectedInvoice.balanceDue?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Billed Line Items</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3">Charge Type</th>
                            <th className="py-2.5 px-3 text-right">Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Rate</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedInvoice.items?.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                              <td className="py-2.5 px-3 text-slate-500">{item.chargeType || 'Base'}</td>
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

                  {/* Bank Payment Instructions */}
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs text-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard size={15} className="text-sky-600" />
                      <span>Approved Bank Payment Instructions</span>
                    </h4>
                    <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-lg border border-sky-100">
                      {bankDetails ||
                        'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: Lanka Premier Transport (Pvt) Ltd'}
                    </pre>
                    <p className="text-[10px] text-slate-500">
                      Please include invoice number (<strong>{selectedInvoice.invoiceNumber}</strong>) as your transfer reference. Official receipts are published to your portal upon clearance.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
