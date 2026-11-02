'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Receipt, Plus, Search, Trash2, Edit2, FileDown, CheckCircle, Clock, X, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Branding Settings for Invoices & Logo
  const [settings, setSettings] = useState<any>({
    companyName: 'Transport & Tourism',
    tagline: 'Enterprise Fleet & Transport Operations Management',
    logoUrl: '',
    phone: '+94 11 234 5678 / +94 77 123 4567',
    email: 'operations@fleetflowlanka.lk',
    address: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka',
    vatNumber: 'VAT-10928374-7000',
    brNumber: 'PV-98765/2024',
    currency: 'LKR',
    bankAccountDetails: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: Transport & Tourism (Pvt) Ltd',
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    issueDate: '',
    dueDate: '',
    description: 'Vehicle Rental & Transport Charges',
    vehicleReg: '',
    unitPrice: 35000,
    paidAmount: 0,
    status: 'Issued',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, custRes, settingsRes] = await Promise.all([
        fetch(`/api/invoices?search=${encodeURIComponent(search)}`),
        fetch('/api/customers'),
        fetch('/api/settings'),
      ]);
      const [invData, custData, settingsData] = await Promise.all([
        invRes.json(),
        custRes.json(),
        settingsRes.json(),
      ]);
      if (invData.success) setInvoices(invData.data);
      if (custData.success) setCustomers(custData.data);
      if (settingsData.success && settingsData.data) setSettings(settingsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    const defCust = customers[0];
    setFormData({
      customer: defCust?._id || '',
      customerName: defCust?.name || '',
      customerPhone: defCust?.phone || '',
      customerAddress: defCust?.billingAddress || 'Colombo',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Monthly Corporate Transport & Airport Transfers',
      vehicleReg: 'WP-NC-8890',
      unitPrice: 48000,
      paidAmount: 0,
      status: 'Issued',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv: any) => {
    setEditingInvoice(inv);
    setFormData({
      customer: inv.customer,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      customerAddress: inv.customerAddress,
      issueDate: inv.issueDate ? inv.issueDate.split('T')[0] : '',
      dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
      description: inv.items[0]?.description || '',
      vehicleReg: inv.items[0]?.vehicleReg || '',
      unitPrice: inv.items[0]?.unitPrice || inv.totalAmount,
      paidAmount: inv.paidAmount || 0,
      status: inv.status,
      notes: inv.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${num}?`)) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
      else alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingInvoice ? 'PUT' : 'POST';
      const url = editingInvoice ? `/api/invoices/${editingInvoice._id}` : '/api/invoices';

      const payload = {
        customer: formData.customer,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: [
          {
            description: formData.description,
            vehicleReg: formData.vehicleReg,
            quantity: 1,
            unitPrice: Number(formData.unitPrice),
            total: Number(formData.unitPrice),
          },
        ],
        subtotal: Number(formData.unitPrice),
        totalAmount: Number(formData.unitPrice),
        paidAmount: Number(formData.paidAmount),
        balanceDue: Math.max(0, Number(formData.unitPrice) - Number(formData.paidAmount)),
        status: formData.status,
        notes: formData.notes,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  // Generate Professional Invoice PDF with Company Logo
  const downloadInvoicePDF = (inv: any) => {
    const doc = new jsPDF();

    let startX = 14;
    const hasLogo = Boolean(settings?.logoUrl && settings.logoUrl.startsWith('data:image'));

    if (hasLogo) {
      try {
        const isPng = settings.logoUrl.startsWith('data:image/png');
        const format = isPng ? 'PNG' : 'JPEG';
        // Add company logo at top-left
        doc.addImage(settings.logoUrl, format, 14, 11, 28, 24);
        startX = 46;
      } catch (err) {
        console.warn('Could not add logo to PDF:', err);
      }
    }

    // Brand Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(settings?.companyName || 'Transport & Tourism', startX, 18);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(settings?.tagline || 'Enterprise Transport Operations & Fleet Management', startX, 24);
    doc.text(settings?.address || 'No. 142/B, High Level Road, Nugegoda, Sri Lanka', startX, 29);
    doc.text(`Tel: ${settings?.phone || '+94 11 234 5678'} | Email: ${settings?.email || 'operations@fleetflowlanka.lk'}`, startX, 34);
    if (settings?.vatNumber || settings?.brNumber) {
      doc.text(`VAT/Tax: ${settings.vatNumber || 'N/A'} | BR Reg: ${settings.brNumber || 'N/A'}`, startX, 39);
    }

    doc.setDrawColor(220);
    doc.line(14, 44, 196, 44);

    // Invoice Meta
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`INVOICE: ${inv.invoiceNumber}`, 14, 54);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${new Date(inv.issueDate).toLocaleDateString()}`, 14, 60);
    doc.text(`Due Date: ${new Date(inv.dueDate).toLocaleDateString()}`, 14, 65);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 14, 70);

    // Bill To
    doc.text(`Billed To:`, 120, 54);
    doc.setFont('helvetica', 'bold');
    doc.text(`${inv.customerName}`, 120, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${inv.customerPhone || 'N/A'}`, 120, 65);
    doc.text(`${inv.customerAddress || 'Colombo, Sri Lanka'}`, 120, 70);

    // Items Table
    const tableData = (inv.items || []).map((it: any) => [
      it.description,
      it.vehicleReg || 'N/A',
      it.quantity,
      `Rs. ${Number(it.unitPrice || 0).toLocaleString()}`,
      `Rs. ${Number(it.total || 0).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 77,
      head: [['Description / Service', 'Vehicle', 'Qty', 'Unit Price', 'Line Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
    });

    // Summary block
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${Number(inv.subtotal || 0).toLocaleString()}`, 135, finalY);
    if (inv.taxAmount > 0) {
      doc.text(`VAT/Tax: Rs. ${Number(inv.taxAmount).toLocaleString()}`, 135, finalY + 6);
    }
    doc.text(`Amount Paid: Rs. ${Number(inv.paidAmount || 0).toLocaleString()}`, 135, finalY + 12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Balance Due: Rs. ${Number(inv.balanceDue || 0).toLocaleString()}`, 135, finalY + 19);

    // Bank Details & Payment Instructions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Payment Instructions & Bank Account Details:', 14, finalY + 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100);
    const bankLines = doc.splitTextToSize(
      settings?.bankAccountDetails ||
        'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: Transport & Tourism (Pvt) Ltd',
      180
    );
    doc.text(bankLines, 14, finalY + 34);

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoices & Receivables</h1>
            <p className="text-sm text-slate-500">
              Generate sequential invoices, monitor payment statuses & export professional client PDF statements
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Invoice #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Issue & Due Date</th>
                  <th className="p-4 text-right">Total (LKR)</th>
                  <th className="p-4 text-right">Paid</th>
                  <th className="p-4 text-right">Balance Due</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No invoices found. Click "Create Invoice" to issue one.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{inv.customerName}</p>
                        <p className="text-xs text-slate-500">{inv.customerPhone}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        <p>Issued: {new Date(inv.issueDate).toLocaleDateString()}</p>
                        <p>Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        Rs. {inv.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-emerald-600">
                        Rs. {inv.paidAmount?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold text-rose-600">
                        Rs. {inv.balanceDue?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'Partially Paid'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => downloadInvoicePDF(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download PDF Invoice"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} />
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

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingInvoice ? 'Edit Invoice' : 'Create Customer Invoice'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer *</label>
                  <select
                    required
                    value={formData.customer}
                    onChange={(e) => {
                      const c = customers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        customer: e.target.value,
                        customerName: c?.name || '',
                        customerPhone: c?.phone || '',
                        customerAddress: c?.billingAddress || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. CAB-4521"
                    value={formData.vehicleReg}
                    onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Invoice Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount Already Paid (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Line Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingInvoice ? 'Save Changes' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal with Company Logo */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Controls Bar (hidden during print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="text-blue-600" size={22} />
                <span className="font-bold text-slate-800 text-lg">Official Invoice Print Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadInvoicePDF(viewingInvoice)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileDown size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-invoice" className="bg-white p-6 sm:p-10 border border-slate-200 rounded-xl space-y-6 text-slate-900">
              {/* Header with Logo */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
                <div className="flex items-start gap-4">
                  {settings?.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.companyName || 'Company Logo'}
                      className="h-16 w-auto max-w-[140px] object-contain rounded-lg border border-slate-100 p-1 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-sm">
                      {(settings?.companyName || 'FF').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {settings?.companyName || 'FleetFlow Lanka (Pvt) Ltd'}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">{settings?.tagline || 'Enterprise Transport Operations & Fleet Management'}</p>
                    <p className="text-xs text-slate-600 mt-1">{settings?.address || 'No. 142/B, High Level Road, Nugegoda, Sri Lanka'}</p>
                    <p className="text-xs text-slate-600">
                      Hotline: <span className="font-semibold">{settings?.phone || '+94 11 234 5678'}</span> | Email: <span className="font-semibold">{settings?.email || 'operations@fleetflowlanka.lk'}</span>
                    </p>
                    {(settings?.vatNumber || settings?.brNumber) && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {settings.vatNumber && <span>VAT/Tax: <strong>{settings.vatNumber}</strong> </span>}
                        {settings.brNumber && <span>| BR Reg: <strong>{settings.brNumber}</strong></span>}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-md mb-2">
                    Tax Invoice
                  </span>
                  <h2 className="text-xl font-mono font-black text-slate-900">{viewingInvoice.invoiceNumber}</h2>
                  <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                    <p>Issue Date: <strong className="text-slate-900">{new Date(viewingInvoice.issueDate).toLocaleDateString()}</strong></p>
                    <p>Due Date: <strong className="text-slate-900">{new Date(viewingInvoice.dueDate).toLocaleDateString()}</strong></p>
                    <p>
                      Status:{' '}
                      <span className={`font-bold ${viewingInvoice.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {viewingInvoice.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Billed To (Client):</span>
                  <p className="text-sm font-bold text-slate-900">{viewingInvoice.customerName}</p>
                  <p className="text-slate-600 mt-0.5">{viewingInvoice.customerAddress || 'Colombo, Sri Lanka'}</p>
                  <p className="text-slate-600">Phone: <span className="font-semibold text-slate-800">{viewingInvoice.customerPhone || 'N/A'}</span></p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Invoice Reference:</span>
                  {viewingInvoice.projectName && <p className="text-slate-700">Project: <strong>{viewingInvoice.projectName}</strong></p>}
                  {viewingInvoice.items?.[0]?.vehicleReg && (
                    <p className="text-slate-700">Assigned Vehicle: <strong>{viewingInvoice.items[0].vehicleReg}</strong></p>
                  )}
                  <p className="text-slate-700">Currency: <strong>{settings?.currency || 'LKR'} (Rs.)</strong></p>
                  <p className="text-slate-500 text-[11px] mt-1">Payment Method: Official Direct Bank Deposit / Transfer</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Description / Service</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price (Rs.)</th>
                      <th className="p-3 text-right">Total (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(viewingInvoice.items || []).map((it: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{it.description}</td>
                        <td className="p-3 font-mono text-slate-600">{it.vehicleReg || 'N/A'}</td>
                        <td className="p-3 text-right font-medium text-slate-700">{it.quantity}</td>
                        <td className="p-3 text-right font-medium text-slate-700">Rs. {Number(it.unitPrice || 0).toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-slate-900">Rs. {Number(it.total || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="sm:max-w-md w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                    Bank Remittance & Deposit Details:
                  </span>
                  <p className="whitespace-pre-line text-slate-600 font-mono text-[11px] leading-relaxed">
                    {settings?.bankAccountDetails ||
                      'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: Transport & Tourism'}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    * Please state your invoice number as the payment reference when making deposit or online transfer.
                  </p>
                </div>

                <div className="w-full sm:w-72 space-y-2 text-xs">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">Rs. {Number(viewingInvoice.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {viewingInvoice.taxAmount > 0 && (
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>VAT / Tax:</span>
                      <span className="font-semibold text-slate-900">Rs. {Number(viewingInvoice.taxAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span>Rs. {Number(viewingInvoice.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-600 font-medium">
                    <span>Amount Paid:</span>
                    <span>Rs. {Number(viewingInvoice.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-base font-black text-rose-600">
                    <span>Balance Due:</span>
                    <span>Rs. {Number(viewingInvoice.balanceDue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-200 text-xs">
                <div>
                  <div className="border-b border-dashed border-slate-300 h-10 w-48 mb-2"></div>
                  <p className="font-bold text-slate-800">Prepared By</p>
                  <p className="text-slate-400 text-[10px]">Operations & Billing Desk</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="border-b border-dashed border-slate-300 h-10 w-48 mb-2"></div>
                  <p className="font-bold text-slate-800">Authorized Signature & Seal</p>
                  <p className="text-slate-400 text-[10px]">{settings?.companyName || 'Transport & Tourism'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Specific CSS to only print the invoice sheet cleanly */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
            border: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

