'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  FileCheck2,
  Plus,
  Search,
  Building2,
  Car,
  History,
  TrendingUp,
  Clock,
  Fuel,
  CheckCircle,
  AlertTriangle,
  X,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ContractsAndRatesPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Rate Revision Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [rateForm, setRateForm] = useState({
    monthlyBasicHireRate: 250000,
    includedMonthlyKm: 3000,
    extraKmRate: 100,
    driverServiceIncluded: true,
    driverMonthlyRate: 0,
    fuelIncluded: false,
    fuelReimbursementMethod: 'Customer Provides Fuel or Reimbursed at Actuals',
    normalWorkingHours: 8,
    overtimeHourlyRate: 600,
    changeReason: '',
    approvedBy: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  // New Contract Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractForm, setContractForm] = useState({
    contractNumber: '',
    customerCompany: '',
    project: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    monthlyBasicHireRate: 250000,
    includedMonthlyKm: 3000,
    extraKmRate: 100,
    overtimeHourlyRate: 600,
    driverServiceIncluded: true,
    fuelIncluded: false,
    selectedVehicles: [] as string[],
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, compRes, pRes, vRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/companies'),
        fetch('/api/projects'),
        fetch('/api/vehicles'),
      ]);
      const [cData, compData, pData, vData] = await Promise.all([
        cRes.json(),
        compRes.json(),
        pRes.json(),
        vRes.json(),
      ]);

      if (cData.success) setContracts(cData.data);
      if (compData.success) setCompanies(compData.data);
      if (pData.success) setProjects(pData.data);
      if (vData.success) setVehicles(vData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRateAmendment = (contract: any) => {
    setSelectedContract(contract);
    const rc = contract.rateCard || {};
    setRateForm({
      monthlyBasicHireRate: rc.monthlyBasicHireRate || 250000,
      includedMonthlyKm: rc.includedMonthlyKm || 3000,
      extraKmRate: rc.extraKmRate || 100,
      driverServiceIncluded: rc.driverServiceIncluded !== false,
      driverMonthlyRate: rc.driverMonthlyRate || 0,
      fuelIncluded: !!rc.fuelIncluded,
      fuelReimbursementMethod: rc.fuelReimbursementMethod || 'Customer Provides Fuel or Reimbursed at Actuals',
      normalWorkingHours: rc.normalWorkingHours || 8,
      overtimeHourlyRate: rc.overtimeHourlyRate || 600,
      changeReason: '',
      approvedBy: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
    setIsRateModalOpen(true);
  };

  const handleSaveRateAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    try {
      const res = await fetch(`/api/contracts/${selectedContract._id}/rate-versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsRateModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Error updating rate version');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNewContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const company = companies.find((c) => c._id === contractForm.customerCompany);
      const project = projects.find((p) => p._id === contractForm.project);

      const assignedVehicles = contractForm.selectedVehicles.map((reg) => {
        const v = vehicles.find((item) => item.registrationNumber === reg);
        return {
          vehicle: v?._id,
          registrationNumber: reg,
          vehicleCategory: v?.vehicleType || 'Double Cab',
          ownershipType: v?.ownershipType || 'Business-owned',
        };
      });

      const payload = {
        contractNumber: contractForm.contractNumber,
        customerCompany: contractForm.customerCompany,
        companyName: company?.name || '',
        project: contractForm.project,
        projectName: project?.name || '',
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        assignedVehicles,
        rateCard: {
          version: 1,
          effectiveFrom: contractForm.startDate,
          monthlyBasicHireRate: Number(contractForm.monthlyBasicHireRate),
          includedMonthlyKm: Number(contractForm.includedMonthlyKm),
          extraKmRate: Number(contractForm.extraKmRate),
          driverServiceIncluded: contractForm.driverServiceIncluded,
          fuelIncluded: contractForm.fuelIncluded,
          overtimeHourlyRate: Number(contractForm.overtimeHourlyRate),
        },
        notes: contractForm.notes,
      };

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsContractModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Error creating agreement');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContracts = contracts.filter(
    (c) =>
      c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="text-blue-600" /> Annual Agreements & Commercial Rate Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Maintain customer service agreements, standard 3,000 km monthly allowances, and effective-dated rate versions
            </p>
          </div>

          <button
            onClick={() => {
              setContractForm({
                contractNumber: `AGR/FF/${new Date().getFullYear()}/${String(contracts.length + 1).padStart(2, '0')}`,
                customerCompany: companies[0]?._id || '',
                project: projects[0]?._id || '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                monthlyBasicHireRate: 250000,
                includedMonthlyKm: 3000,
                extraKmRate: 100,
                overtimeHourlyRate: 600,
                driverServiceIncluded: true,
                fuelIncluded: false,
                selectedVehicles: [],
                notes: '',
              });
              setIsContractModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={18} /> New Annual Agreement
          </button>
        </div>

        {/* 3000 KM Allowance Highlight Box */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Corporate Standard Billing Rule
            </div>
            <h2 className="text-xl font-bold">Standard 3,000 KM Monthly Vehicle Allowance</h2>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              For all annual transport agreements, each assigned vehicle receives an agreed monthly allowance (default: 3,000 km).
              Actual odometer mileage is tracked against running charts. Excess distance is billed at the agreed extra-km rate.
            </p>
          </div>
          <Link
            href="/billing-engine"
            className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow shrink-0 flex items-center gap-2"
          >
            Open Billing Engine <ArrowRight size={16} />
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by agreement number, customer company, or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Agreements Grid */}
        <div className="space-y-6">
          {filteredContracts.map((c) => {
            const rc = c.rateCard || {};
            const versions = c.rateVersions || [rc];

            return (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all"
              >
                {/* Header Banner */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
                        {c.contractNumber}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {c.status || 'Active'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Effective: {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mt-2">{c.companyName}</h2>
                    <p className="text-sm text-blue-600 font-medium">Project: {c.projectName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRateAmendment(c)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <TrendingUp size={14} /> Amend Rates (v{rc.version || 1})
                    </button>
                    <Link
                      href={`/billing-engine?contractId=${c._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      Calculate Monthly Bill
                    </Link>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Commercial Rate Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-blue-600" /> Active Commercial Rates (v{rc.version || 1})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Since {rc.effectiveFrom ? new Date(rc.effectiveFrom).toLocaleDateString() : 'Start'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Monthly Basic Hire:</span>
                        <strong className="text-slate-900 font-bold text-sm">
                          LKR {Number(rc.monthlyBasicHireRate || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100 bg-blue-50/50 px-2 rounded">
                        <span className="text-blue-900 font-medium">Included KM Allowance:</span>
                        <strong className="text-blue-900 font-bold">
                          {Number(rc.includedMonthlyKm || 3000).toLocaleString()} KM / mo
                        </strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Extra Kilometre Rate:</span>
                        <strong className="text-slate-900">
                          LKR {rc.extraKmRate || 100} / km
                        </strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Driver Overtime Rate:</span>
                        <strong className="text-slate-900">
                          LKR {rc.overtimeHourlyRate || 600} / hour
                        </strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Driver Service:</span>
                        <strong className={rc.driverServiceIncluded ? 'text-emerald-700' : 'text-slate-700'}>
                          {rc.driverServiceIncluded ? '✓ Included in Hire' : `Charged: LKR ${rc.driverMonthlyRate}/mo`}
                        </strong>
                      </div>

                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Fuel Arrangement:</span>
                        <strong className="text-slate-700 text-right max-w-xs sm:max-w-[180px] break-words">
                          {rc.fuelIncluded ? '✓ Included in Basic Hire' : rc.fuelReimbursementMethod || 'Customer Provides / Reimbursed'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Assigned Vehicles */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Car size={14} className="text-indigo-600" /> Assigned Vehicles ({c.assignedVehicles?.length || 0})
                    </h4>

                    <div className="space-y-2">
                      {c.assignedVehicles && c.assignedVehicles.length > 0 ? (
                        c.assignedVehicles.map((v: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-mono font-bold text-slate-800">{v.registrationNumber}</p>
                              <p className="text-[11px] text-slate-500">{v.vehicleCategory || 'Double Cab'}</p>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                v.ownershipType === 'Business-owned'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {v.ownershipType}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No vehicles assigned to agreement</p>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Rate Card Version History (Audit Trail) */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <History size={14} className="text-amber-600" /> Rate Version Audit History ({versions.length})
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {versions.map((ver: any, vIdx: number) => (
                        <div
                          key={vIdx}
                          className="p-2 bg-white rounded border border-slate-200 text-xs space-y-0.5"
                        >
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-blue-700">Version {ver.version || vIdx + 1}</span>
                            <span className="text-[10px] text-slate-400">
                              {ver.effectiveFrom ? new Date(ver.effectiveFrom).toLocaleDateString() : 'Original'}
                            </span>
                          </div>
                          <p className="text-slate-800">
                            Base: <strong>LKR {Number(ver.monthlyBasicHireRate || 0).toLocaleString()}</strong> | Extra: LKR {ver.extraKmRate}/km
                          </p>
                          {ver.changeReason && (
                            <p className="text-[10px] text-slate-500 italic">Reason: {ver.changeReason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Amend Commercial Rates */}
        {isRateModalOpen && selectedContract && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Amend Commercial Rates (Effective Dated)</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedContract.contractNumber}</p>
                </div>
                <button
                  onClick={() => setIsRateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRateAmendment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                  <strong>Audited Rate Revision:</strong> Adding a new rate version applies from the specified effective date onward.
                  All historical monthly invoices remain completely untouched and immutable.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date *</label>
                    <input
                      type="date"
                      required
                      value={rateForm.effectiveFrom}
                      onChange={(e) => setRateForm({ ...rateForm, effectiveFrom: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Basic Hire (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={rateForm.monthlyBasicHireRate}
                      onChange={(e) => setRateForm({ ...rateForm, monthlyBasicHireRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Included Monthly KM Allowance *</label>
                    <input
                      type="number"
                      required
                      value={rateForm.includedMonthlyKm}
                      onChange={(e) => setRateForm({ ...rateForm, includedMonthlyKm: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Extra KM Rate (LKR/km) *</label>
                    <input
                      type="number"
                      required
                      value={rateForm.extraKmRate}
                      onChange={(e) => setRateForm({ ...rateForm, extraKmRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Overtime Rate (LKR/hr) *</label>
                    <input
                      type="number"
                      required
                      value={rateForm.overtimeHourlyRate}
                      onChange={(e) => setRateForm({ ...rateForm, overtimeHourlyRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
                    <input
                      type="text"
                      value={rateForm.approvedBy}
                      onChange={(e) => setRateForm({ ...rateForm, approvedBy: e.target.value })}
                      placeholder="e.g. Director / Finance Approval"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rate Revision *</label>
                  <textarea
                    required
                    rows={2}
                    value={rateForm.changeReason}
                    onChange={(e) => setRateForm({ ...rateForm, changeReason: e.target.value })}
                    placeholder="e.g. Fuel price revision, annual contract extension rate indexation"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    Save Rate Amendment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Annual Contract */}
        {isContractModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Create New Annual Transport Agreement</h3>
                <button
                  onClick={() => setIsContractModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveNewContract} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Number *</label>
                    <input
                      type="text"
                      required
                      value={contractForm.contractNumber}
                      onChange={(e) => setContractForm({ ...contractForm, contractNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Company *</label>
                    <select
                      required
                      value={contractForm.customerCompany}
                      onChange={(e) => {
                        const compId = e.target.value;
                        const relatedProj = projects.find((p) => (p.customerCompany?._id || p.customerCompany) === compId);
                        setContractForm({
                          ...contractForm,
                          customerCompany: compId,
                          project: relatedProj?._id || '',
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Company...</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project *</label>
                  <select
                    required
                    value={contractForm.project}
                    onChange={(e) => setContractForm({ ...contractForm, project: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Project...</option>
                    {projects
                      .filter((p) => !contractForm.customerCompany || (p.customerCompany?._id || p.customerCompany) === contractForm.customerCompany)
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={contractForm.startDate}
                      onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={contractForm.endDate}
                      onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Basic (LKR)</label>
                    <input
                      type="number"
                      required
                      value={contractForm.monthlyBasicHireRate}
                      onChange={(e) => setContractForm({ ...contractForm, monthlyBasicHireRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Included KM</label>
                    <input
                      type="number"
                      required
                      value={contractForm.includedMonthlyKm}
                      onChange={(e) => setContractForm({ ...contractForm, includedMonthlyKm: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Extra KM (LKR)</label>
                    <input
                      type="number"
                      required
                      value={contractForm.extraKmRate}
                      onChange={(e) => setContractForm({ ...contractForm, extraKmRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Assign Vehicles */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Fleet Vehicles</label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                    {vehicles.map((v) => {
                      const isSelected = contractForm.selectedVehicles.includes(v.registrationNumber);
                      return (
                        <label
                          key={v._id}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${
                            isSelected ? 'bg-blue-100 text-blue-900 font-semibold' : 'hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContractForm({
                                  ...contractForm,
                                  selectedVehicles: [...contractForm.selectedVehicles, v.registrationNumber],
                                });
                              } else {
                                setContractForm({
                                  ...contractForm,
                                  selectedVehicles: contractForm.selectedVehicles.filter((r) => r !== v.registrationNumber),
                                });
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>
                            {v.registrationNumber} ({v.vehicleType})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsContractModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    Save Agreement
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
