'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Truck,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Tag,
  Wrench,
  X,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function SparePartsInventoryPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'transactions'>('catalog');
  const [parts, setParts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPartForPurchase, setSelectedPartForPurchase] = useState<any>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    partId: '',
    quantity: 10,
    unitCost: 0,
    supplierName: '',
    reference: '',
    notes: '',
  });

  // Adjustment Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedPartForAdjustment, setSelectedPartForAdjustment] = useState<any>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    partId: '',
    newQuantity: 0,
    reason: 'Physical Stock Count Reconciliation',
    notes: '',
  });

  // Add Part Modal State
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [partForm, setPartForm] = useState({
    sku: '',
    name: '',
    category: 'Lubricants & Fluids',
    brand: '',
    partNumber: '',
    compatibleVehicles: 'Toyota Hilux Revo 4x4, HiAce KDH',
    unitOfMeasure: 'Units',
    currentStock: 10,
    minStockLevel: 4,
    unitCost: 5000,
    storageLocation: 'Main Garage Shelf A-1',
    notes: '',
  });

  useEffect(() => {
    fetchParts();
    fetchTransactions();
    fetchSuppliers();
  }, [categoryFilter]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const url = `/api/inventory/parts?category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setParts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/inventory/transactions');
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPurchase = (part: any) => {
    setSelectedPartForPurchase(part);
    setPurchaseForm({
      partId: part._id,
      quantity: part.reorderQuantity || 10,
      unitCost: part.unitCost || 0,
      supplierName: part.supplierName || 'Southern Auto Spares',
      reference: `PO-${Date.now().toString().slice(-4)}`,
      notes: 'Routine spare parts replenishment',
    });
    setIsPurchaseModalOpen(true);
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsPurchaseModalOpen(false);
        fetchParts();
        fetchTransactions();
      } else {
        alert(data.message || 'Error receiving stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdjustment = (part: any) => {
    setSelectedPartForAdjustment(part);
    setAdjustmentForm({
      partId: part._id,
      newQuantity: part.currentStock,
      reason: 'Physical Stock Count Reconciliation',
      notes: '',
    });
    setIsAdjustmentModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdjustmentModalOpen(false);
        fetchParts();
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNewPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddPartModalOpen(false);
        fetchParts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredParts = parts.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.compatibleVehicles?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = parts.filter((p) => p.currentStock <= p.minStockLevel).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="text-blue-600" /> Spare-Parts Inventory & Stock Control
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Store and issue spare parts (lubricants, oil filters, brake pads, tyres) directly to vehicle maintenance jobs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parts Catalog ({parts.length})
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stock Transactions ({transactions.length})
              </button>
            </div>

            <button
              onClick={() => setIsAddPartModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={18} /> Register New Part
            </button>
          </div>
        </div>

        {/* Stats & Low Stock Warning */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Registered SKUs</p>
              <h3 className="text-xl font-bold text-slate-800">{parts.length}</h3>
              <p className="text-xs text-slate-500">Fleet maintenance inventory</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-semibold">Low Stock Threshold Alerts</p>
              <h3 className="text-xl font-bold text-amber-900">{lowStockCount} Items</h3>
              <p className="text-xs text-amber-700">Reorder recommended</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Stock Valuation</p>
              <h3 className="text-xl font-bold text-slate-800">
                LKR {Number(parts.reduce((s, p) => s + (p.currentStock * p.unitCost || 0), 0)).toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500">Current assets at cost</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Service Job Usage</p>
              <h3 className="text-xl font-bold text-slate-800">
                {transactions.filter((t) => t.type === 'ISSUED_TO_SERVICE').length} Issued
              </h3>
              <Link href="/services" className="text-xs text-blue-600 hover:underline">
                View Maintenance Logs →
              </Link>
            </div>
          </div>
        </div>

        {/* Tab 1: Parts Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by SKU, part name, or compatible vehicle (e.g. Hilux, HiAce)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Lubricants & Fluids">Lubricants & Fluids</option>
                <option value="Filters">Filters</option>
                <option value="Braking System">Braking System</option>
                <option value="Tyres & Wheels">Tyres & Wheels</option>
                <option value="Suspension">Suspension</option>
                <option value="Electrical & Battery">Electrical & Battery</option>
                <option value="Engine Parts">Engine Parts</option>
              </select>
            </div>

            {/* Parts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredParts.map((p) => {
                const isLow = p.currentStock <= p.minStockLevel;
                return (
                  <div
                    key={p._id}
                    className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                      isLow ? 'border-amber-300 shadow-amber-50 shadow-md' : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {p.sku}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{p.name}</h3>
                          <p className="text-xs text-slate-500">{p.brand} {p.partNumber && `• Part #${p.partNumber}`}</p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            p.currentStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.currentStock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Current Stock:</span>
                          <strong className="text-sm font-bold text-slate-900">
                            {p.currentStock} {p.unitOfMeasure}
                          </strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Unit Cost:</span>
                          <strong className="text-slate-900">LKR {Number(p.unitCost).toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Min Alert Threshold:</span>
                          <span>{p.minStockLevel} {p.unitOfMeasure}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-500 block text-[11px] mb-0.5">Compatible Models:</span>
                          <span className="bg-slate-50 px-2 py-1 rounded text-slate-700 font-medium block border border-slate-100 text-[11px]">
                            {p.compatibleVehicles}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => handleOpenPurchase(p)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <ArrowDownRight size={14} /> Receive Stock
                      </button>
                      <button
                        onClick={() => handleOpenAdjustment(p)}
                        className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Stock Transactions */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Auditable Inventory Movement Log</h3>
              <span className="text-xs text-slate-500">Auto-logged on purchases, service issues, and adjustments</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tx ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Part Name</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Stock Impact</th>
                    <th className="p-3">Vehicle / Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{tx.transactionId}</td>
                      <td className="p-3 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'PURCHASE_RECEIPT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'ISSUED_TO_SERVICE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {tx.partName} <span className="text-slate-400 font-mono text-[11px]">({tx.sku})</span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">{tx.quantity}</td>
                      <td className="p-3 text-right">LKR {Number(tx.unitCost || 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">
                        {tx.previousStock} → <strong>{tx.newStock}</strong>
                      </td>
                      <td className="p-3 text-slate-600">
                        {tx.vehicleReg && <span className="font-mono font-bold text-slate-800 mr-1">{tx.vehicleReg}</span>}
                        {tx.reference || '—'}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No inventory transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Receive Stock Purchase */}
        {isPurchaseModalOpen && selectedPartForPurchase && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Receive Stock Delivery</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPartForPurchase.name}</p>
                </div>
                <button onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePurchase} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Received *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={purchaseForm.quantity}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (LKR) *</label>
                    <input
                      type="number"
                      required
                      value={purchaseForm.unitCost}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, unitCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={purchaseForm.supplierName}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Delivery Order Ref</label>
                  <input
                    type="text"
                    value={purchaseForm.reference}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, reference: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs flex justify-between">
                  <span>Total Purchase Cost:</span>
                  <strong>LKR {Number(purchaseForm.quantity * purchaseForm.unitCost).toLocaleString()}</strong>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Confirm Stock Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Stock */}
        {isAdjustmentModalOpen && selectedPartForAdjustment && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Adjust Physical Stock Count</h3>
                <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Part</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedPartForAdjustment.name} (${selectedPartForAdjustment.sku})`}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Physical Count Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={adjustmentForm.newQuantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, newQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Adjustment *</label>
                  <input
                    type="text"
                    required
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAdjustmentModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Save Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register New Part */}
        {isAddPartModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Register New Spare Part / Lubricant</h3>
                <button onClick={() => setIsAddPartModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveNewPart} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={partForm.sku}
                      onChange={(e) => setPartForm({ ...partForm, sku: e.target.value.toUpperCase() })}
                      placeholder="e.g. OIL-15W40-02"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={partForm.category}
                      onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Lubricants & Fluids">Lubricants & Fluids</option>
                      <option value="Filters">Filters</option>
                      <option value="Braking System">Braking System</option>
                      <option value="Tyres & Wheels">Tyres & Wheels</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Electrical & Battery">Electrical & Battery</option>
                      <option value="Engine Parts">Engine Parts</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Part / Item Name *</label>
                  <input
                    type="text"
                    required
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    placeholder="e.g. Castrol Magnatec Diesel 15W-40 (5L Can)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      value={partForm.brand}
                      onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })}
                      placeholder="e.g. Castrol / Toyota"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer Part Number</label>
                    <input
                      type="text"
                      value={partForm.partNumber}
                      onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                      placeholder="e.g. 90915-YZZD2"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Compatible Fleet Models *</label>
                  <input
                    type="text"
                    required
                    value={partForm.compatibleVehicles}
                    onChange={(e) => setPartForm({ ...partForm, compatibleVehicles: e.target.value })}
                    placeholder="e.g. Toyota Hilux Revo 4x4, Isuzu D-Max, HiAce KDH"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock</label>
                    <input
                      type="number"
                      required
                      value={partForm.currentStock}
                      onChange={(e) => setPartForm({ ...partForm, currentStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Min Alert Level</label>
                    <input
                      type="number"
                      required
                      value={partForm.minStockLevel}
                      onChange={(e) => setPartForm({ ...partForm, minStockLevel: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (LKR)</label>
                    <input
                      type="number"
                      required
                      value={partForm.unitCost}
                      onChange={(e) => setPartForm({ ...partForm, unitCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddPartModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Register Part
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
