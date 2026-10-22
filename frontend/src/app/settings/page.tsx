'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Settings,
  Save,
  Building,
  Image as ImageIcon,
  Upload,
  Trash2,
  Percent,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Globe,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'statutory' | 'billing' | 'website'>('branding');
  const [settings, setSettings] = useState({
    companyName: 'FleetFlow Lanka (Pvt) Ltd',
    tagline: 'Enterprise Fleet & Transport Operations Management',
    logoUrl: '',
    phone: '+94 11 234 5678 / +94 77 123 4567',
    email: 'operations@fleetflowlanka.lk',
    address: 'No 142/B, High Level Road, Nugegoda, Sri Lanka',
    currency: 'LKR',
    brNumber: 'PV-98765/2024',
    vatNumber: 'VAT-10928374-7000',
    invoicePrefix: 'INV-2026-',
    quotationPrefix: 'QT-2026-',
    receiptPrefix: 'REC-2026-',
    terms: 'All running charges are calculated based on official starting and ending odometer readings. Payment is due within 15 days of invoice date.',
    bankAccountDetails: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: FleetFlow Lanka (Pvt) Ltd',
    
    // Sri Lankan EPF / ETF Statutory Configuration
    epfEmployeeRate: 8,
    epfEmployerRate: 12,
    etfEmployerRate: 3,
    epfRegistrationNumber: 'EPF/C/94821',
    etfRegistrationNumber: 'ETF/L/38291',
    maxAdvanceDeductionPerMonth: 10000,
    normalWorkingHoursPerDay: 8,
  });

  const [websiteContent, setWebsiteContent] = useState({
    businessName: 'Lanka Premier Transport & Vehicle Hire',
    tagline: 'Reliable Vehicle Hire & Corporate Transport Solutions in Sri Lanka',
    heroHeadline: 'Reliable Vehicle Hire & Corporate Transport Solutions',
    heroSubheadline: 'Premium double cabs, spacious passenger vans, monthly corporate transport, and island-wide vehicle hire services with verified professional drivers.',
    whatsappNumber: '+94771234567',
    servicesEnabled: {
      monthlyHire: true,
      corporateHire: true,
      doubleCabHire: true,
      vanHire: true,
      dailyHire: true,
      tourismTravel: true,
      projectTransport: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculator preview state for EPF/ETF tester
  const [sampleBasic, setSampleBasic] = useState<number>(65000);
  const [sampleAllowances, setSampleAllowances] = useState<number>(5000);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({
            ...prev,
            ...data.data,
          }));
          if (data.data.logoUrl) {
            setLogoPreview(data.data.logoUrl);
          }
        }
      })
      .catch((err) => console.error('Error fetching settings:', err))
      .finally(() => setLoading(false));

    fetch('/api/public/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setWebsiteContent((prev) => ({
            ...prev,
            businessName: data.data.businessName || prev.businessName,
            tagline: data.data.tagline || prev.tagline,
            heroHeadline: data.data.heroHeadline || prev.heroHeadline,
            heroSubheadline: data.data.heroSubheadline || prev.heroSubheadline,
            whatsappNumber: data.data.whatsappNumber || prev.whatsappNumber,
            servicesEnabled: data.data.servicesEnabled || prev.servicesEnabled,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB for optimal performance.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setSettings((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setSettings((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const [res, webRes] = await Promise.all([
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        }),
        fetch('/api/public/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(websiteContent),
        }),
      ]);
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (typeof window !== 'undefined') {
          const updated = data.data || settings;
          localStorage.setItem('fleetflow_settings', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('fleetflow:settings-updated', { detail: updated }));
        }
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Sample EPF/ETF calculations for visual preview
  const sampleQualifying = sampleBasic + sampleAllowances;
  const sampleEpfEmp = Math.round(sampleQualifying * ((settings.epfEmployeeRate || 8) / 100));
  const sampleEpfEmplr = Math.round(sampleQualifying * ((settings.epfEmployerRate || 12) / 100));
  const sampleEtfEmplr = Math.round(sampleQualifying * ((settings.etfEmployerRate || 3) / 100));
  const sampleNet = sampleQualifying - sampleEpfEmp;
  const sampleTotalCost = sampleQualifying + sampleEpfEmplr + sampleEtfEmplr;

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="text-blue-600" size={26} />
              <span>System & Operational Settings</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure company branding, logo, Sri Lankan EPF/ETF statutory rates & document numbering
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold">Settings saved and published successfully!</p>
                <p className="text-xs text-emerald-600">Company branding, logo, and statutory EPF/ETF rates are now live across all modules.</p>
              </div>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 font-bold text-xs uppercase hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('branding')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'branding'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building size={16} />
            <span>Company Branding & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'statutory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent size={16} />
            <span>EPF & ETF Statutory Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'billing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard size={16} />
            <span>Billing, Prefixes & Banking</span>
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'website'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe size={16} />
            <span>Public Website CMS</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: COMPANY BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Logo Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <ImageIcon size={18} className="text-blue-600" />
                  <span>Company Official Logo</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Displayed on the sidebar navigation, printed quotations, customer invoices, and driver payslips.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Logo Preview Box */}
                  <div className="relative group shrink-0">
                    <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Company Logo" className="h-full w-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-slate-400 mb-1" size={28} />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">No Logo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload and Control Buttons */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Upload size={14} />
                        <span>Upload New Logo</span>
                      </button>

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Or provide direct Image URL / CDN Link:
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={settings.logoUrl}
                        onChange={(e) => {
                          setSettings({ ...settings, logoUrl: e.target.value });
                          setLogoPreview(e.target.value);
                        }}
                        className="w-full max-w-lg px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: High resolution square or horizontal transparent PNG / SVG under 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building size={18} className="text-blue-600" />
                  <span>Company Identity & Contact Profile</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Registered Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Tagline / Corporate Slogan
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Business Registration (BR) Number
                    </label>
                    <input
                      type="text"
                      placeholder="PV-12345/2024"
                      value={settings.brNumber}
                      onChange={(e) => setSettings({ ...settings, brNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      VAT / SVAT Tax Registration
                    </label>
                    <input
                      type="text"
                      placeholder="VAT-10928374-7000"
                      value={settings.vatNumber}
                      onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Contact Hotline / Phone Numbers
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Official Operations Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Head Office / Operations Base Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SRI LANKAN STATUTORY EPF / ETF SETTINGS */}
          {activeTab === 'statutory' && (
            <div className="space-y-6">
              {/* Alert note about Sri Lankan Law */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-900">
                <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Sri Lanka Department of Labour & Central Bank Statutory Compliance</p>
                  <p className="text-blue-700 leading-relaxed">
                    Under the Employees' Provident Fund (EPF) Act and Employees' Trust Fund (ETF) Act, standard private sector contributions are:
                    <strong> 8% Employee EPF deduction</strong>, <strong>12% Employer EPF contribution</strong>, and <strong>3% Employer ETF contribution</strong>.
                    Contributions are calculated on Qualifying Earnings (Basic Salary + Fixed Operational Allowances). Changing these rates automatically updates the Driver Payroll Generation Engine.
                  </p>
                </div>
              </div>

              {/* Rates Configuration Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Percent size={18} className="text-blue-600" />
                  <span>Contribution Percentages & Employer Registration</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Employee EPF Rate */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase">Employee EPF Deduction</label>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">Deducted from Pay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                        value={settings.epfEmployeeRate}
                        onChange={(e) => setSettings({ ...settings, epfEmployeeRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-lg font-black text-slate-900 text-right focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Default standard rate: 8.0%</p>
                  </div>

                  {/* Employer EPF Rate */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase">Employer EPF Contribution</label>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">Company Expense</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                        value={settings.epfEmployerRate}
                        onChange={(e) => setSettings({ ...settings, epfEmployerRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-lg font-black text-blue-700 text-right focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Default standard rate: 12.0%</p>
                  </div>

                  {/* Employer ETF Rate */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase">Employer ETF Contribution</label>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">Company Expense</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                        value={settings.etfEmployerRate}
                        onChange={(e) => setSettings({ ...settings, etfEmployerRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-lg font-black text-emerald-700 text-right focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Default standard rate: 3.0%</p>
                  </div>
                </div>

                {/* Registration Numbers and Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Employer EPF Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EPF/C/94821"
                      value={settings.epfRegistrationNumber}
                      onChange={(e) => setSettings({ ...settings, epfRegistrationNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Appears on monthly Form C returns and payslips</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Employer ETF Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ETF/L/38291"
                      value={settings.etfRegistrationNumber}
                      onChange={(e) => setSettings({ ...settings, etfRegistrationNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Appears on monthly ETF return schedules</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Max Driver Advance Deduction Per Month (LKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={settings.maxAdvanceDeductionPerMonth}
                      onChange={(e) => setSettings({ ...settings, maxAdvanceDeductionPerMonth: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Protects driver take-home pay by capping monthly advance recovery</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Standard Normal Working Hours Per Day
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={settings.normalWorkingHoursPerDay}
                      onChange={(e) => setSettings({ ...settings, normalWorkingHoursPerDay: parseInt(e.target.value) || 8 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Used to evaluate approved driver overtime in running charts</p>
                  </div>
                </div>
              </div>

              {/* Interactive Calculation Simulator */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                    <HelpCircle size={16} />
                    <span>Live Statutory Contribution Impact Calculator</span>
                  </h4>
                  <span className="text-xs text-slate-400">Simulation based on your configured rates</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Test Driver Basic Salary (LKR)</label>
                    <input
                      type="number"
                      value={sampleBasic}
                      onChange={(e) => setSampleBasic(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Test Fixed Allowances (LKR)</label>
                    <input
                      type="number"
                      value={sampleAllowances}
                      onChange={(e) => setSampleAllowances(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Qualifying Base</p>
                    <p className="text-base font-black text-white mt-1">LKR {sampleQualifying.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-amber-900/50">
                    <p className="text-[10px] text-amber-400 uppercase font-semibold">Employee EPF ({settings.epfEmployeeRate}%)</p>
                    <p className="text-base font-black text-amber-300 mt-1">LKR {sampleEpfEmp.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400">Deducted from driver</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-900/50">
                    <p className="text-[10px] text-blue-400 uppercase font-semibold">Employer EPF ({settings.epfEmployerRate}%)</p>
                    <p className="text-base font-black text-blue-300 mt-1">LKR {sampleEpfEmplr.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400">Company expense</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/50">
                    <p className="text-[10px] text-emerald-400 uppercase font-semibold">Employer ETF ({settings.etfEmployerRate}%)</p>
                    <p className="text-base font-black text-emerald-300 mt-1">LKR {sampleEtfEmplr.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400">Company expense</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Employer Cost</p>
                    <p className="text-base font-black text-emerald-400 mt-1">LKR {sampleTotalCost.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400">Gross + 12% + 3%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING, PREFIXES & BANKING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard size={18} className="text-blue-600" />
                  <span>Document Prefixes & Billing Identifiers</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Customer Invoice Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">e.g. INV-2026-0001</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Quotation Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.quotationPrefix}
                      onChange={(e) => setSettings({ ...settings, quotationPrefix: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">e.g. QT-2026-0001</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Payment Receipt Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.receiptPrefix}
                      onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">e.g. REC-2026-0001</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bank Account Deposit Instructions (Printed on Invoices & Quotations)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.bankAccountDetails}
                    onChange={(e) => setSettings({ ...settings, bankAccountDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Document Terms & Operational Policies
                  </label>
                  <textarea
                    rows={3}
                    value={settings.terms}
                    onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Public Website CMS */}
          {activeTab === 'website' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Public Website Branding & Marketing Content
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control public titles, headlines, contact numbers, and service visibility shown to prospective clients.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Public Business Trading Name
                    </label>
                    <input
                      type="text"
                      value={websiteContent.businessName}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      WhatsApp Quick Booking Hotline
                    </label>
                    <input
                      type="text"
                      value={websiteContent.whatsappNumber}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, whatsappNumber: e.target.value })}
                      placeholder="+94771234567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Homepage Hero Headline
                  </label>
                  <input
                    type="text"
                    value={websiteContent.heroHeadline}
                    onChange={(e) => setWebsiteContent({ ...websiteContent, heroHeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Homepage Hero Subheadline / Business Description
                  </label>
                  <textarea
                    rows={2}
                    value={websiteContent.heroSubheadline}
                    onChange={(e) => setWebsiteContent({ ...websiteContent, heroSubheadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Enabled Public Transport Services
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-700">
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.monthlyHire}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, monthlyHire: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Monthly Corporate Hire</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.doubleCabHire}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, doubleCabHire: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Double-Cab Pickups (4x4)</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.vanHire}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, vanHire: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Passenger Van Hire</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.dailyHire}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, dailyHire: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Daily & Tour Hire</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.corporateHire}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, corporateHire: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Corporate Fleet SLAs</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteContent.servicesEnabled?.projectTransport}
                        onChange={(e) =>
                          setWebsiteContent({
                            ...websiteContent,
                            servicesEnabled: { ...websiteContent.servicesEnabled, projectTransport: e.target.checked },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold">Turnkey Project Mobility</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {saveSuccess ? (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle size={18} />
                <span>All settings saved to MongoDB Atlas!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Changes apply immediately to branding, invoices, running charges, and payroll.
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
