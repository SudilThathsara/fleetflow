'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Settings, Save, Building, Image as ImageIcon, Upload, Trash2,
  Percent, CreditCard, FileText, CheckCircle, AlertCircle, RefreshCw,
  Globe, Phone, Mail, MapPin, Clock, MessageSquare, HelpCircle,
  ShieldCheck, Star, Plus, X, ChevronDown, ChevronUp, Eye, EyeOff,
  Search, Link2, Share2, Video, Globe2,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface FAQ { question: string; answer: string; category: string }
interface Testimonial { author: string; company: string; rating: number; quote: string; isVerified: boolean }
interface WebsiteContent {
  businessName: string; tagline: string; logoUrl: string; faviconUrl: string;
  heroHeadline: string; heroSubheadline: string; heroImage: string;
  phone: string; whatsappNumber: string; publicEmail: string; address: string;
  serviceAreas: string[]; businessHours: string; brNumberPlaceholder: string;
  aboutIntro: string; aboutMission: string; aboutFleetPractices: string; aboutReliability: string;
  servicesEnabled: { monthlyHire: boolean; corporateHire: boolean; doubleCabHire: boolean; vanHire: boolean; dailyHire: boolean; tourismTravel: boolean; projectTransport: boolean };
  faqs: FAQ[];
  testimonials: Testimonial[];
  privacyPolicyText: string; termsConditionsText: string;
  socialLinks: { facebook: string; instagram: string; linkedin: string; youtube: string; whatsapp: string };
  seo: { metaTitle: string; metaDescription: string; canonicalBaseUrl: string };
}

const DEFAULT_WEBSITE: WebsiteContent = {
  businessName: 'Tourism & Transport',
  tagline: 'Professional Fleet & Operational Management',
  logoUrl: '', faviconUrl: '',
  heroHeadline: 'Reliable Vehicle Hire & Corporate Transport Solutions',
  heroSubheadline: 'Premium double cabs, spacious passenger vans, monthly corporate transport, and island-wide vehicle hire services with verified professional drivers.',
  heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600',
  phone: '+94 11 234 5678 / +94 77 123 4567', whatsappNumber: '+94771234567',
  publicEmail: 'inquiries@transportlanka.lk',
  address: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka',
  serviceAreas: ['Colombo & Greater Western Province', 'Bandaranaike International Airport (CMB)', 'Kandy & Central Province', 'Galle & Southern Expressway Corridor', 'Island-wide Corporate Project Sites'],
  businessHours: 'Monday - Saturday: 7:00 AM – 8:00 PM | 24/7 Roadside Assistance & Dispatch',
  brNumberPlaceholder: 'PV-98765/2024 (Registered Transport Provider)',
  aboutIntro: 'We are an established Sri Lankan passenger and corporate transport solutions provider, delivering reliable, well-maintained double cabs, passenger vans, and tailored long-term fleet contracts for multinational companies, local enterprises, tourism partners, and project teams.',
  aboutMission: 'To deliver dependable, transparent, and safe vehicular mobility across Sri Lanka with rigorously maintained vehicles, verified professional chauffeurs, and predictable corporate billing.',
  aboutFleetPractices: 'Every vehicle in our fleet undergoes strict scheduled preventative maintenance, computerized tyre and brake checks, and continuous fitness inspections. GPS telemetry and running chart verifications ensure operational transparency.',
  aboutReliability: 'With dedicated replacement vehicle contingency policies and a 24/7 operations control desk, our clients experience uninterrupted commercial continuity and dependable punctuality.',
  servicesEnabled: { monthlyHire: true, corporateHire: true, doubleCabHire: true, vanHire: true, dailyHire: true, tourismTravel: true, projectTransport: true },
  faqs: [
    { question: 'What is included in a monthly vehicle hire contract?', answer: 'Monthly agreements typically include a standard kilometre allowance, full comprehensive insurance, routine scheduled maintenance, a professional driver, and backup vehicle replacement guarantees.', category: 'Monthly Hire' },
    { question: 'How do you calculate additional kilometres and overtime charges?', answer: 'Excess kilometres beyond the agreed monthly threshold are billed at the contracted extra-km rate. Driver overtime is calculated at agreed hourly overtime rates based on signed daily running charts.', category: 'Billing & Rates' },
  ],
  testimonials: [
    { author: 'Infrastructure Project Director', company: 'Civil Engineering JV, Colombo', rating: 5, quote: 'The double-cab fleet supplied for our highway package has operated reliably with zero downtime. Running charts and monthly invoicing are always transparent and accurate.', isVerified: true },
  ],
  privacyPolicyText: 'This Privacy Policy outlines how our transport service collects, uses, and safeguards information provided when requesting quotations, booking vehicles, or accessing the customer portal. We do not sell personal information to third parties.',
  termsConditionsText: 'All vehicle hire requests submitted online are non-binding enquiries until formally reviewed and accepted via an official quotation or confirmed booking agreement. Vehicle dispatch is subject to driver and asset availability, verified identity, and agreed corporate terms.',
  socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', whatsapp: '' },
  seo: { metaTitle: 'Premium Vehicle Hire & Corporate Transport Sri Lanka | Lanka Premier', metaDescription: 'Reliable double-cab pickups, passenger vans, monthly corporate transport contracts, and island-wide vehicle hire solutions in Sri Lanka.', canonicalBaseUrl: 'https://www.lankapremiertransport.lk' },
};

/* ─── Input helpers ──────────────────────────────────── */
const Field = ({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition ${props.className ?? ''}`} />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition resize-y ${props.className ?? ''}`} />
);

const SectionCard = ({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3">
      {Icon && <Icon size={18} className="text-blue-600 shrink-0 mt-0.5" />}
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

/* ─── Main component ─────────────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'statutory' | 'billing' | 'website'>('branding');
  const [websiteTab, setWebsiteTab] = useState<'hero' | 'contact' | 'about' | 'services' | 'faqs' | 'testimonials' | 'legal' | 'seo'>('hero');

  const [settings, setSettings] = useState({
    companyName: 'FleetFlow Lanka (Pvt) Ltd',
    tagline: 'Enterprise Fleet & Transport Operations Management',
    logoUrl: '', phone: '+94 11 234 5678 / +94 77 123 4567',
    email: 'operations@fleetflowlanka.lk', address: 'No 142/B, High Level Road, Nugegoda, Sri Lanka',
    currency: 'LKR', brNumber: 'PV-98765/2024', vatNumber: 'VAT-10928374-7000',
    invoicePrefix: 'INV-2026-', quotationPrefix: 'QT-2026-', receiptPrefix: 'REC-2026-',
    terms: 'All running charges are calculated based on official starting and ending odometer readings. Payment is due within 15 days of invoice date.',
    bankAccountDetails: 'Commercial Bank of Ceylon\nAccount: 1000987654\nBranch: Nugegoda\nBeneficiary: FleetFlow Lanka (Pvt) Ltd',
    epfEmployeeRate: 8, epfEmployerRate: 12, etfEmployerRate: 3,
    epfRegistrationNumber: 'EPF/C/94821', etfRegistrationNumber: 'ETF/L/38291',
    maxAdvanceDeductionPerMonth: 10000, normalWorkingHoursPerDay: 8,
  });

  const [wc, setWc] = useState<WebsiteContent>(DEFAULT_WEBSITE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* FAQ / testimonial editor state */
  const [newFaq, setNewFaq] = useState<FAQ>({ question: '', answer: '', category: '' });
  const [editFaqIdx, setEditFaqIdx] = useState<number | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ author: '', company: '', rating: 5, quote: '', isVerified: true });
  const [editTestiIdx, setEditTestiIdx] = useState<number | null>(null);
  const [newArea, setNewArea] = useState('');

  /* EPF preview */
  const [sampleBasic, setSampleBasic] = useState(65000);
  const [sampleAllowances, setSampleAllowances] = useState(5000);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/public/content').then((r) => r.json()),
    ]).then(([s, w]) => {
      if (s.success && s.data) {
        setSettings((p) => ({ ...p, ...s.data }));
        if (s.data.logoUrl) setLogoPreview(s.data.logoUrl);
      }
      if (w.success && w.data) setWc((p) => ({ ...p, ...w.data }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload a valid image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('File size must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setSettings((p) => ({ ...p, logoUrl: result }));
      setWc((p) => ({ ...p, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveSuccess(false); setSaveError('');
    try {
      // Sync logoUrl and branding to WebsiteContent so public site always receives the updated logo
      const websitePayload = {
        ...wc,
        logoUrl: settings.logoUrl,
        businessName: wc.businessName || settings.companyName,
      };
      const settingsPayload = {
        ...settings,
        companyName: websitePayload.businessName,
        tagline: websitePayload.tagline,
        phone: websitePayload.phone,
        email: websitePayload.publicEmail,
        address: websitePayload.address,
        logoUrl: websitePayload.logoUrl,
        brNumber: websitePayload.brNumberPlaceholder,
      };

      const [r1, r2] = await Promise.all([
        fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsPayload) }),
        fetch('/api/public/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(websitePayload) }),
      ]);
      const d1 = await r1.json();
      const d2 = await r2.json();
      if (d1.success && d2.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        if (typeof window !== 'undefined') {
          const mergedSettings = { ...(d1.data || settingsPayload), ...websitePayload };
          localStorage.setItem('fleetflow_settings', JSON.stringify(mergedSettings));
          window.dispatchEvent(new CustomEvent('fleetflow:settings-updated', { detail: mergedSettings }));
        }
      } else {
        setSaveError(d1.message || d2.message || 'Failed to save settings');
      }
    } catch (err: any) { setSaveError(err.message || 'Network error'); }
    finally { setSaving(false); }
  };

  const sampleQ = sampleBasic + sampleAllowances;
  const sampleEpfEmp = Math.round(sampleQ * (settings.epfEmployeeRate / 100));
  const sampleEpfEmplr = Math.round(sampleQ * (settings.epfEmployerRate / 100));
  const sampleEtfEmplr = Math.round(sampleQ * (settings.etfEmployerRate / 100));
  const sampleNet = sampleQ - sampleEpfEmp;
  const sampleTotal = sampleQ + sampleEpfEmplr + sampleEtfEmplr;

  /* Helper: update nested wc */
  const wcSet = (key: keyof WebsiteContent, val: any) => setWc((p) => ({ ...p, [key]: val }));
  const svcSet = (key: keyof WebsiteContent['servicesEnabled'], val: boolean) =>
    setWc((p) => ({ ...p, servicesEnabled: { ...p.servicesEnabled, [key]: val } }));
  const socialSet = (key: keyof WebsiteContent['socialLinks'], val: string) =>
    setWc((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: val } }));
  const seoSet = (key: keyof WebsiteContent['seo'], val: string) =>
    setWc((p) => ({ ...p, seo: { ...p.seo, [key]: val } }));

  const TAB_BTN = (tab: typeof activeTab, icon: React.ElementType, label: string) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
          activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <Icon size={15} /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.split(' ')[0]}</span>
      </button>
    );
  };

  const WEB_TAB = (tab: typeof websiteTab, label: string) => (
    <button
      type="button"
      onClick={() => setWebsiteTab(tab)}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
        websiteTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading settings…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="text-blue-600" size={26} />
              System & Operational Settings
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Company branding, EPF/ETF rates, billing prefixes, and public website CMS</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
          >
            {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold">All settings saved successfully!</p>
                <p className="text-xs text-emerald-600">Changes are now live across all modules and the public website.</p>
              </div>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 text-xs font-bold">✕</button>
          </div>
        )}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <p className="text-sm font-semibold">{saveError}</p>
            <button onClick={() => setSaveError('')} className="ml-auto text-red-700 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 gap-0 overflow-x-auto">
          {TAB_BTN('branding', Building, 'Company Branding & Logo')}
          {TAB_BTN('statutory', Percent, 'EPF & ETF Statutory')}
          {TAB_BTN('billing', CreditCard, 'Billing & Banking')}
          {TAB_BTN('website', Globe, 'Public Website CMS')}
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ══════════ TAB 1: BRANDING ══════════ */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <SectionCard title="Company Official Logo" subtitle="Displayed on sidebar, invoices, quotations, and payslips." icon={ImageIcon}>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative group shrink-0">
                    <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-contain rounded-xl" />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon size={28} className="mx-auto mb-1" />
                          <span className="text-[10px]">No logo</span>
                        </div>
                      )}
                    </div>
                    {logoPreview && (
                      <button type="button" onClick={() => { setLogoPreview(''); setSettings((p) => ({ ...p, logoUrl: '' })); setWc((p) => ({ ...p, logoUrl: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 flex-1">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                      <Upload size={16} className="text-blue-500" /> Upload Logo (PNG/SVG/JPG, max 2MB)
                    </button>
                    <p className="text-xs text-slate-500">Or paste an image URL:</p>
                    <Input placeholder="https://your-cdn.com/logo.png" value={settings.logoUrl} onChange={(e) => { const val = e.target.value; setSettings((p) => ({ ...p, logoUrl: val })); setWc((p) => ({ ...p, logoUrl: val })); setLogoPreview(val); }} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Company Identity" subtitle="Core company information used across all documents and communications." icon={Building}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Registered Company Name">
                    <Input value={settings.companyName} onChange={(e) => { const value = e.target.value; setSettings((p) => ({ ...p, companyName: value })); setWc((p) => ({ ...p, businessName: value })); }} />
                  </Field>
                  <Field label="Business Tagline">
                    <Input value={settings.tagline} onChange={(e) => { const value = e.target.value; setSettings((p) => ({ ...p, tagline: value })); setWc((p) => ({ ...p, tagline: value })); }} />
                  </Field>
                  <Field label="Contact Phone">
                    <Input value={settings.phone} onChange={(e) => { const value = e.target.value; setSettings((p) => ({ ...p, phone: value })); setWc((p) => ({ ...p, phone: value })); }} />
                  </Field>
                  <Field label="Email Address">
                    <Input type="email" value={settings.email} onChange={(e) => { const value = e.target.value; setSettings((p) => ({ ...p, email: value })); setWc((p) => ({ ...p, publicEmail: value })); }} />
                  </Field>
                  <Field label="BR / Business Registration Number">
                    <Input value={settings.brNumber} onChange={(e) => { const value = e.target.value; setSettings((p) => ({ ...p, brNumber: value })); setWc((p) => ({ ...p, brNumberPlaceholder: value })); }} />
                  </Field>
                  <Field label="VAT Registration Number">
                    <Input value={settings.vatNumber} onChange={(e) => setSettings((p) => ({ ...p, vatNumber: e.target.value }))} />
                  </Field>
                  <Field label="Default Currency" className="sm:col-span-2">
                    <select value={settings.currency} onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      {['LKR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Business Address">
                  <Input value={settings.address} onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))} />
                </Field>
              </SectionCard>
            </div>
          )}

          {/* ══════════ TAB 2: STATUTORY ══════════ */}
          {activeTab === 'statutory' && (
            <div className="space-y-6">
              <SectionCard title="EPF & ETF Statutory Rates" subtitle="Sri Lankan mandatory contribution rates applied to all payroll periods." icon={Percent}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'EPF Employee Contribution (%)', key: 'epfEmployeeRate', hint: 'Standard: 8%' },
                    { label: 'EPF Employer Contribution (%)', key: 'epfEmployerRate', hint: 'Standard: 12%' },
                    { label: 'ETF Employer Contribution (%)', key: 'etfEmployerRate', hint: 'Standard: 3%' },
                  ].map(({ label, key, hint }) => (
                    <Field key={key} label={label} hint={hint}>
                      <Input type="number" min={0} max={100} step={0.5} value={(settings as any)[key]} onChange={(e) => setSettings((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} />
                    </Field>
                  ))}
                  <Field label="EPF Registration Number">
                    <Input value={settings.epfRegistrationNumber} onChange={(e) => setSettings((p) => ({ ...p, epfRegistrationNumber: e.target.value }))} />
                  </Field>
                  <Field label="ETF Registration Number">
                    <Input value={settings.etfRegistrationNumber} onChange={(e) => setSettings((p) => ({ ...p, etfRegistrationNumber: e.target.value }))} />
                  </Field>
                  <Field label="Max Advance Deduction / Month (LKR)">
                    <Input type="number" value={settings.maxAdvanceDeductionPerMonth} onChange={(e) => setSettings((p) => ({ ...p, maxAdvanceDeductionPerMonth: parseInt(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Normal Working Hours / Day">
                    <Input type="number" min={6} max={12} value={settings.normalWorkingHoursPerDay} onChange={(e) => setSettings((p) => ({ ...p, normalWorkingHoursPerDay: parseInt(e.target.value) || 8 }))} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="Live EPF / ETF Preview Calculator" subtitle="Test how rates apply to a sample driver salary." icon={HelpCircle}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Sample Basic Salary (LKR)">
                    <Input type="number" value={sampleBasic} onChange={(e) => setSampleBasic(parseInt(e.target.value) || 0)} />
                  </Field>
                  <Field label="Sample Fixed Allowances (LKR)">
                    <Input type="number" value={sampleAllowances} onChange={(e) => setSampleAllowances(parseInt(e.target.value) || 0)} />
                  </Field>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1.5 mt-2">
                  <div className="flex justify-between"><span>Qualifying Earnings</span><span className="text-white font-bold">LKR {sampleQ.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>EPF – Employee ({settings.epfEmployeeRate}%)</span><span className="text-red-400">– LKR {sampleEpfEmp.toLocaleString()}</span></div>
                  <div className="border-t border-slate-700 my-1" />
                  <div className="flex justify-between"><span>Net Take-Home Pay</span><span className="text-emerald-400 font-bold">LKR {sampleNet.toLocaleString()}</span></div>
                  <div className="border-t border-slate-700 my-1" />
                  <div className="flex justify-between"><span>EPF – Employer ({settings.epfEmployerRate}%)</span><span className="text-amber-400">LKR {sampleEpfEmplr.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>ETF – Employer ({settings.etfEmployerRate}%)</span><span className="text-amber-400">LKR {sampleEtfEmplr.toLocaleString()}</span></div>
                  <div className="border-t border-slate-700 my-1" />
                  <div className="flex justify-between"><span>Total Employer Cost</span><span className="text-blue-400 font-bold">LKR {sampleTotal.toLocaleString()}</span></div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════ TAB 3: BILLING ══════════ */}
          {activeTab === 'billing' && (
            <SectionCard title="Billing Prefixes & Banking" subtitle="Document numbering and bank account details printed on customer invoices." icon={CreditCard}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Invoice Prefix" hint="e.g. INV-2026-0001">
                  <Input value={settings.invoicePrefix} onChange={(e) => setSettings((p) => ({ ...p, invoicePrefix: e.target.value }))} className="font-mono" />
                </Field>
                <Field label="Quotation Prefix" hint="e.g. QT-2026-0001">
                  <Input value={settings.quotationPrefix} onChange={(e) => setSettings((p) => ({ ...p, quotationPrefix: e.target.value }))} className="font-mono" />
                </Field>
                <Field label="Receipt Prefix" hint="e.g. REC-2026-0001">
                  <Input value={settings.receiptPrefix} onChange={(e) => setSettings((p) => ({ ...p, receiptPrefix: e.target.value }))} className="font-mono" />
                </Field>
              </div>
              <Field label="Bank Account Details (printed on invoices)">
                <Textarea rows={4} value={settings.bankAccountDetails} onChange={(e) => setSettings((p) => ({ ...p, bankAccountDetails: e.target.value }))} className="font-mono text-xs" />
              </Field>
              <Field label="Standard Invoice Terms & Operational Policies">
                <Textarea rows={3} value={settings.terms} onChange={(e) => setSettings((p) => ({ ...p, terms: e.target.value }))} />
              </Field>
            </SectionCard>
          )}

          {/* ══════════ TAB 4: WEBSITE CMS ══════════ */}
          {activeTab === 'website' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 font-medium">
                ✦ All changes here are published live to your public website immediately after saving.
              </div>

              {/* Sub-tab nav */}
              <div className="flex flex-wrap gap-1.5">
                {WEB_TAB('hero', '🏠 Hero')}
                {WEB_TAB('contact', '📞 Contact')}
                {WEB_TAB('about', '📖 About')}
                {WEB_TAB('services', '⚙️ Services')}
                {WEB_TAB('faqs', '❓ FAQs')}
                {WEB_TAB('testimonials', '⭐ Reviews')}
                {WEB_TAB('legal', '⚖️ Legal')}
                {WEB_TAB('seo', '🔍 SEO')}
              </div>

              {/* ── HERO ── */}
              {websiteTab === 'hero' && (
                <div className="space-y-4">
                  <SectionCard title="Homepage Hero Section" subtitle="The first thing visitors see — make it compelling." icon={Globe}>
                    <Field label="Public Business Trading Name">
                      <Input value={wc.businessName} onChange={(e) => { const value = e.target.value; wcSet('businessName', value); setSettings((p) => ({ ...p, companyName: value })); }} />
                    </Field>
                    <Field label="Business Tagline (shown under logo in header/footer)">
                      <Input value={wc.tagline} onChange={(e) => { const value = e.target.value; wcSet('tagline', value); setSettings((p) => ({ ...p, tagline: value })); }} />
                    </Field>
                    <Field label="Hero Headline" hint="Short, powerful — max 80 characters">
                      <Input value={wc.heroHeadline} onChange={(e) => wcSet('heroHeadline', e.target.value)} />
                    </Field>
                    <Field label="Hero Sub-headline / Business Description">
                      <Textarea rows={3} value={wc.heroSubheadline} onChange={(e) => wcSet('heroSubheadline', e.target.value)} />
                    </Field>
                    <Field label="Hero Background Image URL" hint="Use a high-quality landscape image (1600px wide recommended)">
                      <Input placeholder="https://images.unsplash.com/…" value={wc.heroImage} onChange={(e) => wcSet('heroImage', e.target.value)} />
                    </Field>
                    {wc.heroImage && (
                      <div className="relative rounded-xl overflow-hidden h-32 bg-slate-100 border border-slate-200">
                        <img src={wc.heroImage} alt="Hero preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent flex items-center px-4">
                          <p className="text-white text-xs font-bold">{wc.heroHeadline}</p>
                        </div>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ── CONTACT ── */}
              {websiteTab === 'contact' && (
                <div className="space-y-4">
                  <SectionCard title="Contact & Business Information" subtitle="Displayed in the header, footer, contact page, and about page." icon={Phone}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Phone Number(s)" hint="Separate multiple numbers with /">
                        <Input value={wc.phone} onChange={(e) => { const value = e.target.value; wcSet('phone', value); setSettings((p) => ({ ...p, phone: value })); }} />
                      </Field>
                      <Field label="WhatsApp Number" hint="International format e.g. +94771234567">
                        <Input value={wc.whatsappNumber} onChange={(e) => wcSet('whatsappNumber', e.target.value)} />
                      </Field>
                      <Field label="Public Email Address">
                        <Input type="email" value={wc.publicEmail} onChange={(e) => { const value = e.target.value; wcSet('publicEmail', value); setSettings((p) => ({ ...p, email: value })); }} />
                      </Field>
                      <Field label="Business Registration / License No.">
                        <Input value={wc.brNumberPlaceholder} onChange={(e) => { const value = e.target.value; wcSet('brNumberPlaceholder', value); setSettings((p) => ({ ...p, brNumber: value })); }} />
                      </Field>
                    </div>
                    <Field label="Physical Address">
                      <Textarea rows={2} value={wc.address} onChange={(e) => { const value = e.target.value; wcSet('address', value); setSettings((p) => ({ ...p, address: value })); }} />
                    </Field>
                    <Field label="Business Hours" hint="Shown in header micro-bar">
                      <Input value={wc.businessHours} onChange={(e) => wcSet('businessHours', e.target.value)} />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Social Media Links" subtitle="Leave blank to hide a platform's icon from the footer." icon={Globe}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Facebook Page URL">
                        <Input placeholder="https://facebook.com/yourpage" value={wc.socialLinks.facebook} onChange={(e) => socialSet('facebook', e.target.value)} />
                      </Field>
                      <Field label="Instagram Profile URL">
                        <Input placeholder="https://instagram.com/yourhandle" value={wc.socialLinks.instagram} onChange={(e) => socialSet('instagram', e.target.value)} />
                      </Field>
                      <Field label="LinkedIn Company Page URL">
                        <Input placeholder="https://linkedin.com/company/yourcompany" value={wc.socialLinks.linkedin} onChange={(e) => socialSet('linkedin', e.target.value)} />
                      </Field>
                      <Field label="YouTube Channel URL">
                        <Input placeholder="https://youtube.com/@yourchannel" value={wc.socialLinks.youtube} onChange={(e) => socialSet('youtube', e.target.value)} />
                      </Field>
                      <Field label="WhatsApp Link (for footer icon)">
                        <Input placeholder="https://wa.me/94771234567" value={wc.socialLinks.whatsapp} onChange={(e) => socialSet('whatsapp', e.target.value)} />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Service Areas" subtitle="Displayed on the homepage and about page as coverage areas." icon={MapPin}>
                    <div className="space-y-2">
                      {wc.serviceAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input value={area} onChange={(e) => {
                            const areas = [...wc.serviceAreas]; areas[idx] = e.target.value; wcSet('serviceAreas', areas);
                          }} />
                          <button type="button" onClick={() => { const areas = wc.serviceAreas.filter((_, i) => i !== idx); wcSet('serviceAreas', areas); }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition shrink-0">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Add new service area…" value={newArea} onChange={(e) => setNewArea(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newArea.trim()) { wcSet('serviceAreas', [...wc.serviceAreas, newArea.trim()]); setNewArea(''); } } }} />
                        <button type="button" onClick={() => { if (newArea.trim()) { wcSet('serviceAreas', [...wc.serviceAreas, newArea.trim()]); setNewArea(''); } }}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shrink-0">
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── ABOUT ── */}
              {websiteTab === 'about' && (
                <SectionCard title="About Page Content" subtitle="Text displayed on the /about page — be genuine and factual." icon={FileText}>
                  <Field label="Company Introduction" hint="Who you are and what you offer">
                    <Textarea rows={4} value={wc.aboutIntro} onChange={(e) => wcSet('aboutIntro', e.target.value)} />
                  </Field>
                  <Field label="Business Mission Statement">
                    <Textarea rows={3} value={wc.aboutMission} onChange={(e) => wcSet('aboutMission', e.target.value)} />
                  </Field>
                  <Field label="Fleet & Vehicle Maintenance Practices">
                    <Textarea rows={3} value={wc.aboutFleetPractices} onChange={(e) => wcSet('aboutFleetPractices', e.target.value)} />
                  </Field>
                  <Field label="Operational Reliability & Client Support">
                    <Textarea rows={3} value={wc.aboutReliability} onChange={(e) => wcSet('aboutReliability', e.target.value)} />
                  </Field>
                </SectionCard>
              )}

              {/* ── SERVICES ── */}
              {websiteTab === 'services' && (
                <SectionCard title="Enabled Public Transport Services" subtitle="Toggle which services appear on your public website, navbar, and footer." icon={Settings}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: 'monthlyHire', label: 'Monthly Corporate Hire', desc: '/services/monthly-vehicle-hire' },
                      { key: 'corporateHire', label: 'Corporate Transport SLAs', desc: '/corporate-transport' },
                      { key: 'doubleCabHire', label: 'Double-Cab Hire (4×4)', desc: '/services/double-cab-hire' },
                      { key: 'vanHire', label: 'Passenger Van Hire', desc: '/services/van-hire' },
                      { key: 'dailyHire', label: 'Daily & Short-Term Hire', desc: '/services/daily-hire' },
                      { key: 'tourismTravel', label: 'Tourism & Travel Transport', desc: '/services' },
                      { key: 'projectTransport', label: 'Turnkey Project Mobility', desc: '/services' },
                    ].map(({ key, label, desc }) => {
                      const enabled = (wc.servicesEnabled as any)[key];
                      return (
                        <label key={key} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${enabled ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                          <input type="checkbox" checked={enabled} onChange={(e) => svcSet(key as any, e.target.checked)}
                            className="mt-0.5 rounded text-blue-600 cursor-pointer" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{label}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{desc}</p>
                          </div>
                          {enabled && <CheckCircle size={14} className="text-blue-600 ml-auto shrink-0 mt-0.5" />}
                        </label>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── FAQs ── */}
              {websiteTab === 'faqs' && (
                <div className="space-y-4">
                  <SectionCard title="FAQ Manager" subtitle="Questions displayed on the homepage and /faq page." icon={HelpCircle}>
                    <div className="space-y-3">
                      {wc.faqs.map((faq, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="flex items-start gap-3 p-4">
                            <div className="flex-1 space-y-2">
                              {editFaqIdx === idx ? (
                                <>
                                  <Input placeholder="Question" value={faq.question}
                                    onChange={(e) => { const f = [...wc.faqs]; f[idx] = { ...f[idx], question: e.target.value }; wcSet('faqs', f); }} />
                                  <Textarea rows={2} placeholder="Answer" value={faq.answer}
                                    onChange={(e) => { const f = [...wc.faqs]; f[idx] = { ...f[idx], answer: e.target.value }; wcSet('faqs', f); }} />
                                  <Input placeholder="Category" value={faq.category}
                                    onChange={(e) => { const f = [...wc.faqs]; f[idx] = { ...f[idx], category: e.target.value }; wcSet('faqs', f); }} />
                                  <button type="button" onClick={() => setEditFaqIdx(null)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Done</button>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-bold text-slate-800">{faq.question}</p>
                                  <p className="text-xs text-slate-600">{faq.answer}</p>
                                  {faq.category && <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-200 px-2 py-0.5 rounded-full font-semibold">{faq.category}</span>}
                                </>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button type="button" onClick={() => setEditFaqIdx(editFaqIdx === idx ? null : idx)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                                {editFaqIdx === idx ? <ChevronUp size={15} /> : <FileText size={15} />}
                              </button>
                              <button type="button" onClick={() => { wcSet('faqs', wc.faqs.filter((_, i) => i !== idx)); if (editFaqIdx === idx) setEditFaqIdx(null); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add FAQ */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-3 mt-2">
                      <p className="text-xs font-bold text-slate-600 uppercase">Add New FAQ</p>
                      <Input placeholder="Question" value={newFaq.question} onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))} />
                      <Textarea rows={2} placeholder="Answer" value={newFaq.answer} onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))} />
                      <div className="flex gap-2">
                        <Input placeholder="Category (e.g. Billing & Rates)" value={newFaq.category} onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))} />
                        <button type="button"
                          onClick={() => {
                            if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
                            wcSet('faqs', [...wc.faqs, { ...newFaq }]);
                            setNewFaq({ question: '', answer: '', category: '' });
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shrink-0">
                          <Plus size={14} /> Add FAQ
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── TESTIMONIALS ── */}
              {websiteTab === 'testimonials' && (
                <div className="space-y-4">
                  <SectionCard title="Customer Testimonials" subtitle="Only verified testimonials (isVerified = true) are shown publicly." icon={Star}>
                    <div className="space-y-3">
                      {wc.testimonials.map((t, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="flex items-start gap-3 p-4">
                            <div className="flex-1 space-y-2">
                              {editTestiIdx === idx ? (
                                <>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Author name" value={t.author}
                                      onChange={(e) => { const ts = [...wc.testimonials]; ts[idx] = { ...ts[idx], author: e.target.value }; wcSet('testimonials', ts); }} />
                                    <Input placeholder="Company" value={t.company}
                                      onChange={(e) => { const ts = [...wc.testimonials]; ts[idx] = { ...ts[idx], company: e.target.value }; wcSet('testimonials', ts); }} />
                                  </div>
                                  <Textarea rows={2} placeholder="Quote" value={t.quote}
                                    onChange={(e) => { const ts = [...wc.testimonials]; ts[idx] = { ...ts[idx], quote: e.target.value }; wcSet('testimonials', ts); }} />
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs font-semibold text-slate-600">Rating:</label>
                                      <select value={t.rating} onChange={(e) => { const ts = [...wc.testimonials]; ts[idx] = { ...ts[idx], rating: parseInt(e.target.value) }; wcSet('testimonials', ts); }}
                                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs">
                                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                      </select>
                                    </div>
                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                      <input type="checkbox" checked={t.isVerified}
                                        onChange={(e) => { const ts = [...wc.testimonials]; ts[idx] = { ...ts[idx], isVerified: e.target.checked }; wcSet('testimonials', ts); }}
                                        className="rounded text-blue-600" />
                                      Show publicly (verified)
                                    </label>
                                  </div>
                                  <button type="button" onClick={() => setEditTestiIdx(null)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Done</button>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 text-amber-400 text-sm">{'★'.repeat(t.rating)}</div>
                                  <p className="text-xs text-slate-700 italic">"{t.quote}"</p>
                                  <div className="flex items-center gap-3">
                                    <p className="text-xs font-bold text-slate-800">{t.author}{t.company && ` — ${t.company}`}</p>
                                    {t.isVerified
                                      ? <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">✓ Public</span>
                                      : <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full font-semibold">Hidden</span>}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button type="button" onClick={() => setEditTestiIdx(editTestiIdx === idx ? null : idx)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                                <FileText size={15} />
                              </button>
                              <button type="button" onClick={() => { wcSet('testimonials', wc.testimonials.filter((_, i) => i !== idx)); if (editTestiIdx === idx) setEditTestiIdx(null); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Testimonial */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-3 mt-2">
                      <p className="text-xs font-bold text-slate-600 uppercase">Add New Testimonial</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Author name" value={newTestimonial.author} onChange={(e) => setNewTestimonial((p) => ({ ...p, author: e.target.value }))} />
                        <Input placeholder="Company / Organisation" value={newTestimonial.company} onChange={(e) => setNewTestimonial((p) => ({ ...p, company: e.target.value }))} />
                      </div>
                      <Textarea rows={2} placeholder="Their testimonial quote" value={newTestimonial.quote} onChange={(e) => setNewTestimonial((p) => ({ ...p, quote: e.target.value }))} />
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-600">Rating:</label>
                          <select value={newTestimonial.rating} onChange={(e) => setNewTestimonial((p) => ({ ...p, rating: parseInt(e.target.value) }))}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs">
                            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                          </select>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={newTestimonial.isVerified} onChange={(e) => setNewTestimonial((p) => ({ ...p, isVerified: e.target.checked }))} className="rounded text-blue-600" />
                          Show publicly
                        </label>
                        <button type="button"
                          onClick={() => {
                            if (!newTestimonial.author.trim() || !newTestimonial.quote.trim()) return;
                            wcSet('testimonials', [...wc.testimonials, { ...newTestimonial }]);
                            setNewTestimonial({ author: '', company: '', rating: 5, quote: '', isVerified: true });
                          }}
                          className="ml-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1">
                          <Plus size={14} /> Add Review
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── LEGAL ── */}
              {websiteTab === 'legal' && (
                <div className="space-y-4">
                  <SectionCard title="Privacy Policy" subtitle="Displayed at /privacy — update with your actual data handling practices." icon={ShieldCheck}>
                    <Textarea rows={12} value={wc.privacyPolicyText} onChange={(e) => wcSet('privacyPolicyText', e.target.value)} className="text-xs leading-relaxed" />
                  </SectionCard>
                  <SectionCard title="Terms & Conditions" subtitle="Displayed at /terms — update with your actual service terms." icon={FileText}>
                    <Textarea rows={12} value={wc.termsConditionsText} onChange={(e) => wcSet('termsConditionsText', e.target.value)} className="text-xs leading-relaxed" />
                  </SectionCard>
                </div>
              )}

              {/* ── SEO ── */}
              {websiteTab === 'seo' && (
                <SectionCard title="Search Engine Optimisation (SEO)" subtitle="Meta tags that appear in Google and browser tabs for your website." icon={Search}>
                  <Field label="Homepage Meta Title" hint="~55–65 characters recommended">
                    <Input value={wc.seo.metaTitle} onChange={(e) => seoSet('metaTitle', e.target.value)} />
                    <p className="text-[10px] text-slate-400 mt-1">{wc.seo.metaTitle.length} characters</p>
                  </Field>
                  <Field label="Homepage Meta Description" hint="~150–160 characters recommended">
                    <Textarea rows={3} value={wc.seo.metaDescription} onChange={(e) => seoSet('metaDescription', e.target.value)} />
                    <p className="text-[10px] text-slate-400 mt-1">{wc.seo.metaDescription.length} characters</p>
                  </Field>
                  <Field label="Canonical Base URL" hint="Your live website domain without trailing slash">
                    <Input placeholder="https://www.yourdomain.lk" value={wc.seo.canonicalBaseUrl} onChange={(e) => seoSet('canonicalBaseUrl', e.target.value)} />
                  </Field>
                  {/* Preview snippet */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 mt-2">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-2">Google Search Preview</p>
                    <p className="text-blue-600 text-sm font-medium">{wc.seo.metaTitle || 'Page Title'}</p>
                    <p className="text-emerald-700 text-[11px]">{wc.seo.canonicalBaseUrl || 'https://yourwebsite.com'}</p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{wc.seo.metaDescription || 'Page description…'}</p>
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* Bottom save bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {saveSuccess ? (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle size={17} /> All settings saved to MongoDB Atlas!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Changes apply immediately to branding, invoices, payroll, and public website.</span>
            )}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-60">
              {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
