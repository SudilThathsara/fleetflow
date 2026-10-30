'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Building2,
  FolderGit2,
  Plus,
  Search,
  Trash2,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Car,
  UserCheck,
  Calendar,
  X,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function CompaniesAndProjectsPage() {
  const [activeTab, setActiveTab] = useState<'companies' | 'projects'>('companies');
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    registeredName: '',
    contactPerson: '',
    phone: '',
    email: '',
    billingAddress: '',
    taxNumber: '',
    brNumber: '',
    invoicePreferences: 'Consolidated',
    paymentTerms: '15 Days from Invoice Date',
    status: 'Active',
    notes: '',
  });

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    customerCompany: '',
    companyName: '',
    location: '',
    projectManager: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    billingPreferences: 'Monthly Consolidated Invoice with 3000 KM Allowance',
    status: 'Active',
    notes: '',
    selectedVehicles: [] as string[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, vRes, dRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/projects'),
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
      ]);
      const [cData, pData, vData, dData] = await Promise.all([
        cRes.json(),
        pRes.json(),
        vRes.json(),
        dRes.json(),
      ]);

      if (cData.success) setCompanies(cData.data);
      if (pData.success) setProjects(pData.data);
      if (vData.success) setVehicles(vData.data);
      if (dData.success) setDrivers(dData.data);
    } catch (err) {
      console.error('Failed to fetch companies and projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Company Handlers
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      registeredName: '',
      contactPerson: '',
      phone: '',
      email: '',
      billingAddress: '',
      taxNumber: '',
      brNumber: '',
      invoicePreferences: 'Consolidated',
      paymentTerms: '15 Days from Invoice Date',
      status: 'Active',
      notes: '',
    });
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (c: any) => {
    setEditingCompany(c);
    setCompanyForm({
      name: c.name || '',
      registeredName: c.registeredName || '',
      contactPerson: c.contactPerson || '',
      phone: c.phone || '',
      email: c.email || '',
      billingAddress: c.billingAddress || '',
      taxNumber: c.taxNumber || '',
      brNumber: c.brNumber || '',
      invoicePreferences: c.invoicePreferences || 'Consolidated',
      paymentTerms: c.paymentTerms || '15 Days from Invoice Date',
      status: c.status || 'Active',
      notes: c.notes || '',
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCompany ? `/api/companies/${editingCompany._id}` : '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsCompanyModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Error saving company');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer company?')) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Project Handlers
  const handleOpenAddProject = () => {
    setEditingProject(null);
    const defaultCompany = companies[0];
    setProjectForm({
      name: '',
      customerCompany: defaultCompany?._id || '',
      companyName: defaultCompany?.name || '',
      location: '',
      projectManager: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      billingPreferences: 'Monthly Consolidated Invoice with 3000 KM Allowance',
      status: 'Active',
      notes: '',
      selectedVehicles: [],
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (p: any) => {
    setEditingProject(p);
    setProjectForm({
      name: p.name || '',
      customerCompany: p.customerCompany?._id || p.customerCompany || '',
      companyName: p.companyName || '',
      location: p.location || '',
      projectManager: p.projectManager || '',
      phone: p.phone || '',
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      billingPreferences: p.billingPreferences || 'Monthly Consolidated Invoice with 3000 KM Allowance',
      status: p.status || 'Active',
      notes: p.notes || '',
      selectedVehicles: (p.assignedVehicles || []).map((v: any) => v.registrationNumber),
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCompany = companies.find((c) => c._id === projectForm.customerCompany);
      const assignedVehicles = projectForm.selectedVehicles.map((reg) => {
        const v = vehicles.find((item) => item.registrationNumber === reg);
        return {
          vehicle: v?._id,
          registrationNumber: reg,
          vehicleType: v?.vehicleType || 'Double Cab',
          ownershipType: v?.ownershipType || 'Business-owned',
        };
      });

      const payload = {
        ...projectForm,
        companyName: selectedCompany?.name || projectForm.companyName,
        assignedVehicles,
      };

      const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsProjectModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Error saving project');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      c.billingAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectManager?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Title & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600" /> Multi-Company & Project Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage corporate customer relationships, client entities, and transport operations per project
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab('companies')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'companies'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer Companies ({companies.length})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'projects'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Company Projects ({projects.length})
              </button>
            </div>

            {activeTab === 'companies' ? (
              <button
                onClick={handleOpenAddCompany}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Company
              </button>
            ) : (
              <button
                onClick={handleOpenAddProject}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={18} /> New Project
              </button>
            )}
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Customer Companies</p>
              <h3 className="text-xl font-bold text-slate-800">{companies.length}</h3>
              <p className="text-xs text-emerald-600 font-medium">All Active</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <FolderGit2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Projects</p>
              <h3 className="text-xl font-bold text-slate-800">{projects.length}</h3>
              <p className="text-xs text-slate-500">Corporate & Field</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Car size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Assigned Vehicles</p>
              <h3 className="text-xl font-bold text-slate-800">
                {projects.reduce((acc, p) => acc + (p.assignedVehicles?.length || 0), 0)}
              </h3>
              <p className="text-xs text-indigo-600 font-medium">Double Cabs & Vans</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <FileCheck2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Annual Contracts</p>
              <h3 className="text-xl font-bold text-slate-800">Active</h3>
              <Link href="/contracts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View Rate Cards <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === 'companies'
                  ? 'Search by company name, contact person, or location...'
                  : 'Search by project name, customer company, location, or manager...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content: Companies Tab */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompanies.map((c) => {
              const companyProjects = projects.filter(
                (p) => (p.customerCompany?._id || p.customerCompany) === c._id
              );
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {c.companyId}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{c.name}</h3>
                        {c.registeredName && (
                          <p className="text-xs text-slate-500 font-mono">{c.registeredName}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{c.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-xs">{c.billingAddress}</span>
                      </div>
                    </div>

                    {/* Tax & Terms Info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500">
                      {c.taxNumber && <span>Tax: <strong className="text-slate-700">{c.taxNumber}</strong></span>}
                      {c.brNumber && <span>BR: <strong className="text-slate-700">{c.brNumber}</strong></span>}
                      <span>Terms: <strong className="text-slate-700">{c.paymentTerms}</strong></span>
                    </div>

                    {/* Associated Projects Badge */}
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Projects ({companyProjects.length})</span>
                        <Link
                          href="/contracts"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-normal"
                        >
                          Agreements <ExternalLink size={10} />
                        </Link>
                      </div>
                      {companyProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {companyProjects.map((p) => (
                            <span
                              key={p._id}
                              className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-medium"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No projects created yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditCompany(c)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(c._id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Content: Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {p.projectId}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{p.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold">{p.companyName}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700">
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{p.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-slate-400 shrink-0" />
                      <span>Manager: <strong>{p.projectManager}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span>
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} -{' '}
                        {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Vehicles */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Vehicles ({p.assignedVehicles?.length || 0})
                    </p>
                    {p.assignedVehicles && p.assignedVehicles.length > 0 ? (
                      <div className="space-y-1">
                        {p.assignedVehicles.map((v: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded border border-slate-200"
                          >
                            <span className="font-mono font-bold text-slate-800">{v.registrationNumber}</span>
                            <span className="text-slate-500">{v.vehicleType}</span>
                            <span
                              className={`text-[10px] px-1 rounded ${
                                v.ownershipType === 'Business-owned'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {v.ownershipType || 'Business-owned'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No vehicles assigned</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <Link
                    href={`/billing-engine`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Generate Monthly Bill <ExternalLink size={12} />
                  </Link>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditProject(p)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p._id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add/Edit Company */}
        {isCompanyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingCompany ? 'Edit Customer Company' : 'Add New Customer Company'}
                </h3>
                <button
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Trading Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="e.g. Apex Lanka Holdings (Pvt) Ltd"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Legal Name</label>
                  <input
                    type="text"
                    value={companyForm.registeredName}
                    onChange={(e) => setCompanyForm({ ...companyForm, registeredName: e.target.value })}
                    placeholder="e.g. Apex Lanka Holdings & Infrastructure PLC"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.contactPerson}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                      placeholder="e.g. Eng. Rohan Samarasinghe"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone / Mobile *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      placeholder="e.g. +94 77 123 4567"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Email Address</label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="e.g. logistics@apexlanka.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={companyForm.billingAddress}
                    onChange={(e) => setCompanyForm({ ...companyForm, billingAddress: e.target.value })}
                    placeholder="Full corporate billing address"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">VAT / Tax Number</label>
                    <input
                      type="text"
                      value={companyForm.taxNumber}
                      onChange={(e) => setCompanyForm({ ...companyForm, taxNumber: e.target.value })}
                      placeholder="e.g. VAT-10928374-7000"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={companyForm.paymentTerms}
                      onChange={(e) => setCompanyForm({ ...companyForm, paymentTerms: e.target.value })}
                      placeholder="e.g. 15 Days from Invoice"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCompanyModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    {editingCompany ? 'Save Changes' : 'Create Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Project */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingProject ? 'Edit Project' : 'Create New Customer Project'}
                </h3>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Company *</label>
                  <select
                    required
                    value={projectForm.customerCompany}
                    onChange={(e) => setProjectForm({ ...projectForm, customerCompany: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Customer Company...</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.companyId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g. Southern Expressway Route Operations"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Location *</label>
                    <input
                      type="text"
                      required
                      value={projectForm.location}
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                      placeholder="e.g. Mattala - Hambantota Corridor"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Manager *</label>
                    <input
                      type="text"
                      required
                      value={projectForm.projectManager}
                      onChange={(e) => setProjectForm({ ...projectForm, projectManager: e.target.value })}
                      placeholder="e.g. Eng. Rohan Samarasinghe"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Assign Vehicles from Fleet */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Fleet Vehicles (Double Cabs & Vans)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Select which owned or partner vehicles are dedicated to this project:
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                    {vehicles.map((v) => {
                      const isSelected = projectForm.selectedVehicles.includes(v.registrationNumber);
                      return (
                        <label
                          key={v._id}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                            isSelected ? 'bg-blue-100 text-blue-900 font-semibold' : 'hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProjectForm({
                                  ...projectForm,
                                  selectedVehicles: [...projectForm.selectedVehicles, v.registrationNumber],
                                });
                              } else {
                                setProjectForm({
                                  ...projectForm,
                                  selectedVehicles: projectForm.selectedVehicles.filter((r) => r !== v.registrationNumber),
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Preferences</label>
                  <input
                    type="text"
                    value={projectForm.billingPreferences}
                    onChange={(e) => setProjectForm({ ...projectForm, billingPreferences: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
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
