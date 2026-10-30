'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Plus, AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterExpiring, setFilterExpiring] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    targetType: 'Vehicle',
    targetId: '',
    targetIdentifier: '',
    documentType: 'Revenue Licence',
    referenceNumber: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/documents';
      if (filterExpiring) url += '?expiringSoon=true';

      const [dRes, vRes, drRes] = await Promise.all([
        fetch(url),
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
      ]);
      const [dData, vData, drData] = await Promise.all([dRes.json(), vRes.json(), drRes.json()]);
      if (dData.success) setDocuments(dData.data);
      if (vData.success) setVehicles(vData.data);
      if (drData.success) setDrivers(drData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterExpiring]);

  const handleOpenAdd = () => {
    const defaultV = vehicles[0];
    setFormData({
      targetType: 'Vehicle',
      targetId: defaultV?._id || '',
      targetIdentifier: defaultV?.registrationNumber || '',
      documentType: 'Revenue Licence',
      referenceNumber: `RL-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, docId: string) => {
    if (!confirm(`Are you sure you want to remove document record ${docId}?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
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
      const res = await fetch('/api/documents', {
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

  const getStatusBadge = (expiry: string) => {
    const diffDays = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Expired ({Math.abs(diffDays)}d ago)
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Expiring Soon ({diffDays}d left)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Valid ({diffDays}d left)
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vehicle & Driver Document Expiries</h1>
            <p className="text-sm text-slate-500">
              Track Revenue Licences, Insurances, Emission Tests, Fitness Certificates & Driving Licences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterExpiring(!filterExpiring)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 border transition-colors ${
                filterExpiring
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle size={16} />
              <span>{filterExpiring ? 'Showing 30-Day Expiries' : 'Filter 30-Day Expiries'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Add Document Record</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Doc ID</th>
                  <th className="p-4">Owner / Entity</th>
                  <th className="p-4">Document Type</th>
                  <th className="p-4">Reference No</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No documents found matching filters.
                    </td>
                  </tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{d.docId}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{d.targetIdentifier}</span>
                        <span className="text-xs text-slate-500">({d.targetType})</span>
                      </td>
                      <td className="p-4 font-semibold text-blue-700">{d.documentType}</td>
                      <td className="p-4 font-mono text-xs font-bold text-slate-800">{d.referenceNumber}</td>
                      <td className="p-4 font-medium text-slate-900">
                        {new Date(d.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">{getStatusBadge(d.expiryDate)}</td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDelete(d._id, d.docId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Record"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add Expiry Tracking Document</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Entity *</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => {
                    const type = e.target.value;
                    const id = type === 'Vehicle' ? vehicles[0]?._id : drivers[0]?._id;
                    const ident =
                      type === 'Vehicle' ? vehicles[0]?.registrationNumber : drivers[0]?.fullName;
                    setFormData({
                      ...formData,
                      targetType: type,
                      targetId: id || '',
                      targetIdentifier: ident || '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="Vehicle">Vehicle</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select {formData.targetType} *
                </label>
                <select
                  required
                  value={formData.targetId}
                  onChange={(e) => {
                    if (formData.targetType === 'Vehicle') {
                      const v = vehicles.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        targetId: e.target.value,
                        targetIdentifier: v?.registrationNumber || '',
                      });
                    } else {
                      const d = drivers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        targetId: e.target.value,
                        targetIdentifier: d?.fullName || '',
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  {formData.targetType === 'Vehicle'
                    ? vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.make} {v.model})
                        </option>
                      ))
                    : drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.fullName} ({d.phone})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="Revenue Licence">Revenue Licence</option>
                  <option value="Insurance">Insurance Policy</option>
                  <option value="Emission Test Certificate">Emission Test Certificate</option>
                  <option value="Fitness Certificate">Fitness Certificate</option>
                  <option value="Driving Licence">Driving Licence</option>
                  <option value="Permit">Permit</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Document / Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
