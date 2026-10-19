'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  FileSpreadsheet,
  Plus,
  Download,
  Calendar,
  Car,
  UserCheck,
  TrendingUp,
  Fuel,
  Trash2,
  Edit2,
  X,
  FileDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RunningChartsPage() {
  const [monthYear, setMonthYear] = useState('2026-10');
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const [formData, setFormData] = useState({
    date: '',
    vehicle: '',
    vehicleReg: '',
    driver: '',
    driverName: '',
    customerName: '',
    startLocation: '',
    destination: '',
    startOdometer: 0,
    endOdometer: 0,
    revenue: 0,
    fuelCost: 0,
    tollCharges: 0,
    parkingCost: 0,
    otherExpenses: 0,
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `/api/running-charts?monthYear=${monthYear}`;
      if (selectedVehicle) url += `&vehicleId=${selectedVehicle}`;
      if (selectedDriver) url += `&driverId=${selectedDriver}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
        setSummary(data.summary);
      }

      // Fetch vehicles & drivers for dropdowns
      const [vRes, dRes] = await Promise.all([fetch('/api/vehicles'), fetch('/api/drivers')]);
      const vData = await vRes.json();
      const dData = await dRes.json();
      if (vData.success) setVehicles(vData.data);
      if (dData.success) setDrivers(dData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthYear, selectedVehicle, selectedDriver]);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    const defaultV = vehicles[0];
    const defaultD = drivers[0];
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vehicle: defaultV?._id || '',
      vehicleReg: defaultV?.registrationNumber || '',
      driver: defaultD?._id || '',
      driverName: defaultD?.fullName || '',
      customerName: '',
      startLocation: 'Colombo',
      destination: '',
      startOdometer: defaultV?.currentOdometer || 0,
      endOdometer: (defaultV?.currentOdometer || 0) + 100,
      revenue: 15000,
      fuelCost: 4500,
      tollCharges: 800,
      parkingCost: 200,
      otherExpenses: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date ? entry.date.split('T')[0] : '',
      vehicle: entry.vehicle,
      vehicleReg: entry.vehicleReg,
      driver: entry.driver,
      driverName: entry.driverName,
      customerName: entry.customerName || '',
      startLocation: entry.startLocation,
      destination: entry.destination,
      startOdometer: entry.startOdometer,
      endOdometer: entry.endOdometer,
      revenue: entry.revenue || 0,
      fuelCost: entry.fuelCost || 0,
      tollCharges: entry.tollCharges || 0,
      parkingCost: entry.parkingCost || 0,
      otherExpenses: entry.otherExpenses || 0,
      notes: entry.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, entryId: string) => {
    if (!confirm(`Are you sure you want to delete running chart entry ${entryId}?`)) return;
    try {
      const res = await fetch(`/api/running-charts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
      else alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.endOdometer) < Number(formData.startOdometer)) {
      alert('End Odometer cannot be less than Start Odometer!');
      return;
    }

    try {
      const method = editingEntry ? 'PUT' : 'POST';
      const url = editingEntry ? `/api/running-charts/${editingEntry._id}` : '/api/running-charts';

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

  // Export to Excel
  const exportToExcel = () => {
    const rows = entries.map((e) => ({
      'Entry ID': e.entryId,
      Date: new Date(e.date).toLocaleDateString(),
      Vehicle: e.vehicleReg,
      Driver: e.driverName,
      Customer: e.customerName || 'N/A',
      From: e.startLocation,
      To: e.destination,
      'Start KM': e.startOdometer,
      'End KM': e.endOdometer,
      'Total KM': e.totalKm,
      'Revenue (LKR)': e.revenue,
      'Fuel Cost': e.fuelCost,
      Tolls: e.tollCharges,
      Parking: e.parkingCost,
      'Other Exp': e.otherExpenses,
      'Net Profit':
        e.revenue - (e.fuelCost + e.tollCharges + e.parkingCost + e.otherExpenses),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `RunningChart_${monthYear}`);
    XLSX.writeFile(wb, `FleetFlow_Running_Chart_${monthYear}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`FleetFlow Lanka — Monthly Vehicle Running Chart (${monthYear})`, 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} | Total KM: ${summary?.totalKm || 0} | Total Revenue: Rs. ${summary?.totalRevenue?.toLocaleString()}`,
      14,
      22
    );

    const tableRows = entries.map((e) => [
      e.entryId,
      new Date(e.date).toLocaleDateString(),
      e.vehicleReg,
      e.driverName,
      `${e.startLocation} -> ${e.destination}`,
      e.startOdometer,
      e.endOdometer,
      e.totalKm,
      e.revenue?.toLocaleString(),
      e.fuelCost?.toLocaleString(),
      (e.revenue - (e.fuelCost + e.tollCharges + e.parkingCost + e.otherExpenses))?.toLocaleString(),
    ]);

    autoTable(doc, {
      head: [['ID', 'Date', 'Vehicle', 'Driver', 'Route', 'Start', 'End', 'KM', 'Revenue', 'Fuel', 'Profit']],
      body: tableRows,
      startY: 26,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`FleetFlow_Running_Chart_${monthYear}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monthly Vehicle Running Charts</h1>
            <p className="text-sm text-slate-500">
              Digital monthly running sheet replacing Excel with automated odometer calculations & exports
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <FileSpreadsheet size={16} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <FileDown size={16} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Filters & Month Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-slate-500" />
              <input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} ({v.make} {v.model})
                </option>
              ))}
            </select>

            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
            >
              <option value="">All Drivers</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Distance Recorded</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {summary?.totalKm ? summary.totalKm.toLocaleString() : 0} KM
            </h3>
            <p className="text-xs text-slate-500 mt-1">For selected month</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Agreed Running Charges</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              Rs. {summary?.totalRevenue ? summary.totalRevenue.toLocaleString() : 0}
            </h3>
            <p className="text-xs text-emerald-600 mt-1">Gross vehicle revenue</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Fuel & Trip Expenses</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              Rs.{' '}
              {(
                (summary?.totalFuelCost || 0) +
                (summary?.totalTolls || 0) +
                (summary?.totalParking || 0) +
                (summary?.totalOtherExpenses || 0)
              ).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Direct trip expenses</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">Net Trip Profit</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">
              Rs. {summary?.netOperationalProfit ? summary.netOperationalProfit.toLocaleString() : 0}
            </h3>
            <p className="text-xs text-blue-600 mt-1">Revenue minus trip costs</p>
          </div>
        </div>

        {/* Running Chart Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3 pl-5">Date</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Journey Route</th>
                  <th className="p-3 text-right">Start KM</th>
                  <th className="p-3 text-right">End KM</th>
                  <th className="p-3 text-right">Distance</th>
                  <th className="p-3 text-right">Revenue</th>
                  <th className="p-3 text-right">Fuel Cost</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                      Loading running chart entries...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No running entries recorded for this month. Click "Add Entry" to create one.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 pl-5 font-medium text-slate-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                          {entry.vehicleReg}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{entry.driverName}</td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800">
                          {entry.startLocation} &rarr; {entry.destination}
                        </p>
                        {entry.customerName && (
                          <span className="text-xs text-slate-500">Client: {entry.customerName}</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {entry.startOdometer?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {entry.endOdometer?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {entry.totalKm?.toLocaleString()} KM
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        Rs. {entry.revenue?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-amber-600">
                        Rs. {entry.fuelCost?.toLocaleString()}
                      </td>
                      <td className="p-3 pr-5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id, entry.entryId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Entry"
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

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingEntry ? 'Edit Running Chart Entry' : 'Add Monthly Running Chart Entry'}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

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
                        startOdometer: v?.currentOdometer || formData.startOdometer,
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driver *</label>
                  <select
                    required
                    value={formData.driver}
                    onChange={(e) => {
                      const d = drivers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        driver: e.target.value,
                        driverName: d?.fullName || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Aitken Spence / Airport Pickup"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Colombo"
                    value={formData.startLocation}
                    onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kandy / Galle"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Odometer (KM) *</label>
                  <input
                    type="number"
                    required
                    value={formData.startOdometer}
                    onChange={(e) => setFormData({ ...formData, startOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Odometer (KM) *</label>
                  <input
                    type="number"
                    required
                    value={formData.endOdometer}
                    onChange={(e) => setFormData({ ...formData, endOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-xs text-blue-600 font-bold block mt-1">
                    Calculated Distance: {Math.max(0, formData.endOdometer - formData.startOdometer)} KM
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Agreed Revenue (Rs.)</label>
                  <input
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fuel Cost (Rs.)</label>
                  <input
                    type="number"
                    value={formData.fuelCost}
                    onChange={(e) => setFormData({ ...formData, fuelCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-amber-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tolls (Rs.)</label>
                  <input
                    type="number"
                    value={formData.tollCharges}
                    onChange={(e) => setFormData({ ...formData, tollCharges: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parking & Other (Rs.)</label>
                  <input
                    type="number"
                    value={formData.parkingCost}
                    onChange={(e) => setFormData({ ...formData, parkingCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Trip Highlights</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Highway routes taken, client feedback, etc."
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
                  {editingEntry ? 'Save Entry' : 'Record Running Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
