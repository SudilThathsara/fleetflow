'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Wrench,
  Plus,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  CheckCircle2,
  Package,
  Car,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicle: '',
    vehicleReg: '',
    serviceDate: '',
    odometerReading: 60000,
    serviceCategory: 'Engine oil change',
    serviceDescription: '',
    workshopName: '',
    labourCost: 4000,
    sparePartsCost: 0,
    otherCharges: 0,
    nextServiceOdometer: 65000,
    nextServiceDate: '',
    status: 'Completed',
    notes: '',
    selectedParts: [] as {
      part: string;
      sku: string;
      partName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      issuedFromInventory: boolean;
    }[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, vRes, pRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/vehicles'),
        fetch('/api/inventory/parts'),
      ]);
      const sData = await sRes.json();
      const vData = await vRes.json();
      const pData = await pRes.json();

      if (sData.success) setServices(sData.data);
      if (vData.success) setVehicles(vData.data);
      if (pData.success) setSpareParts(pData.data);
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
    setEditingService(null);
    const defaultV = vehicles[0];
    const currOdo = defaultV?.currentOdometer || 50000;
    setFormData({
      vehicle: defaultV?._id || '',
      vehicleReg: defaultV?.registrationNumber || '',
      serviceDate: new Date().toISOString().split('T')[0],
      odometerReading: currOdo,
      serviceCategory: 'Engine oil change',
      serviceDescription: 'Periodic 5,000 km routine service, synthetic engine oil & filter replacement',
      workshopName: 'FleetFlow Central Garage & Workshop',
      labourCost: 4500,
      sparePartsCost: 0,
      otherCharges: 0,
      nextServiceOdometer: currOdo + 5000,
      nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Completed',
      notes: '',
      selectedParts: [],
    });
    setIsModalOpen(true);
  };

  const handleAddPartToJob = (partId: string) => {
    const part = spareParts.find((p) => p._id === partId);
    if (!part) return;

    const existingIndex = formData.selectedParts.findIndex((item) => item.part === partId);
    if (existingIndex >= 0) {
      const updated = [...formData.selectedParts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      const newPartsCost = updated.reduce((s, i) => s + i.totalCost, 0);
      setFormData({ ...formData, selectedParts: updated, sparePartsCost: newPartsCost });
    } else {
      const newPartItem = {
        part: part._id,
        sku: part.sku,
        partName: part.name,
        quantity: 1,
        unitCost: part.unitCost,
        totalCost: part.unitCost,
        issuedFromInventory: true,
      };
      const updated = [...formData.selectedParts, newPartItem];
      const newPartsCost = updated.reduce((s, i) => s + i.totalCost, 0);
      setFormData({ ...formData, selectedParts: updated, sparePartsCost: newPartsCost });
    }
  };

  const handleRemovePartFromJob = (index: number) => {
    const updated = formData.selectedParts.filter((_, idx) => idx !== index);
    const newPartsCost = updated.reduce((s, i) => s + i.totalCost, 0);
    setFormData({ ...formData, selectedParts: updated, sparePartsCost: newPartsCost });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedV = vehicles.find((v) => v._id === formData.vehicle);
      const payload = {
        ...formData,
        vehicleReg: selectedV?.registrationNumber || formData.vehicleReg,
        partsUsed: formData.selectedParts,
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Error saving service job');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredServices = selectedVehicleFilter
    ? services.filter((s) => s.vehicle === selectedVehicleFilter || s.vehicleReg === selectedVehicleFilter)
    : services;

  const totalSpend = services.reduce((s, item) => s + (item.totalCost || 0), 0);
  const totalPartsCost = services.reduce((s, item) => s + (item.sparePartsCost || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="text-blue-600" /> Vehicle Service & Maintenance Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Maintain vehicle service histories, routine engine oil changes, workshop bills, and spare parts issuance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Package size={16} /> Spare-Parts Inventory
            </Link>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={18} /> Record New Service
            </button>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Service Jobs</p>
              <h3 className="text-xl font-bold text-slate-800">{services.length} Records</h3>
              <p className="text-xs text-slate-500">Fleet history</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Maintenance Spend</p>
              <h3 className="text-xl font-bold text-slate-800">LKR {Number(totalSpend).toLocaleString()}</h3>
              <p className="text-xs text-emerald-600 font-medium">Labour & parts included</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Spare Parts Consumed</p>
              <h3 className="text-xl font-bold text-slate-800">LKR {Number(totalPartsCost).toLocaleString()}</h3>
              <p className="text-xs text-indigo-600 font-medium">Issued from stock</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Service Interval Rule</p>
              <h3 className="text-xl font-bold text-slate-800">Every 5,000 KM</h3>
              <p className="text-xs text-amber-600 font-medium">Automatic alerts</p>
            </div>
          </div>
        </div>

        {/* Vehicle History Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Filter by Vehicle:</label>
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Fleet Vehicles ({services.length} records)</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.make} {v.model} ({v.ownershipType})
                </option>
              ))}
            </select>
          </div>

          {selectedVehicleFilter && (
            <button
              onClick={() => setSelectedVehicleFilter('')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Clear Vehicle Filter
            </button>
          )}
        </div>

        {/* Service Records Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedVehicleFilter ? 'Vehicle Service History Logs' : 'All Fleet Service Records'}
            </h3>
            <span className="text-xs text-slate-500">{filteredServices.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Service ID</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category & Workshop</th>
                  <th className="p-3 text-right">Odometer</th>
                  <th className="p-3 text-right">Next Due</th>
                  <th className="p-3 text-right">Labour</th>
                  <th className="p-3 text-right">Parts</th>
                  <th className="p-3 text-right">Total Bill</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <tr key={srv._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">{srv.serviceId}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-900">{srv.vehicleReg}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {srv.serviceDate ? new Date(srv.serviceDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">{srv.serviceCategory}</span>
                      <span className="text-[11px] text-slate-500">{srv.workshopName}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-800">
                      {Number(srv.odometerReading || 0).toLocaleString()} km
                    </td>
                    <td className="p-3 text-right font-mono text-blue-700">
                      {srv.nextServiceOdometer ? `${Number(srv.nextServiceOdometer).toLocaleString()} km` : '—'}
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      LKR {Number(srv.labourCost || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      LKR {Number(srv.sparePartsCost || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 text-sm">
                      LKR {Number(srv.totalCost || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(srv._id)}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No service records found. Click "Record New Service" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Record Service */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Record Vehicle Maintenance & Issue Parts</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Vehicle *</label>
                    <select
                      required
                      value={formData.vehicle}
                      onChange={(e) => {
                        const v = vehicles.find((item) => item._id === e.target.value);
                        const currOdo = v?.currentOdometer || 50000;
                        setFormData({
                          ...formData,
                          vehicle: e.target.value,
                          vehicleReg: v?.registrationNumber || '',
                          odometerReading: currOdo,
                          nextServiceOdometer: currOdo + 5000,
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.vehicleType} - {v.make})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.serviceDate}
                      onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Category *</label>
                    <select
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Engine oil change">Engine oil change</option>
                      <option value="General service">General service</option>
                      <option value="Oil and air filters">Oil and air filters</option>
                      <option value="Brake system">Brake system</option>
                      <option value="Tyres and wheel alignment">Tyres and wheel alignment</option>
                      <option value="Battery">Battery</option>
                      <option value="Engine repairs">Engine repairs</option>
                      <option value="Suspension repairs">Suspension repairs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Workshop / Garage *</label>
                    <input
                      type="text"
                      required
                      value={formData.workshopName}
                      onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                      placeholder="e.g. FleetFlow Garage / Toyota Lanka"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Odometer (km) *</label>
                    <input
                      type="number"
                      required
                      value={formData.odometerReading}
                      onChange={(e) => {
                        const odo = Number(e.target.value);
                        setFormData({
                          ...formData,
                          odometerReading: odo,
                          nextServiceOdometer: odo + 5000,
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Next Service Odometer (km)</label>
                    <input
                      type="number"
                      value={formData.nextServiceOdometer}
                      onChange={(e) => setFormData({ ...formData, nextServiceOdometer: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Issue Spare Parts from Inventory */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Package size={15} className="text-blue-600" /> Issue Spare Parts from Inventory
                    </label>
                    <span className="text-[11px] text-slate-500">Auto-deducts from stock</span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      id="partSelect"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select part to issue...</option>
                      {spareParts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.currentStock} {p.unitOfMeasure} in stock @ LKR {p.unitCost})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const selectEl = document.getElementById('partSelect') as HTMLSelectElement;
                        if (selectEl?.value) handleAddPartToJob(selectEl.value);
                      }}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>

                  {formData.selectedParts.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {formData.selectedParts.map((sp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{sp.partName}</span>
                            <span className="text-slate-400 font-mono text-[11px] block">{sp.sku}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>
                              Qty: <strong>{sp.quantity}</strong>
                            </span>
                            <span className="font-bold text-slate-800">
                              LKR {Number(sp.totalCost).toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePartFromJob(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Labour Cost (LKR)</label>
                    <input
                      type="number"
                      value={formData.labourCost}
                      onChange={(e) => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parts Cost (LKR)</label>
                    <input
                      type="number"
                      value={formData.sparePartsCost}
                      onChange={(e) => setFormData({ ...formData, sparePartsCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Other / Fluids</label>
                    <input
                      type="number"
                      value={formData.otherCharges}
                      onChange={(e) => setFormData({ ...formData, otherCharges: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs flex justify-between font-bold">
                  <span>Total Bill Amount:</span>
                  <span>
                    LKR{' '}
                    {Number(
                      Number(formData.labourCost) + Number(formData.sparePartsCost) + Number(formData.otherCharges)
                    ).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Description / Notes</label>
                  <textarea
                    rows={2}
                    value={formData.serviceDescription}
                    onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Save Service Record
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
