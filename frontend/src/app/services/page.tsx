'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Wrench, Plus, Filter, Trash2, Edit2, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const [formData, setFormData] = useState({
    vehicle: '',
    vehicleReg: '',
    serviceDate: '',
    odometerReading: 60000,
    serviceCategory: 'General service',
    serviceDescription: '',
    workshopName: '',
    labourCost: 3500,
    sparePartsCost: 15000,
    otherCharges: 0,
    nextServiceOdometer: 65000,
    nextServiceDate: '',
    status: 'Completed',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, vRes] = await Promise.all([fetch('/api/services'), fetch('/api/vehicles')]);
      const sData = await sRes.json();
      const vData = await vRes.json();
      if (sData.success) setServices(sData.data);
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

  const handleOpenAdd = () => {
    setEditingService(null);
    const defaultV = vehicles[0];
    const currOdo = defaultV?.currentOdometer || 60000;
    setFormData({
      vehicle: defaultV?._id || '',
      vehicleReg: defaultV?.registrationNumber || '',
      serviceDate: new Date().toISOString().split('T')[0],
      odometerReading: currOdo,
      serviceCategory: 'Engine oil change',
      serviceDescription: 'Replaced Mobil 1 5W-30 engine oil, genuine oil filter & air filter',
      workshopName: 'Toyota Lanka Maharagama',
      labourCost: 4000,
      sparePartsCost: 18500,
      otherCharges: 0,
      nextServiceOdometer: currOdo + 5000,
      nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Completed',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingService(s);
    setFormData({
      vehicle: s.vehicle,
      vehicleReg: s.vehicleReg,
      serviceDate: s.serviceDate ? s.serviceDate.split('T')[0] : '',
      odometerReading: s.odometerReading,
      serviceCategory: s.serviceCategory,
      serviceDescription: s.serviceDescription,
      workshopName: s.workshopName,
      labourCost: s.labourCost || 0,
      sparePartsCost: s.sparePartsCost || 0,
      otherCharges: s.otherCharges || 0,
      nextServiceOdometer: s.nextServiceOdometer || 0,
      nextServiceDate: s.nextServiceDate ? s.nextServiceDate.split('T')[0] : '',
      status: s.status,
      notes: s.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, sId: string) => {
    if (!confirm(`Are you sure you want to delete service record ${sId}?`)) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
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
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService ? `/api/services/${editingService._id}` : '/api/services';

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
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vehicle Service & Maintenance Tracker</h1>
            <p className="text-sm text-slate-500">
              Track periodic maintenance, repairs, spare parts costs and next service kilometer thresholds
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Record Service</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Service ID</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Date & Odometer</th>
                  <th className="p-4">Category & Work Done</th>
                  <th className="p-4">Workshop</th>
                  <th className="p-4 text-right">Total Cost</th>
                  <th className="p-4">Next Due KM</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading service logs...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No service records logged. Click "Record Service" to add one.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{s.serviceId}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                          {s.vehicleReg}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">
                          {new Date(s.serviceDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-mono text-slate-500 font-bold">
                          {s.odometerReading?.toLocaleString()} KM
                        </p>
                      </td>
                      <td className="p-4 max-w-sm">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {s.serviceCategory}
                        </span>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{s.serviceDescription}</p>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{s.workshopName}</td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        Rs. {s.totalCost?.toLocaleString()}
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-purple-700">
                        {s.nextServiceOdometer ? `${s.nextServiceOdometer.toLocaleString()} KM` : 'N/A'}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.serviceId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Service"
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

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingService ? 'Edit Maintenance Record' : 'Record Vehicle Service & Maintenance'}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle *</label>
                  <select
                    required
                    value={formData.vehicle}
                    onChange={(e) => {
                      const v = vehicles.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        vehicle: e.target.value,
                        vehicleReg: v?.registrationNumber || '',
                        odometerReading: v?.currentOdometer || formData.odometerReading,
                        nextServiceOdometer: (v?.currentOdometer || formData.odometerReading) + 5000,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Odometer (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.odometerReading}
                    onChange={(e) => setFormData({ ...formData, odometerReading: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Category</label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="General service">General service</option>
                    <option value="Engine oil change">Engine oil change</option>
                    <option value="Oil and air filters">Oil and air filters</option>
                    <option value="Tyres and wheel alignment">Tyres and wheel alignment</option>
                    <option value="Brake system">Brake system</option>
                    <option value="Battery">Battery</option>
                    <option value="Engine repairs">Engine repairs</option>
                    <option value="Electrical repairs">Electrical repairs</option>
                    <option value="Body repairs">Body repairs</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Workshop / Service Provider *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Lanka / Auto Mirage"
                    value={formData.workshopName}
                    onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Labour Cost (Rs.)</label>
                  <input
                    type="number"
                    value={formData.labourCost}
                    onChange={(e) => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Spare Parts Cost (Rs.)
                  </label>
                  <input
                    type="number"
                    value={formData.sparePartsCost}
                    onChange={(e) => setFormData({ ...formData, sparePartsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Next Service Due (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.nextServiceOdometer}
                    onChange={(e) => setFormData({ ...formData, nextServiceOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-purple-700 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                  placeholder="Details of parts replaced, engine oil specifications, diagnostics..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                ></textarea>
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
                  {editingService ? 'Save Record' : 'Save Service Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
