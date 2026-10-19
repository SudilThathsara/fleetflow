'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Car,
  UserCheck,
  Edit2,
  Trash2,
  X,
  FileText,
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    customerPhone: '',
    bookingSource: 'Direct',
    pickupLocation: 'Colombo',
    destination: '',
    pickupDate: '',
    returnDate: '',
    vehicleType: 'Car',
    assignedVehicle: '',
    assignedVehicleReg: '',
    assignedDriver: '',
    assignedDriverName: '',
    agreedPrice: 15000,
    advanceReceived: 5000,
    startOdometer: 0,
    endOdometer: 0,
    actualFuelCost: 0,
    status: 'Confirmed',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `/api/bookings?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setBookings(data.data);

      const [vRes, dRes, cRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
        fetch('/api/customers'),
      ]);
      const [vData, dData, cData] = await Promise.all([vRes.json(), dRes.json(), cRes.json()]);
      if (vData.success) setVehicles(vData.data);
      if (dData.success) setDrivers(dData.data);
      if (cData.success) setCustomers(cData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingBooking(null);
    const defaultCust = customers[0];
    const defaultV = vehicles[0];
    const defaultD = drivers[0];

    setFormData({
      customer: defaultCust?._id || '',
      customerName: defaultCust?.name || '',
      customerPhone: defaultCust?.phone || '',
      bookingSource: 'Direct',
      pickupLocation: 'Colombo Airport (BIA)',
      destination: 'Bentota & Galle',
      pickupDate: new Date().toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      vehicleType: defaultV?.vehicleType || 'Car',
      assignedVehicle: defaultV?._id || '',
      assignedVehicleReg: defaultV?.registrationNumber || '',
      assignedDriver: defaultD?._id || '',
      assignedDriverName: defaultD?.fullName || '',
      agreedPrice: 22000,
      advanceReceived: 5000,
      startOdometer: defaultV?.currentOdometer || 0,
      endOdometer: (defaultV?.currentOdometer || 0) + 180,
      actualFuelCost: 6500,
      status: 'Confirmed',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBooking(b);
    setFormData({
      customer: b.customer,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      bookingSource: b.bookingSource,
      pickupLocation: b.pickupLocation,
      destination: b.destination,
      pickupDate: b.pickupDate ? b.pickupDate.split('T')[0] : '',
      returnDate: b.returnDate ? b.returnDate.split('T')[0] : '',
      vehicleType: b.vehicleType,
      assignedVehicle: b.assignedVehicle || '',
      assignedVehicleReg: b.assignedVehicleReg || '',
      assignedDriver: b.assignedDriver || '',
      assignedDriverName: b.assignedDriverName || '',
      agreedPrice: b.agreedPrice || 0,
      advanceReceived: b.advanceReceived || 0,
      startOdometer: b.startOdometer || 0,
      endOdometer: b.endOdometer || 0,
      actualFuelCost: b.actualFuelCost || 0,
      status: b.status,
      notes: b.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, bId: string) => {
    if (!confirm(`Are you sure you want to delete booking ${bId}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
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
      const method = editingBooking ? 'PUT' : 'POST';
      const url = editingBooking ? `/api/bookings/${editingBooking._id}` : '/api/bookings';

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
            <h1 className="text-2xl font-bold text-slate-900">Bookings & Transport Trips</h1>
            <p className="text-sm text-slate-500">
              Operational lifecycle from customer booking to vehicle dispatch, odometer tracking & running chart sync
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Create Booking</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, booking ID, destination, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Filter size={16} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Invoiced">Invoiced</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pickup & Return</th>
                  <th className="p-4">Route Details</th>
                  <th className="p-4">Vehicle & Driver</th>
                  <th className="p-4 text-right">Agreed Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading bookings from database...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No bookings found. Click "Create Booking" to add one.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{b.bookingId}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{b.customerName}</p>
                        <p className="text-xs text-slate-500">{b.customerPhone}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        <p>From: {new Date(b.pickupDate).toLocaleDateString()}</p>
                        <p>To: {new Date(b.returnDate).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {b.pickupLocation} &rarr; {b.destination}
                        </p>
                        {b.totalKm > 0 && (
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {b.totalKm} KM recorded
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs font-bold text-slate-800">
                          {b.assignedVehicleReg || 'No Vehicle'}
                        </p>
                        <p className="text-xs text-slate-500">{b.assignedDriverName || 'No Driver'}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-bold text-slate-900">Rs. {b.agreedPrice?.toLocaleString()}</p>
                        {b.advanceReceived > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold block">
                            Adv: Rs. {b.advanceReceived?.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            b.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : b.status === 'Confirmed'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Booking"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.bookingId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Booking"
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

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingBooking ? 'Edit Booking Details' : 'Create Transport Booking'}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer *</label>
                  <select
                    required
                    value={formData.customer}
                    onChange={(e) => {
                      const c = customers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        customer: e.target.value,
                        customerName: c?.name || '',
                        customerPhone: c?.phone || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Booking Source</label>
                  <select
                    value={formData.bookingSource}
                    onChange={(e) => setFormData({ ...formData, bookingSource: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Direct">Direct</option>
                    <option value="Facebook">Facebook Groups</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Repeat Customer">Repeat Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Vehicle</label>
                  <select
                    value={formData.assignedVehicle}
                    onChange={(e) => {
                      const v = vehicles.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        assignedVehicle: e.target.value,
                        assignedVehicleReg: v?.registrationNumber || '',
                        startOdometer: v?.currentOdometer || formData.startOdometer,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} ({v.make} {v.model}) - {v.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Driver</label>
                  <select
                    value={formData.assignedDriver}
                    onChange={(e) => {
                      const d = drivers.find((x) => x._id === e.target.value);
                      setFormData({
                        ...formData,
                        assignedDriver: e.target.value,
                        assignedDriverName: d?.fullName || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.phone}) - {d.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Agreed Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.agreedPrice}
                    onChange={(e) => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advance Received (Rs.)</label>
                  <input
                    type="number"
                    value={formData.advanceReceived}
                    onChange={(e) => setFormData({ ...formData, advanceReceived: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Odometer (KM)</label>
                  <input
                    type="number"
                    value={formData.startOdometer}
                    onChange={(e) => setFormData({ ...formData, startOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Odometer (KM)</label>
                  <input
                    type="number"
                    value={formData.endOdometer}
                    onChange={(e) => setFormData({ ...formData, endOdometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed (Auto-syncs Running Chart)</option>
                    <option value="Invoiced">Invoiced</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special client requirements, tour itinerary..."
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
                  {editingBooking ? 'Save Changes' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
