'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Globe,
  Plus,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Trash2,
  Edit2,
  ArrowRightCircle,
  AlertTriangle,
  X,
  Copy,
} from 'lucide-react';

export default function SocialLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Post Builder State
  const [showPostBuilder, setShowPostBuilder] = useState(false);
  const [postTemplate, setPostTemplate] = useState('vehicle_required');
  const [postLang, setPostLang] = useState<'english' | 'sinhala'>('english');
  const [postDetails, setPostDetails] = useState({
    vehicleType: 'Van (KDH High Roof)',
    location: 'Colombo to Nuwara Eliya & Ella (5-Day Tour)',
    dates: 'Next weekend (3 nights / 4 days)',
    budget: 'Rs. 18,000 / day (Fuel & Driver included)',
    contact: '+94 77 123 4567 / WhatsApp',
  });
  const [copied, setCopied] = useState(false);

  // Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    leadType: 'Vehicle',
    name: '',
    phone: '',
    vehicleType: 'Car',
    vehicleReg: '',
    serviceAreas: 'Western Province',
    expectedRate: 12000,
    sourcePlatform: 'Facebook',
    sourceGroup: 'Sri Lanka Tourism Drivers & Vehicle Hire Forum',
    postUrl: '',
    status: 'New',
    notes: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = `/api/social/leads?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (typeFilter) url += `&leadType=${encodeURIComponent(typeFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      leadType: 'Vehicle',
      name: '',
      phone: '',
      vehicleType: 'Van (KDH)',
      vehicleReg: '',
      serviceAreas: 'Colombo & Kandy',
      expectedRate: 15000,
      sourcePlatform: 'Facebook',
      sourceGroup: 'Sri Lanka Tourism Drivers & Vehicle Hire Forum',
      postUrl: '',
      status: 'New',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: any) => {
    setEditingLead(l);
    setFormData({
      leadType: l.leadType,
      name: l.name,
      phone: l.phone,
      vehicleType: l.vehicleType || '',
      vehicleReg: l.vehicleReg || '',
      serviceAreas: l.serviceAreas || '',
      expectedRate: l.expectedRate || 0,
      sourcePlatform: l.sourcePlatform,
      sourceGroup: l.sourceGroup || '',
      postUrl: l.postUrl || '',
      status: l.status,
      notes: l.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead ${name}?`)) return;
    try {
      const res = await fetch(`/api/social/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchLeads();
      else alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConvertLead = async (id: string, convertTo: string) => {
    if (!confirm(`Convert this lead into a permanent ${convertTo} record?`)) return;
    try {
      const res = await fetch(`/api/social/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convertTo }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchLeads();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingLead ? 'PUT' : 'POST';
      const url = editingLead ? `/api/social/leads/${editingLead._id}` : '/api/social/leads';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchLeads();
      } else if (data.warning) {
        if (confirm(`${data.message}\nDo you still want to save it as a new contact?`)) {
          const forceRes = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, forceCreate: true }),
          });
          const forceData = await forceRes.json();
          if (forceData.success) {
            setIsModalOpen(false);
            fetchLeads();
          }
        }
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Generate Post Text
  const generatePostContent = () => {
    if (postLang === 'sinhala') {
      return `🔴 වාහනයක් අවශ්‍යයි (Urgent Vehicle Requirement) 🔴

වාහන වර්ගය: ${postDetails.vehicleType}
ගමන් මාර්ගය: ${postDetails.location}
දිනයන්: ${postDetails.dates}
ගෙවීම්/බජට්: ${postDetails.budget}

විශේෂයි: පළපුරුදු රියදුරු මහතෙකු සමඟ පිරිසිදු තත්වයේ වාහනයක් අවශ්‍යයි.
අමතන්න/WhatsApp: ${postDetails.contact}

FleetFlow Lanka Logistics Services`;
    }

    return `🔴 VEHICLE REQUIRED / HIRE REQUIREMENT 🔴

Vehicle Type: ${postDetails.vehicleType}
Route/Tour: ${postDetails.location}
Duration / Dates: ${postDetails.dates}
Budget / Rate: ${postDetails.budget}

Condition: Well maintained vehicle with experienced polite driver.
Contact/WhatsApp: ${postDetails.contact}

FleetFlow Lanka Operations & Transport`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatePostContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Social Media Leads & Conversion CRM</h1>
            <p className="text-sm text-slate-500">
              Track vehicle/driver leads sourced from Facebook groups & WhatsApp, check duplicates & convert into permanent fleet records
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPostBuilder(!showPostBuilder)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <Globe size={16} />
              <span>{showPostBuilder ? 'Hide Post Builder' : 'Facebook Post Builder'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Record Social Lead</span>
            </button>
          </div>
        </div>

        {/* Facebook Post Builder Drawer */}
        {showPostBuilder && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Social Media Marketing Post Generator</h3>
                <p className="text-xs text-slate-500">
                  Generate professional formatted posts for Facebook transport groups (Sinhala & English)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPostLang('english')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    postLang === 'english' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setPostLang('sinhala')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    postLang === 'sinhala' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  සිංහල (Sinhala)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Vehicle</label>
                  <input
                    type="text"
                    value={postDetails.vehicleType}
                    onChange={(e) => setPostDetails({ ...postDetails, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tour / Route</label>
                  <input
                    type="text"
                    value={postDetails.location}
                    onChange={(e) => setPostDetails({ ...postDetails, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dates & Duration</label>
                  <input
                    type="text"
                    value={postDetails.dates}
                    onChange={(e) => setPostDetails({ ...postDetails, dates: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offered Budget / Rate</label>
                  <input
                    type="text"
                    value={postDetails.budget}
                    onChange={(e) => setPostDetails({ ...postDetails, budget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Preview & Copy Box */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col justify-between font-mono text-xs whitespace-pre-wrap">
                <div>{generatePostContent()}</div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-800 mt-4">
                  <span className="text-[11px] text-slate-400">Ready to paste into Facebook Groups</span>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Copy size={13} />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Post Text'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by contact name, phone, or vehicle registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Lead Types</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Driver">Driver</option>
              <option value="Vehicle Owner">Vehicle Owner</option>
              <option value="Customer Enquiry">Customer Enquiry</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Negotiating">Negotiating</option>
              <option value="Verified">Verified</option>
              <option value="Converted">Converted</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Lead ID</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Lead Type & Vehicle</th>
                  <th className="p-4">Source Platform / Group</th>
                  <th className="p-4 text-right">Expected Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Convert / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Loading social media leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No leads recorded. Click "Record Social Lead" to add one.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{l.leadId}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{l.name}</p>
                        <p className="text-xs text-blue-600 font-medium">{l.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {l.leadType}
                        </span>
                        {l.vehicleType && <p className="text-xs font-semibold text-slate-800 mt-1">{l.vehicleType}</p>}
                        {l.vehicleReg && (
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            Reg: {l.vehicleReg}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{l.sourcePlatform}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{l.sourceGroup || 'Direct Inquiry'}</p>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        {l.expectedRate > 0 ? `Rs. ${l.expectedRate.toLocaleString()}` : 'Negotiable'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            l.status === 'Converted'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : l.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : l.status === 'Negotiating'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        {l.status !== 'Converted' && (
                          <div className="inline-flex items-center space-x-1 mr-2">
                            {l.leadType === 'Vehicle' && (
                              <button
                                onClick={() => handleConvertLead(l._id, 'Vehicle')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                                title="Convert to Fleet Vehicle"
                              >
                                +Vehicle
                              </button>
                            )}
                            {l.leadType === 'Driver' && (
                              <button
                                onClick={() => handleConvertLead(l._id, 'Driver')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold"
                                title="Convert to Registered Driver"
                              >
                                +Driver
                              </button>
                            )}
                            {l.leadType === 'Vehicle Owner' && (
                              <button
                                onClick={() => handleConvertLead(l._id, 'Supplier')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold"
                                title="Convert to Supplier / Partner"
                              >
                                +Owner
                              </button>
                            )}
                            {l.leadType === 'Customer Enquiry' && (
                              <button
                                onClick={() => handleConvertLead(l._id, 'Customer')}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold"
                                title="Convert to Customer CRM"
                              >
                                +Client
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(l._id, l.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Lead"
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

      {/* Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingLead ? 'Edit Lead Information' : 'Record New Social Media Lead'}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lead Type *</label>
                  <select
                    value={formData.leadType}
                    onChange={(e) => setFormData({ ...formData, leadType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Vehicle">Vehicle Available</option>
                    <option value="Driver">Driver Looking for Trips</option>
                    <option value="Vehicle Owner">Vehicle Owner / Fleet Partner</option>
                    <option value="Customer Enquiry">Customer Booking Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact / Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vehicle Type / Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Van KDH / Prius / Axio"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vehicle Registration (if known)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WP-PD-5544"
                    value={formData.vehicleReg}
                    onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quoted / Expected Rate (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.expectedRate}
                    onChange={(e) => setFormData({ ...formData, expectedRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Source Platform</label>
                  <select
                    value={formData.sourcePlatform}
                    onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Facebook">Facebook Group</option>
                    <option value="WhatsApp">WhatsApp Community</option>
                    <option value="Ikman">Ikman.lk</option>
                    <option value="Recommendation">Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Original Post URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/groups/.../posts/..."
                  value={formData.postUrl}
                  onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
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
                  {editingLead ? 'Save Changes' : 'Record Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
