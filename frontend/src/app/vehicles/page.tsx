'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDeleteConfirmation } from '@/components/layout/DeleteConfirmation';
import {
  Car,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Wrench,
  CheckCircle,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
  Globe,
  ExternalLink,
  Sparkles,
  Star,
  Check,
  Eye,
} from 'lucide-react';

const COMMON_FEATURES = [
  'Dual A/C',
  '4WD / 4x4 Off-Road',
  'Reclining Luxury Seats',
  'Large Luggage Space',
  'Leather Interior',
  'Bluetooth Audio System',
  'Reverse Camera & Sensors',
  'Tinted Privacy Glass',
  'USB Fast Charging Ports',
  'GPS Telemetry Tracking',
];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Toyota KDH High-Roof Van',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
  },
  {
    name: 'Toyota Hilux 4x4 Double-Cab',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000',
  },
  {
    name: 'Executive Sedan / Car',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000',
  },
  {
    name: 'Luxury SUV / Prado',
    url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1000',
  },
];

export default function VehiclesPage() {
  const { confirmDelete } = useDeleteConfirmation();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState<'specs' | 'photos'>('specs');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'Car',
    make: '',
    model: '',
    manufacturingYear: 2022,
    color: 'White',
    fuelType: 'Diesel',
    seatingCapacity: 4,
    currentOdometer: 45000,
    ownershipType: 'Business-owned',
    serviceIntervalKm: 5000,
    hireRate: 8500,
    status: 'Available',
    notes: '',
    isPublishedToFleet: true,
    publicDescription: '',
    publicPhotos: [] as string[],
    publicFeatures: [] as string[],
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const url = `/api/vehicles?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setActiveModalTab('specs');
    setImageUrlInput('');
    setCustomFeatureInput('');
    setFormData({
      registrationNumber: '',
      vehicleType: 'Car',
      make: '',
      model: '',
      manufacturingYear: new Date().getFullYear() - 2,
      color: 'White',
      fuelType: 'Diesel',
      seatingCapacity: 4,
      currentOdometer: 35000,
      ownershipType: 'Business-owned',
      serviceIntervalKm: 5000,
      hireRate: 8500,
      status: 'Available',
      notes: '',
      isPublishedToFleet: true,
      publicDescription: 'Maintained to high enterprise safety standards, equipped with verified GPS, full air conditioning, and driven by licensed professional chauffeurs.',
      publicPhotos: [],
      publicFeatures: ['Dual A/C', 'GPS Telemetry Tracking'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVehicle(v);
    setActiveModalTab('specs');
    setImageUrlInput('');
    setCustomFeatureInput('');
    setFormData({
      registrationNumber: v.registrationNumber || '',
      vehicleType: v.vehicleType || 'Car',
      make: v.make || '',
      model: v.model || '',
      manufacturingYear: v.manufacturingYear || 2020,
      color: v.color || 'White',
      fuelType: v.fuelType || 'Diesel',
      seatingCapacity: v.seatingCapacity || 4,
      currentOdometer: v.currentOdometer || 0,
      ownershipType: v.ownershipType || 'Business-owned',
      serviceIntervalKm: v.serviceIntervalKm || 5000,
      hireRate: v.hireRate || 0,
      status: v.status || 'Available',
      notes: v.notes || '',
      isPublishedToFleet: v.isPublishedToFleet ?? false,
      publicDescription: v.publicDescription || '',
      publicPhotos: v.publicPhotos || [],
      publicFeatures: v.publicFeatures || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, reg: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete vehicle ${reg}?`))) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return;
      }
      if (file.size > 2.5 * 1024 * 1024) {
        alert(`Image ${file.name} is larger than 2.5MB. Please choose a smaller file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const resultStr = reader.result;
          setFormData((prev) => ({
            ...prev,
            publicPhotos: [...prev.publicPhotos, resultStr],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      publicPhotos: [...prev.publicPhotos, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      publicPhotos: prev.publicPhotos.filter((_, i) => i !== idx),
    }));
  };

  const handleSetCoverPhoto = (idx: number) => {
    setFormData((prev) => {
      const photos = [...prev.publicPhotos];
      const [selected] = photos.splice(idx, 1);
      return { ...prev, publicPhotos: [selected, ...photos] };
    });
  };

  const handleToggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.publicFeatures.includes(feature);
      if (exists) {
        return { ...prev, publicFeatures: prev.publicFeatures.filter((f) => f !== feature) };
      } else {
        return { ...prev, publicFeatures: [...prev.publicFeatures, feature] };
      }
    });
  };

  const handleAddCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    const feat = customFeatureInput.trim();
    if (!formData.publicFeatures.includes(feat)) {
      setFormData((prev) => ({ ...prev, publicFeatures: [...prev.publicFeatures, feat] }));
    }
    setCustomFeatureInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingVehicle ? 'PUT' : 'POST';
      const url = editingVehicle ? `/api/vehicles/${editingVehicle._id}` : '/api/vehicles';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchVehicles();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Car className="text-blue-600" size={26} />
              <span>Vehicle Registry & Fleet</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage fleet vehicles, maintenance odometer, and showcase photos
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus size={18} />
            <span>Register Vehicle</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by registration (CAB-4521), make, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="On Trip">On Trip</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Vehicle</th>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Specs & Capacity</th>
                  <th className="p-4">Ownership</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Next Service</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading vehicles from database...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                      <Car size={36} className="mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700">No vehicles match your search</p>
                      <p className="text-xs text-slate-400">Click "Register Vehicle" to add your fleet</p>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {/* Image Thumbnail */}
                          <div className="h-12 w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group">
                            {v.publicPhotos?.[0] ? (
                              <img
                                src={v.publicPhotos[0]}
                                alt={v.make}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Car size={20} className="text-slate-400" />
                            )}
                            {v.publicPhotos?.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-[9px] font-bold text-white px-1 rounded">
                                +{v.publicPhotos.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {v.make} {v.model}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{v.vehicleId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono font-bold text-xs tracking-wider">
                          {v.registrationNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 text-xs">
                          {v.vehicleType} • {v.manufacturingYear || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {v.fuelType} • {v.seatingCapacity} Seats • {v.color || 'White'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {v.ownershipType || 'Business-owned'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 text-xs">
                        {v.currentOdometer?.toLocaleString()} KM
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <span
                          className={
                            v.currentOdometer >= v.nextServiceOdometer
                              ? 'text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded'
                              : 'text-slate-600'
                          }
                        >
                          {v.nextServiceOdometer?.toLocaleString()} KM
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            v.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'Booked' || v.status === 'On Trip'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : v.status === 'Under Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Vehicle & Photos"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, v.registrationNumber)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Vehicle"
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

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Car className="text-blue-600" size={22} />
                  <span>{editingVehicle ? `Edit ${editingVehicle.registrationNumber}` : 'Register New Vehicle'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update operational specs and public website catalogue photos
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pt-3 pb-3">
              <button
                type="button"
                onClick={() => setActiveModalTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeModalTab === 'specs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Car size={14} />
                <span>Vehicle Specifications & Operation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('photos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeModalTab === 'photos'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon size={14} />
                <span>📸 Vehicle Photos</span>
                {formData.publicPhotos.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">
                    {formData.publicPhotos.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
              {/* TAB 1: OPERATIONAL SPECS */}
              {activeModalTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CAB-4521 or WP-NC-8890"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase font-mono font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Type *</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-600"
                      >
                        <option value="Car">Car / Sedan</option>
                        <option value="Van">Passenger Van</option>
                        <option value="Double Cab">Double-Cab Pickup (4x4)</option>
                        <option value="SUV">SUV / 4WD</option>
                        <option value="Bus">Bus / Coach</option>
                        <option value="Lorry">Lorry / Crew Truck</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Make *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toyota, Nissan, Isuzu"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KDH 200, Hilux, Axio, Premio"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year of Manufacture</label>
                      <input
                        type="number"
                        value={formData.manufacturingYear}
                        onChange={(e) => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Color</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="White, Silver, Black, Bronze..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fuel Type</label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={formData.seatingCapacity}
                        onChange={(e) => setFormData({ ...formData, seatingCapacity: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Hire Rate (LKR)</label>
                      <input
                        type="number"
                        value={formData.hireRate}
                        onChange={(e) => setFormData({ ...formData, hireRate: Number(e.target.value) })}
                        placeholder="8500"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Odometer (KM) *</label>
                      <input
                        type="number"
                        required
                        value={formData.currentOdometer}
                        onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Interval (KM)</label>
                      <input
                        type="number"
                        value={formData.serviceIntervalKm}
                        onChange={(e) => setFormData({ ...formData, serviceIntervalKm: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-600"
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Internal Operations Notes</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Private maintenance history, tire conditions, or specific client assignment notes."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 2: VEHICLE PHOTOS & DETAILS */}
              {activeModalTab === 'photos' && (
                <div className="space-y-5">
                  {/* Image Uploader & Presets */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Vehicle Showcase Photos ({formData.publicPhotos.length})
                    </label>

                    {/* Quick Presets */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Quick High-Res Photo Templates (Click to add):</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SAMPLE_PHOTO_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              if (!formData.publicPhotos.includes(preset.url)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  publicPhotos: [...prev.publicPhotos, preset.url],
                                }));
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-600 transition shadow-xs flex items-center gap-1"
                          >
                            <span>+</span>
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File Upload Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload size={22} className="text-blue-600 mb-1.5" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Upload Images from Computer / Phone
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 2.5MB</p>
                      </div>

                      {/* Direct URL Input */}
                      <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 flex flex-col justify-between space-y-2">
                        <div>
                          <p className="text-xs font-bold text-slate-700">Add Image via Web Link / URL</p>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs mt-1.5 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!imageUrlInput.trim()}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
                        >
                          + Add Photo URL
                        </button>
                      </div>
                    </div>

                    {/* Photos Gallery Grid */}
                    {formData.publicPhotos.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <p className="text-xs font-bold text-slate-600">Attached Photos (First photo is Primary Cover):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {formData.publicPhotos.map((photo, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border-2 aspect-4/3 bg-slate-900 border-slate-200 shadow-xs"
                            >
                              <img
                                src={photo}
                                alt={`Vehicle photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  ★ COVER
                                </span>
                              )}
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-1">
                                {idx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverPhoto(idx)}
                                    className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700"
                                    title="Set as Main Cover"
                                  >
                                    <Star size={13} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="p-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                                  title="Remove Photo"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Public Marketing Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Public Customer Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.publicDescription}
                      onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
                      placeholder="Highlights, comfort details, luggage capacity, and ideal use cases shown to customers."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                    ></textarea>
                  </div>

                  {/* Public Features & Amenities */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Vehicle Amenities & Features Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_FEATURES.map((feature) => {
                        const isSelected = formData.publicFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleToggleFeature(feature)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                            <span>{feature}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom feature tag (e.g. Roof Rack, Refrigerator)..."
                        value={customFeatureInput}
                        onChange={(e) => setCustomFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomFeature();
                          }
                        }}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomFeature}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
                <div />
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
                  >
                    {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
