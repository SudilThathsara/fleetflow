'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  DollarSign,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Plus,
  CheckCircle,
  CreditCard,
  Printer,
  X,
  History,
  TrendingDown,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function DriverPayrollPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'advances'>('register');
  const [payrollMonth, setPayrollMonth] = useState('2026-04');
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [advances, setAdvances] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Advance Modal State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    driver: '',
    driverName: '',
    amount: 10000,
    paymentMethod: 'Cash',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Payslip Modal State
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    driverId: '',
    driverName: '',
    amount: 0,
    paymentReference: 'Bank Transfer - Commercial Bank',
    notes: '',
  });

  useEffect(() => {
    fetchDrivers();
    fetchAdvances();
    handleGeneratePayroll(payrollMonth);
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data);
        if (data.data.length > 0) {
          setAdvanceForm((prev) => ({
            ...prev,
            driver: data.data[0]._id,
            driverName: data.data[0].fullName,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdvances = async () => {
    try {
      const res = await fetch('/api/driver-payments/advances');
      const data = await res.json();
      if (data.success) setAdvances(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePayroll = async (month: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthYear: month }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPeriod(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePayroll = async () => {
    if (!currentPeriod) return;
    if (!confirm(`Finalize and lock payroll for ${currentPeriod.monthYear}? This will update the driver advance ledger.`)) return;

    try {
      const res = await fetch(`/api/payroll/${currentPeriod._id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Super Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPeriod(data.data);
        fetchAdvances();
        alert('Payroll finalized successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDriver = drivers.find((d) => d._id === advanceForm.driver);
      const payload = {
        ...advanceForm,
        driverName: selectedDriver?.fullName || advanceForm.driverName,
      };

      const res = await fetch('/api/driver-payments/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdvanceModalOpen(false);
        fetchAdvances();
        handleGeneratePayroll(payrollMonth);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !paymentForm.driverId) return;

    try {
      const res = await fetch(`/api/payroll/${currentPeriod._id}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentModalOpen(false);
        setCurrentPeriod(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openPaymentModal = (entry: any) => {
    setPaymentForm({
      driverId: entry.driver?._id || entry.driver,
      driverName: entry.driverName,
      amount: entry.remainingBalance || entry.netSalary,
      paymentReference: 'Commercial Bank Online Transfer',
      notes: `Salary payment for ${currentPeriod?.monthYear}`,
    });
    setIsPaymentModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="text-blue-600" /> Driver Payroll & EPF/ETF Settlement
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sri Lankan statutory compliance (8% employee EPF, 12% employer EPF, 3% employer ETF), overtime and advance ledger
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Payroll Register
              </button>
              <button
                onClick={() => setActiveTab('advances')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'advances'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Driver Advances ({advances.length})
              </button>
            </div>

            {activeTab === 'advances' && (
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={18} /> Issue Advance
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Monthly Payroll Register */}
        {activeTab === 'register' && (
          <div className="space-y-6">
            {/* Control Bar: Month Selector & Action */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Payroll Month:</label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => {
                    setPayrollMonth(e.target.value);
                    handleGeneratePayroll(e.target.value);
                  }}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
                <button
                  onClick={() => handleGeneratePayroll(payrollMonth)}
                  disabled={loading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  {loading ? 'Calculating...' : 'Recalculate'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    currentPeriod?.status === 'Finalized'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentPeriod?.status === 'Paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {currentPeriod?.status || 'Draft'}
                </span>

                {currentPeriod?.status === 'Draft' && (
                  <button
                    onClick={handleFinalizePayroll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle size={15} /> Finalize Payroll & Deduct Advances
                  </button>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            {currentPeriod && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] text-slate-500 font-medium">Total Gross Earnings</p>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    LKR {Number(currentPeriod.totalGross || 0).toLocaleString()}
                  </h4>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
                  <p className="text-[11px] text-rose-700 font-medium">Employee EPF (8%)</p>
                  <h4 className="text-base font-bold text-rose-700 mt-0.5">
                    - LKR {Number(currentPeriod.totalEmployeeEpf || 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-400">Deducted from salary</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] text-slate-500 font-medium">Advances Deducted</p>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    - LKR {Number(currentPeriod.totalAdvancesDeducted || 0).toLocaleString()}
                  </h4>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
                  <p className="text-[11px] text-blue-700 font-bold">Total Net Payable</p>
                  <h4 className="text-base font-bold text-blue-800 mt-0.5">
                    LKR {Number(currentPeriod.totalNetSalary || 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-500">To driver bank accounts</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50/20">
                  <p className="text-[11px] text-indigo-700 font-medium">Employer EPF (12%)</p>
                  <h4 className="text-base font-bold text-indigo-800 mt-0.5">
                    + LKR {Number(currentPeriod.totalEmployerEpf || 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-400">Employer expense</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
                  <p className="text-[11px] text-emerald-700 font-medium">Employer ETF (3%)</p>
                  <h4 className="text-base font-bold text-emerald-800 mt-0.5">
                    + LKR {Number(currentPeriod.totalEmployerEtf || 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-400">Employer expense</p>
                </div>
              </div>
            )}

            {/* Payroll Register Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Employee Monthly Payroll Register — {payrollMonth}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculations reflect Sri Lankan statutory contributions and approved driver allowances
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Driver Name & EPF</th>
                      <th className="p-3 text-right">Basic Salary</th>
                      <th className="p-3 text-right">OT Earnings</th>
                      <th className="p-3 text-right">Allowances</th>
                      <th className="p-3 text-right">Gross Pay</th>
                      <th className="p-3 text-right text-rose-700">8% EPF (Ded.)</th>
                      <th className="p-3 text-right">Advance Ded.</th>
                      <th className="p-3 text-right font-bold text-blue-900">Net Salary</th>
                      <th className="p-3 text-right text-indigo-700">12% EPF (Co.)</th>
                      <th className="p-3 text-right text-emerald-700">3% ETF (Co.)</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPeriod?.entries?.map((entry: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900">{entry.driverName}</span>
                          <span className="block text-[11px] font-mono text-slate-500">
                            {entry.epfNumber || 'No EPF Num'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {Number(entry.basicSalary).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {entry.overtimeHours > 0 ? (
                            <span>
                              {Number(entry.overtimeEarnings).toLocaleString()}
                              <span className="block text-[10px] text-slate-400">({entry.overtimeHours} hrs)</span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {entry.allowances > 0 ? Number(entry.allowances).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-900">
                          {Number(entry.grossEarnings).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-700 font-semibold bg-rose-50/30">
                          - {Number(entry.employeeEpfDeduction).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600">
                          {entry.advancesDeducted > 0 ? `- ${Number(entry.advancesDeducted).toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-blue-900 text-sm bg-blue-50/30">
                          LKR {Number(entry.netSalary).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-indigo-700">
                          +{Number(entry.employerEpfContribution).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700">
                          +{Number(entry.employerEtfContribution).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : entry.paymentStatus === 'Partially Paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {entry.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setIsPayslipModalOpen(true);
                              }}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition-colors"
                              title="View Payslip"
                            >
                              Payslip
                            </button>
                            {entry.paymentStatus !== 'Paid' && (
                              <button
                                onClick={() => openPaymentModal(entry)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold border border-emerald-200 transition-colors"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Driver Advances Ledger */}
        {activeTab === 'advances' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Driver Advances & Repayment Ledger</h3>
                <p className="text-xs text-slate-500">
                  Track salary advances granted to drivers, repayments recovered, and outstanding balances
                </p>
              </div>
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} /> Issue Advance
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Advance ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Driver Name</th>
                    <th className="p-3 text-right">Advance Amount</th>
                    <th className="p-3 text-right">Recovered</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advances.map((adv) => (
                    <tr key={adv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{adv.advanceId}</td>
                      <td className="p-3 text-slate-600">
                        {adv.date ? new Date(adv.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{adv.driverName}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        LKR {Number(adv.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-emerald-700 font-medium">
                        LKR {Number(adv.appliedAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-700 font-mono">
                        LKR {Number(adv.remainingBalance || 0).toLocaleString()}
                      </td>
                      <td className="p-3">{adv.paymentMethod}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adv.status === 'Fully Applied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adv.status === 'Partially Applied'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {adv.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{adv.reason}</td>
                    </tr>
                  ))}
                  {advances.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No driver advances recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Issue Driver Advance */}
        {isAdvanceModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Issue Driver Salary Advance</h3>
                <button onClick={() => setIsAdvanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveAdvance} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Driver *</label>
                  <select
                    required
                    value={advanceForm.driver}
                    onChange={(e) => {
                      const d = drivers.find((item) => item._id === e.target.value);
                      setAdvanceForm({
                        ...advanceForm,
                        driver: e.target.value,
                        driverName: d?.fullName || '',
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.driverId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={advanceForm.amount}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={advanceForm.date}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={advanceForm.paymentMethod}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Advance *</label>
                  <textarea
                    required
                    rows={2}
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    placeholder="e.g. Medical emergency, urgent travel"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAdvanceModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Save Advance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Individual Driver Payslip */}
        {isPayslipModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
                <div>
                  <h3 className="font-bold text-lg">Official Employee Pay Sheet</h3>
                  <p className="text-xs text-slate-400">FleetFlow Lanka Tourism & Transport Services</p>
                </div>
                <button
                  onClick={() => setIsPayslipModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{selectedEntry.driverName}</h4>
                    <p className="text-xs text-slate-500 font-mono">EPF Reg: {selectedEntry.epfNumber || 'EPF/COL/4521'}</p>
                    <p className="text-xs text-slate-500">Employment: {selectedEntry.employmentType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                      Month: {currentPeriod?.monthYear}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Earnings */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                      Earnings
                    </h5>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Basic Salary:</span>
                      <strong>LKR {Number(selectedEntry.basicSalary).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Overtime ({selectedEntry.overtimeHours} hrs):</span>
                      <strong>LKR {Number(selectedEntry.overtimeEarnings).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Fixed Allowances:</span>
                      <strong>LKR {Number(selectedEntry.allowances).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Gross Pay:</span>
                      <span>LKR {Number(selectedEntry.grossEarnings).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <h5 className="font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                      Deductions
                    </h5>
                    <div className="flex justify-between py-0.5 text-rose-700">
                      <span>Employee EPF (8%):</span>
                      <strong>- LKR {Number(selectedEntry.employeeEpfDeduction).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>Advance Recovered:</span>
                      <strong>- LKR {Number(selectedEntry.advancesDeducted).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>Other Deductions:</span>
                      <strong>LKR 0.00</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-rose-700">
                      <span>Total Deductions:</span>
                      <span>
                        - LKR {Number(selectedEntry.employeeEpfDeduction + selectedEntry.advancesDeducted).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Highlight */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs text-blue-700 font-semibold uppercase">Net Take-Home Pay</span>
                    <h3 className="text-2xl font-bold text-blue-950 mt-0.5">
                      LKR {Number(selectedEntry.netSalary).toLocaleString()}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedEntry.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedEntry.paymentStatus}
                  </span>
                </div>

                {/* Employer Statutory Contributions */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <h6 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Employer Contributions (Not deducted from driver)
                  </h6>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer EPF (12%):</span>
                    <strong className="text-indigo-800">LKR {Number(selectedEntry.employerEpfContribution).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Employer ETF (3%):</span>
                    <strong className="text-emerald-800">LKR {Number(selectedEntry.employerEtfContribution).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-900 font-semibold pt-1 border-t border-slate-200">
                    <span>Total Employer Payroll Cost:</span>
                    <span>LKR {Number(selectedEntry.totalEmployerCost).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer size={15} /> Print Paysheet
                  </button>
                  <button
                    onClick={() => setIsPayslipModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Record Salary Payment */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Record Driver Salary Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver</label>
                  <input
                    type="text"
                    disabled
                    value={paymentForm.driverName}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Reference / Bank Details *</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.paymentReference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                    placeholder="e.g. Commercial Bank Transfer Ref #987654"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
