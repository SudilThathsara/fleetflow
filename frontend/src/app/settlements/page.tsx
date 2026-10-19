'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DollarSign, Plus, Search, Trash2, Edit2, AlertCircle, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    driver: '',
    driverName: '',
    periodStart: '',
    periodEnd: '',
    grossEarnings: 65000,
    allowances: 5000,
    deductions: 2000,
    appliedAdvances: 10000,
    paidAmount: 0,
    paymentMethod: 'Cash',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([
        fetch('/api/driver-payments/settlements'),
        fetch('/api/drivers'),
      ]);
      const [sData, dData] = await Promise.all([sRes.json(), dRes.json()]);
      if (sData.success) setSettlements(sData.data);
      if (dData.success) setDrivers(dData.data);
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
    const defD = drivers[0];
    setFormData({
      driver: defD?._id || '',
      driverName: defD?.fullName || '',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      grossEarnings: 72000,
      allowances: 6000,
      deductions: 1500,
      appliedAdvances: 12000,
      paidAmount: 0,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly driver wages, food allowance, less advance deductions',
    });
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (id: string, remaining: number) => {
    const pay = prompt(`Enter payment amount to disburse (Remaining: Rs. ${remaining}):`, remaining.toString());
    if (!pay || isNaN(Number(pay))) return;

    try {
      const res = await fetch(`/api/driver-payments/settlements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addPayment: Number(pay), paymentMethod: 'Cash' }),
      });
      const data = await res.json();
      if (data.success) fetchData();
      else alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, sId: string) => {
    if (!confirm(`Are you sure you want to delete settlement ${sId}?`)) return;
    try {
      const res = await fetch(`/api/driver-payments/settlements/${id}`, { method: 'DELETE' });
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
      const res = await fetch('/api/driver-payments/settlements', {
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

  // Download Driver Settlement Statement PDF
  const downloadSettlementPDF = (s: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('FleetFlow Lanka (Pvt) Ltd', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Driver Settlement & Wage Statement', 14, 26);

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`STATEMENT: ${s.settlementId}`, 14, 44);

    doc.setFontSize(10);
    doc.text(`Driver Name: ${s.driverName}`, 14, 52);
    doc.text(
      `Period: ${new Date(s.periodStart).toLocaleDateString()} to ${new Date(s.periodEnd).toLocaleDateString()}`,
      14,
      58
    );

    const rows = [
      ['Gross Trip Earnings', `Rs. ${s.grossEarnings?.toLocaleString()}`],
      ['Approved Allowances (Food / Night Stay)', `+ Rs. ${s.allowances?.toLocaleString()}`],
      ['Authorized Deductions (Fines / Damages)', `- Rs. ${s.deductions?.toLocaleString()}`],
      ['Applied Advances Recovered', `- Rs. ${s.appliedAdvances?.toLocaleString()}`],
      ['Net Settlement Payable', `Rs. ${s.netPayable?.toLocaleString()}`],
      ['Disbursed Paid Amount', `Rs. ${s.paidAmount?.toLocaleString()}`],
      ['Remaining Balance Due', `Rs. ${s.remainingBalance?.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 66,
      head: [['Component', 'Amount (LKR)']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.text('Driver Signature: _______________________', 14, finalY);
    doc.text('Operations Approval: _______________________', 120, finalY);

    doc.save(`${s.settlementId}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Driver Payments & Settlements</h1>
            <p className="text-sm text-slate-500">
              Calculate driver earnings from trips, deduct advances, grant allowances & generate pay statements
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Calculate Settlement</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Settlement ID</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-right">Gross</th>
                  <th className="p-4 text-right">Advances</th>
                  <th className="p-4 text-right">Net Payable</th>
                  <th className="p-4 text-right">Paid</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                      Loading settlements...
                    </td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No driver settlements logged. Click "Calculate Settlement" to create one.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{s.settlementId}</td>
                      <td className="p-4 font-semibold text-slate-900">{s.driverName}</td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        {new Date(s.periodStart).toLocaleDateString()} -{' '}
                        {new Date(s.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right font-medium">Rs. {s.grossEarnings?.toLocaleString()}</td>
                      <td className="p-4 text-right text-rose-600 font-medium">
                        - Rs. {s.appliedAdvances?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        Rs. {s.netPayable?.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-emerald-600">
                        Rs. {s.paidAmount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            s.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.status === 'Partially Paid'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        {s.remainingBalance > 0 && (
                          <button
                            onClick={() => handleRecordPayment(s._id, s.remainingBalance)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => downloadSettlementPDF(s)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download Statement"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.settlementId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Settlement"
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

      {/* Settlement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Calculate Driver Settlement</h2>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driver *</label>
                  <select
                    required
                    value={formData.driver}
                    onChange={(e) => {
                      const d = drivers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        driver: e.target.value,
                        driverName: d?.fullName || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gross Trip Earnings (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.grossEarnings}
                    onChange={(e) => setFormData({ ...formData, grossEarnings: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={formData.periodStart}
                    onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={formData.periodEnd}
                    onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Approved Allowances (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Authorized Deductions (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-rose-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deduct Applied Advances (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.appliedAdvances}
                    onChange={(e) => setFormData({ ...formData, appliedAdvances: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-amber-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Calculated Net Payable
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-base font-extrabold text-blue-600">
                    Rs.{' '}
                    {Math.max(
                      0,
                      Number(formData.grossEarnings) +
                        Number(formData.allowances) -
                        Number(formData.deductions) -
                        Number(formData.appliedAdvances)
                    ).toLocaleString()}
                  </div>
                </div>
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
                  Save Settlement Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
