'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDeleteConfirmation } from '@/components/layout/DeleteConfirmation';
import { Receipt, Plus, Search, Trash2, Edit2, FileDown, CheckCircle, Clock, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoicesPage() {
  const { confirmDelete } = useDeleteConfirmation();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companySettings, setCompanySettings] = useState<any>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

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
      const [invRes, custRes] = await Promise.all([
        fetch(`/api/invoices?search=${encodeURIComponent(search)}`),
        fetch('/api/customers'),
      ]);
      const [invData, custData] = await Promise.all([invRes.json(), custRes.json()]);
      if (invData.success) setInvoices(invData.data);
      if (custData.success) setCustomers(custData.data);
      const settingsRes = await fetch('/api/settings', { cache: 'no-store' });
      const settingsData = await settingsRes.json();
      if (settingsData.success) setCompanySettings(settingsData.data || {});
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
    if (!(await confirmDelete(`Are you sure you want to delete invoice ${num}?`))) return;
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

  // Generate Professional Invoice PDF
  const downloadInvoicePDF = (inv: any) => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(companySettings.companyName || 'FleetFlow Lanka (Pvt) Ltd', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(companySettings.tagline || 'Enterprise Transport Operations & Fleet Management', 14, 26);
    doc.text(companySettings.address || 'No 142/B, High Level Road, Nugegoda, Sri Lanka', 14, 31);
    doc.text(`Tel: ${companySettings.phone || '+94 11 234 5678'} | Email: ${companySettings.email || 'billing@fleetflowlanka.lk'}`, 14, 36);

    doc.setDrawColor(220);
    doc.line(14, 42, 196, 42);

    // Invoice Meta
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`INVOICE: ${inv.invoiceNumber}`, 14, 52);

    doc.setFontSize(9);
    doc.text(`Issue Date: ${new Date(inv.issueDate).toLocaleDateString()}`, 14, 58);
    doc.text(`Due Date: ${new Date(inv.dueDate).toLocaleDateString()}`, 14, 63);

    // Bill To
    doc.text(`Billed To:`, 120, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`${inv.customerName}`, 120, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${inv.customerPhone}`, 120, 63);
    doc.text(`${inv.customerAddress || 'Colombo'}`, 120, 68);

    // Items Table
    const tableData = (inv.items || []).map((it: any) => [
      it.description,
      it.vehicleReg || 'N/A',
      it.quantity,
      `Rs. ${it.unitPrice?.toLocaleString()}`,
      `Rs. ${it.total?.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [['Description / Service', 'Vehicle', 'Qty', 'Unit Price', 'Line Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
    });

    // Summary block
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${inv.subtotal?.toLocaleString()}`, 140, finalY);
    doc.text(`Amount Paid: Rs. ${inv.paidAmount?.toLocaleString()}`, 140, finalY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`Balance Due: Rs. ${inv.balanceDue?.toLocaleString()}`, 140, finalY + 13);

    // Terms
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    const terms = companySettings.terms || 'Payment is due within 30 days.';
    const bankDetails = companySettings.bankAccountDetails || '';
    doc.text(`${terms}${bankDetails ? ` ${bankDetails.replace(/\n/g, ' | ')}` : ''}`, 14, finalY + 25);

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
    </DashboardLayout>
  );
}
