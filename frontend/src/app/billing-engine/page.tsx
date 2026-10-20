'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Calculator,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle,
  Car,
  Clock,
  ArrowRight,
  Receipt,
  Download,
  Calendar,
  Layers,
  History,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function BillingEnginePage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [billingMonth, setBillingMonth] = useState('2026-04');
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // History Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [historyRuns, setHistoryRuns] = useState<any[]>([]);

  useEffect(() => {
    fetchContracts();
    fetchHistory();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setContracts(data.data);
        setSelectedContractId(data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/billing-engine/history');
      const data = await res.json();
      if (data.success) setHistoryRuns(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCalculation = async () => {
    if (!selectedContractId || !billingMonth) return;
    try {
      setCalculating(true);
      setGeneratedInvoice(null);
      const res = await fetch('/api/billing-engine/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContractId, billingMonth }),
      });
      const data = await res.json();
      if (data.success) {
        setCalculationResult(data.data);
      } else {
        alert(data.message || 'Error running calculation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!calculationResult) return;
    try {
      setGeneratingInvoice(true);
      const res = await fetch('/api/billing-engine/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculationData: calculationResult, approvedBy: 'Finance / Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedInvoice(data.data.invoice);
        fetchHistory();
      } else {
        alert(data.message || 'Error generating invoice');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const selectedContract = contracts.find((c) => c._id === selectedContractId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="text-blue-600" /> Monthly Contract Billing Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Automated monthly calculation with 3,000 km vehicle allowance, verified running charts, extra mileage, and overtime charges
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Billing Calculator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Billing Runs & Invoices ({historyRuns.length})
            </button>
          </div>
        </div>

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Control Panel: Contract & Month Selector */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" /> Select Customer Contract & Billing Period
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Agreement / Customer *
                  </label>
                  <select
                    value={selectedContractId}
                    onChange={(e) => {
                      setSelectedContractId(e.target.value);
                      setCalculationResult(null);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {contracts.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.contractNumber} — {c.companyName} ({c.projectName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Month (YYYY-MM) *</label>
                  <input
                    type="month"
                    value={billingMonth}
                    onChange={(e) => {
                      setBillingMonth(e.target.value);
                      setCalculationResult(null);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunCalculation}
                    disabled={calculating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play size={16} />
                    {calculating ? 'Loading Running Charts...' : 'Calculate Monthly Bill'}
                  </button>
                </div>
              </div>

              {selectedContract && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span>Customer: <strong className="text-slate-900">{selectedContract.companyName}</strong></span>
                  <span>Project: <strong className="text-slate-900">{selectedContract.projectName}</strong></span>
                  <span>Monthly Basic: <strong className="text-slate-900">LKR {Number(selectedContract.rateCard?.monthlyBasicHireRate || 0).toLocaleString()}</strong></span>
                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                    Allowance: {selectedContract.rateCard?.includedMonthlyKm || 3000} KM / vehicle
                  </span>
                  <span>Extra Rate: <strong className="text-slate-900">LKR {selectedContract.rateCard?.extraKmRate || 100}/km</strong></span>
                  <span>OT Rate: <strong className="text-slate-900">LKR {selectedContract.rateCard?.overtimeHourlyRate || 600}/hr</strong></span>
                </div>
              )}
            </div>

            {/* Warnings Alert */}
            {calculationResult?.warnings && calculationResult.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle size={18} className="text-amber-600" /> Attention: Operational Notices
                </div>
                {calculationResult.warnings.map((w: string, idx: number) => (
                  <p key={idx} className="text-xs text-amber-800 pl-6">
                    • {w}
                  </p>
                ))}
              </div>
            )}

            {/* Calculation Breakdown Table */}
            {calculationResult && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Calculated Monthly Vehicle Breakdown — {calculationResult.billingMonth}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Formula: Subtotal = Monthly Basic + (Max(0, Actual KM - 3,000 KM) × Extra KM Rate) + (Approved OT × OT Rate)
                    </p>
                  </div>

                  <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700">
                    Rate Card v{calculationResult.rateVersionUsed}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Vehicle</th>
                        <th className="p-3 text-right">Monthly Base</th>
                        <th className="p-3 text-right">Included KM</th>
                        <th className="p-3 text-right">Actual KM</th>
                        <th className="p-3 text-right">Extra KM</th>
                        <th className="p-3 text-right">Extra KM Charge</th>
                        <th className="p-3 text-right">OT Hours</th>
                        <th className="p-3 text-right">OT Charge</th>
                        <th className="p-3 text-right">Line Total (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculationResult.vehicleLines.map((line: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-900">{line.registrationNumber}</span>
                            <span className="block text-[11px] text-slate-500">{line.vehicleCategory}</span>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {Number(line.monthlyBasicHire).toLocaleString()}
                          </td>
                          <td className="p-3 text-right text-slate-500 font-mono">
                            {Number(line.includedKm).toLocaleString()} km
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-slate-800">
                            {Number(line.actualKm).toLocaleString()} km
                          </td>
                          <td className="p-3 text-right font-mono">
                            {line.billableExtraKm > 0 ? (
                              <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                +{Number(line.billableExtraKm).toLocaleString()} km
                              </span>
                            ) : (
                              <span className="text-slate-400">0 km</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {line.extraKmCharge > 0 ? `LKR ${Number(line.extraKmCharge).toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {line.approvedOtHours > 0 ? `${line.approvedOtHours} hrs` : '-'}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-900">
                            {line.otCharge > 0 ? `LKR ${Number(line.otCharge).toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right font-bold text-blue-900 text-sm">
                            LKR {Number(line.lineSubtotal).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary Ribbon */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>• Included mileage resets monthly for each vehicle as agreed in the commercial contract.</p>
                    <p>• Driver services and customer fuel are verified against contractual inclusions.</p>
                    <p>• Generating an official invoice locks these historical rate snapshots permanently.</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[280px] space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Subtotal:</span>
                      <strong className="text-slate-900">LKR {Number(calculationResult.subtotal).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Adjustments / Tax:</span>
                      <span>LKR 0.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Invoice Amount:</span>
                      <span className="text-blue-700">LKR {Number(calculationResult.totalAmount).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={handleGenerateInvoice}
                      disabled={generatingInvoice}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Receipt size={16} />
                      {generatingInvoice ? 'Generating Invoice...' : 'Approve & Issue Official Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Success Alert */}
            {generatedInvoice && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 text-emerald-900 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <CheckCircle className="text-emerald-600" size={24} />
                    Monthly Invoice Issued Successfully!
                  </div>
                  <span className="font-mono font-bold text-sm bg-emerald-200 text-emerald-800 px-3 py-1 rounded">
                    {generatedInvoice.invoiceNumber}
                  </span>
                </div>

                <p className="text-sm">
                  Official invoice has been locked with permanent historical rate snapshots for customer{' '}
                  <strong>{generatedInvoice.customerName}</strong> ({generatedInvoice.projectName}) for billing month{' '}
                  <strong>{generatedInvoice.billingMonth}</strong>.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/invoices`}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Receipt size={14} /> Open Invoices Module
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History of Billing Runs */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Historical Monthly Billing Runs</h2>
              <span className="text-xs text-slate-500 font-medium">All Issued Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Run ID</th>
                    <th className="p-3">Month</th>
                    <th className="p-3">Customer Company</th>
                    <th className="p-3">Project</th>
                    <th className="p-3 text-right">Vehicles</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyRuns.map((run: any) => (
                    <tr key={run._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{run.billingRunId}</td>
                      <td className="p-3 font-semibold text-slate-900">{run.billingMonth}</td>
                      <td className="p-3 font-medium text-slate-800">{run.companyName}</td>
                      <td className="p-3 text-slate-600">{run.projectName}</td>
                      <td className="p-3 text-right font-mono">{run.vehicleLines?.length || 0}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        LKR {Number(run.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {run.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        {run.generatedInvoiceNumber || '—'}
                      </td>
                      <td className="p-3 text-slate-500">{run.approvedBy || 'Admin'}</td>
                    </tr>
                  ))}
                  {historyRuns.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No monthly billing runs generated yet. Use the Billing Calculator tab to compute your first run.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
