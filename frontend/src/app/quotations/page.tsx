'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileCheck2, Plus, Search, Trash2, Edit2, FileDown, CheckCircle, ArrowRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);

  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    issueDate: '',
    validUntil: '',
    description: 'Round-trip Passenger Transport Service (Colombo to Kandy)',
    vehicleType: 'Van (KDH High Roof)',
    quantity: 1,
    unitPrice: 28000,
    discount: 0,
    terms: '50% advance required to confirm booking. Cancellation fee applies within 24h.',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, cRes, settingsRes] = await Promise.all([
        fetch(`/api/quotations?search=${encodeURIComponent(search)}`),
        fetch('/api/customers'),
        fetch('/api/settings'),
      ]);
      const [qData, cData, settingsData] = await Promise.all([
        qRes.json(),
        cRes.json(),
        settingsRes.json(),
      ]);
      if (qData.success) setQuotations(qData.data);
      if (cData.success) setCustomers(cData.data);
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
    setEditingQuotation(null);
    const defCust = customers[0];
    setFormData({
      customer: defCust?._id || '',
      customerName: defCust?.name || '',
      customerPhone: defCust?.phone || '',
      customerEmail: defCust?.email || '',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '3-Day Southern Coastal Round Tour (Van KDH Dual AC)',
      vehicleType: 'Van',
      quantity: 1,
      unitPrice: 55000,
      discount: 2500,
      terms: '50% advance required upon confirmation. Highway tolls included.',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleConvertToBooking = async (id: string, qNum: string) => {
    if (!confirm(`Convert Quotation ${qNum} into a confirmed Booking?`)) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convertToBooking: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, qNum: string) => {
    if (!confirm(`Are you sure you want to delete quotation ${qNum}?`)) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
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
      const method = editingQuotation ? 'PUT' : 'POST';
      const url = editingQuotation ? `/api/quotations/${editingQuotation._id}` : '/api/quotations';

      const payload = {
        customer: formData.customer,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        issueDate: formData.issueDate,
        validUntil: formData.validUntil,
        items: [
          {
            description: formData.description,
            vehicleType: formData.vehicleType,
            quantity: Number(formData.quantity) || 1,
            unitPrice: Number(formData.unitPrice),
            total: (Number(formData.quantity) || 1) * Number(formData.unitPrice),
          },
        ],
        subtotal: (Number(formData.quantity) || 1) * Number(formData.unitPrice),
        discount: Number(formData.discount) || 0,
        totalAmount: Math.max(
          0,
          (Number(formData.quantity) || 1) * Number(formData.unitPrice) - (Number(formData.discount) || 0)
        ),
        terms: formData.terms,
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

  // Download Quotation PDF with Company Logo
  const downloadQuotationPDF = (q: any) => {
    const doc = new jsPDF();

    let startX = 14;
    const hasLogo = Boolean(settings?.logoUrl && settings.logoUrl.startsWith('data:image'));

    if (hasLogo) {
      try {
        const isPng = settings.logoUrl.startsWith('data:image/png');
        const format = isPng ? 'PNG' : 'JPEG';
        doc.addImage(settings.logoUrl, format, 14, 11, 28, 22);
        startX = 46;
      } catch (err) {
        console.warn('Could not add logo to Quotation PDF:', err);
      }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(settings?.companyName || 'Transport & Tourism', startX, 18);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(settings?.tagline || 'Transport Quotation & Hire Estimate', startX, 24);
    doc.text(`${settings?.address || 'No 142/B, High Level Road, Nugegoda, Sri Lanka'} | ${settings?.phone || '+94 11 234 5678'}`, startX, 29);

    doc.setDrawColor(220);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`QUOTATION: ${q.quotationNumber}`, 14, 48);

    doc.setFontSize(9);
    doc.text(`Prepared For: ${q.customerName} (${q.customerPhone})`, 14, 54);
    doc.text(`Date: ${new Date(q.issueDate).toLocaleDateString()}`, 14, 60);
    doc.text(`Valid Until: ${new Date(q.validUntil).toLocaleDateString()}`, 14, 66);

    const rows = (q.items || []).map((it: any) => [
      it.description,
      it.vehicleType,
      it.quantity,
      `Rs. ${it.unitPrice?.toLocaleString()}`,
      `Rs. ${it.total?.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 74,
      head: [['Service Route / Package', 'Vehicle Type', 'Qty', 'Unit Rate', 'Total']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${q.subtotal?.toLocaleString()}`, 140, finalY);
    if (q.discount > 0) {
      doc.text(`Discount: - Rs. ${q.discount?.toLocaleString()}`, 140, finalY + 6);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Estimate: Rs. ${q.totalAmount?.toLocaleString()} LKR`, 140, finalY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Terms & Conditions:\n${q.terms || 'Valid for 14 days from issue date.'}`, 14, finalY + 25);

    doc.save(`${q.quotationNumber}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotations & Rate Estimates</h1>
            <p className="text-sm text-slate-500">
              Prepare professional quotations, download client PDF proposals & convert accepted quotes to bookings
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Create Quotation</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Quotation #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Service Route</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Loading quotations...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No quotations found. Click "Create Quotation" to prepare one.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{q.quotationNumber}</td>
                      <td className="p-4 font-semibold text-slate-900">{q.customerName}</td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        Until {new Date(q.validUntil).toLocaleDateString()}
                      </td>
                      <td className="p-4 max-w-xs truncate text-xs text-slate-800 font-medium">
                        {q.items[0]?.description}
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-600">
                        Rs. {q.totalAmount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            q.status === 'Converted'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : q.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        {q.status !== 'Converted' && (
                          <button
                            onClick={() => handleConvertToBooking(q._id, q.quotationNumber)}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold hover:bg-indigo-100"
                            title="Convert to Booking"
                          >
                            +To Booking
                          </button>
                        )}
                        <button
                          onClick={() => downloadQuotationPDF(q)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id, q.quotationNumber)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Quotation"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Create Transport Quotation</h2>
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
                        customerEmail: c?.email || '',
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Car">Car (Sedan)</option>
                    <option value="Van">Van (KDH / HiAce)</option>
                    <option value="Bus">Bus (Rosa / Coaster)</option>
                    <option value="SUV">SUV (Prado / Montero)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estimated Rate (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount (Rs.)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Route / Scope *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                ></textarea>
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
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
