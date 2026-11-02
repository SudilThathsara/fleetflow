'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Clock,
  DollarSign,
  Send,
  AlertCircle,
  FileText,
  Briefcase,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function CorporateTransportPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    projectName: '',
    vehicleTypes: 'Double-Cab Pickups & Passenger Vans',
    vehicleCount: 2,
    startDate: '',
    contractDuration: '12 Months (Annual Master Agreement)',
    driverRequirement: 'Experienced Professional Chauffeurs Provided',
    fuelArrangement: 'Client Supplies Fuel directly',
    serviceArea: 'Colombo, Western Province & Project Sites',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/public/quotation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: 'corporate',
          name: formData.contactPerson,
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          serviceCategory: 'Corporate Transport SLA',
          vehicleCategory: formData.vehicleTypes,
          numberOfVehicles: Number(formData.vehicleCount) || 1,
          hireType: 'Monthly',
          startDate: formData.startDate || new Date().toISOString(),
          serviceArea: formData.serviceArea,
          driverRequirement: formData.driverRequirement,
          fuelArrangement: formData.fuelArrangement,
          additionalNotes: `Project: ${formData.projectName} | Duration: ${formData.contractDuration} | ${formData.notes}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedId(data.requestId);
      } else {
        setError(data.message || 'Submission failed. Please check form details.');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Enterprise Fleet Operations
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Corporate Transport & Annual Fleet Solutions
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Dedicated corporate transport agreements, multi-vehicle project fleet deployments, verified running chart auditing, and consolidated monthly VAT invoicing.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Corporate Framework */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Commercial Fleet Governance for Enterprises
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We partner with corporations, international non-profit organizations, telecommunications providers, and infrastructure joint ventures to provide turn-key transport services with fixed budgets and complete legal compliance.
                </p>
              </div>

              {/* Core Offerings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <FileCheck2 size={16} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Annual Master Service Agreements</h3>
                  <p className="text-slate-600 leading-relaxed">
                    12-month renewable contracts locking in preferential monthly rental rates, extra-KM rates, and driver overtime limits for financial predictability.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Briefcase size={16} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Turn-Key Project Mobilization</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Deploy 1 to 20 vehicles simultaneously across highway packages, solar installations, or agricultural operations with centralized coordination.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <DollarSign size={16} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Consolidated VAT Invoicing</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Itemized monthly invoices generated through our automated billing engine. Supports consolidated single invoicing or per-vehicle breakdown on 15 to 30-day payment terms.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Users size={16} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Chauffeur Compliance & HR</h3>
                  <p className="text-slate-600 leading-relaxed">
                    All drivers are statutory EPF/ETF registered employees with verified police clearances, background checks, and regular defensive driving training.
                  </p>
                </div>
              </div>

              {/* Running Chart SLA */}
              <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award size={18} className="text-sky-600" />
                  <span>Strict Operational SLA & Contingency Policies</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Our corporate agreements include mandatory vehicle replacement timeframes (guaranteed replacement within 4 hours in the Western Province, and within 8 hours island-wide). In addition, customers receive direct access to our 24/7 fleet control desk and dedicated account coordinator.
                </p>
              </div>

              {/* Security and Access */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900">Enterprise Customer Portal Privileges:</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Real-time access to digital running chart logs and odometer reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Instant PDF invoice downloads with verifiable tax and statutory breakdowns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Company team multi-user memberships with role-based viewing permissions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Dedicated Corporate Enquiry Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
                {submittedId ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Corporate Enquiry Logged!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Your corporate enquiry reference number is:
                    </p>
                    <div className="py-2 px-4 bg-sky-50 text-sky-800 font-mono font-bold text-base rounded-xl border border-sky-200 inline-block">
                      {submittedId}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Our corporate accounts director will review your project parameters and reach out within 1 business day with formal contract proposals.
                    </p>
                    <button
                      onClick={() => setSubmittedId(null)}
                      className="mt-4 text-xs text-sky-600 font-bold underline"
                    >
                      Submit another corporate inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
                        <Building2 size={13} />
                        <span>Corporate RFP & Fleet Request</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Request Corporate SLA Proposal</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Submit your company requirements to receive custom rate cards.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name *</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Colombo Civil JV / Lanka Power Corp"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Ranil Wickramasinghe"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Work Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+94 11 234 5678"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Official Work Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="operations@company.lk"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Project / Contract Name</label>
                          <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleChange}
                            placeholder="Central Highway Package 2"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Vehicle Category</label>
                          <select
                            name="vehicleTypes"
                            value={formData.vehicleTypes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          >
                            <option value="Double-Cab Pickups (4x4)">Double-Cab Pickups (4x4)</option>
                            <option value="Passenger Vans (Toyota KDH)">Passenger Vans (Toyota KDH)</option>
                            <option value="Sedan / Executive Cars">Sedan / Executive Cars</option>
                            <option value="Mixed Multi-Vehicle Fleet">Mixed Multi-Vehicle Fleet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Vehicle Count</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            name="vehicleCount"
                            value={formData.vehicleCount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Target Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Contract Duration</label>
                          <select
                            name="contractDuration"
                            value={formData.contractDuration}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                          >
                            <option value="12 Months (Annual Master Agreement)">12 Months (Annual Agreement)</option>
                            <option value="6 Months Project Term">6 Months Project Term</option>
                            <option value="3 Months Trial">3 Months Trial</option>
                            <option value="Multi-Year Enterprise Contract">Multi-Year Enterprise Contract</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Service & Operational Area *</label>
                        <input
                          type="text"
                          name="serviceArea"
                          value={formData.serviceArea}
                          onChange={handleChange}
                          placeholder="e.g. Colombo, Expressway Corridors, Island-wide"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Project Details & SLA Requirements</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Specific reporting hours, estimated monthly mileage, or special billing terms..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Request Formal Corporate SLA</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
