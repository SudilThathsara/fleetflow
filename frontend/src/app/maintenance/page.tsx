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

export default function MaintenancePage() {
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
    selectedParts: [] as { partId: string; partName: string; quantity: number; unitPrice: number; total: number }[],
  });

  const [partSelection, setPartSelection] = useState({
    partId: '',
    quantity: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, vehRes, prtRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/vehicles'),
        fetch('/api/inventory/parts'),
      ]);

      const svcData = await svcRes.json();
      const vehData = await vehRes.json();
      const prtData = await prtRes.json();

      if (svcData.success) setServices(svcData.data);
      if (vehData.success) setVehicles(vehData.data);
      if (prtData.success) setSpareParts(prtData.data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        vehicle: service.vehicle?._id || service.vehicle || '',
        vehicleReg: service.vehicleReg || '',
        serviceDate: service.serviceDate ? new Date(service.serviceDate).toISOString().split('T')[0] : '',
        odometerReading: service.odometerReading || 0,
        serviceCategory: service.serviceCategory || 'Engine oil change',
        serviceDescription: service.serviceDescription || '',
        workshopName: service.workshopName || '',
        labourCost: service.labourCost || 0,
        sparePartsCost: service.sparePartsCost || 0,
        otherCharges: service.otherCharges || 0,
        nextServiceOdometer: service.nextServiceOdometer || 0,
        nextServiceDate: service.nextServiceDate ? new Date(service.nextServiceDate).toISOString().split('T')[0] : '',
        status: service.status || 'Completed',
        notes: service.notes || '',
        selectedParts: service.sparePartsUsed || [],
      });
    } else {
      setEditingService(null);
      setFormData({
        vehicle: '',
        vehicleReg: '',
        serviceDate: new Date().toISOString().split('T')[0],
        odometerReading: 0,
        serviceCategory: 'Engine oil change',
        serviceDescription: '',
        workshopName: 'Main Workshop',
        labourCost: 4000,
        sparePartsCost: 0,
        otherCharges: 0,
        nextServiceOdometer: 0,
        nextServiceDate: '',
        status: 'Completed',
        notes: '',
        selectedParts: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehId = e.target.value;
    const veh = vehicles.find((v) => v._id === vehId);
    if (veh) {
      setFormData((prev) => ({
        ...prev,
        vehicle: veh._id,
        vehicleReg: veh.registrationNumber,
        odometerReading: veh.currentOdometer || 0,
        nextServiceOdometer: (veh.currentOdometer || 0) + (veh.serviceIntervalKm || 5000),
      }));
    } else {
      setFormData((prev) => ({ ...prev, vehicle: '', vehicleReg: '' }));
    }
  };

  const handleAddPart = () => {
    if (!partSelection.partId || partSelection.quantity <= 0) return;
    const part = spareParts.find((p) => p._id === partSelection.partId);
    if (!part) return;

    const unitPrice = part.unitCost || 0;
    const total = unitPrice * partSelection.quantity;

    const updatedParts = [
      ...formData.selectedParts,
      {
        partId: part._id,
        partName: `${part.partNumber} - ${part.name}`,
        quantity: partSelection.quantity,
        unitPrice,
        total,
      },
    ];

    const totalPartsCost = updatedParts.reduce((sum, p) => sum + p.total, 0);

    setFormData((prev) => ({
      ...prev,
      selectedParts: updatedParts,
      sparePartsCost: totalPartsCost,
    }));

    setPartSelection({ partId: '', quantity: 1 });
  };

  const handleRemovePart = (index: number) => {
    const updatedParts = formData.selectedParts.filter((_, i) => i !== index);
    const totalPartsCost = updatedParts.reduce((sum, p) => sum + p.total, 0);
    setFormData((prev) => ({
      ...prev,
      selectedParts: updatedParts,
      sparePartsCost: totalPartsCost,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle) {
      alert('Please select a vehicle');
      return;
    }

    try {
      const url = editingService ? `/api/services/${editingService._id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving maintenance log:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance entry?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredServices = selectedVehicleFilter
    ? services.filter((s) => (s.vehicle?._id || s.vehicle) === selectedVehicleFilter)
    : services;

  const totalCostOverall = services.reduce(
    (sum, s) => sum + (s.labourCost || 0) + (s.sparePartsCost || 0) + (s.otherCharges || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wrench size={20} />
              </span>
              <h1 className="text-xl font-bold text-slate-800">Vehicle Service & Maintenance Logs</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track periodic servicing, oil changes, workshop jobs, odometer intervals & spare-parts consumption
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Record Service Job</span>
          </button>
        </div>

        {/* Filter and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Service Logs</p>
              <p className="text-xl font-black text-slate-800 mt-1">{services.length}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench size={18} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Maintenance Cost</p>
              <p className="text-xl font-black text-slate-800 mt-1">LKR {totalCostOverall.toLocaleString()}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} - {v.make} {v.model} ({v.currentOdometer?.toLocaleString()} KM)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services List Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Date & Category</th>
                  <th className="py-3 px-4">Odometer Interval</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">Cost Breakdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Loading service records...
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No maintenance records found. Click &quot;Record Service Job&quot; to log vehicle maintenance.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((svc) => {
                    const totalCost = (svc.labourCost || 0) + (svc.sparePartsCost || 0) + (svc.otherCharges || 0);
                    return (
                      <tr key={svc._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <Car size={14} className="text-blue-500" />
                            <span>{svc.vehicleReg}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{new Date(svc.serviceDate).toLocaleDateString()}</div>
                          <div className="text-[11px] font-medium text-slate-400">{svc.serviceCategory}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {svc.odometerReading?.toLocaleString()} KM
                          </span>
                          {svc.nextServiceOdometer && (
                            <div className="text-[10px] text-emerald-600">
                              Next: {svc.nextServiceOdometer?.toLocaleString()} KM
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{svc.workshopName || 'Internal Workshop'}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">LKR {totalCost.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">
                            Labour: {svc.labourCost?.toLocaleString()} | Parts: {svc.sparePartsCost?.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              svc.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {svc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenModal(svc)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(svc._id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
