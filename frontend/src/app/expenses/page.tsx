'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDeleteConfirmation } from '@/components/layout/DeleteConfirmation';
import { DollarSign, Plus, Filter, Trash2, Edit2, X } from 'lucide-react';

export default function ExpensesPage() {
  const { confirmDelete } = useDeleteConfirmation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: 'Fuel',
    description: '',
    amount: 5000,
    date: '',
    paymentMethod: 'Cash',
    receiptNumber: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/expenses';
      if (categoryFilter) url += `?category=${encodeURIComponent(categoryFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
        setTotalExpense(data.totalExpense || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Fuel',
      description: 'Diesel refuel for tour operations',
      amount: 8500,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      receiptNumber: `Shed-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: any) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      date: exp.date ? exp.date.split('T')[0] : '',
      paymentMethod: exp.paymentMethod,
      receiptNumber: exp.receiptNumber || '',
      notes: exp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, expId: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete expense ${expId}?`))) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
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
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';

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
            <h1 className="text-2xl font-bold text-slate-900">General Finance & Operating Expenses</h1>
            <p className="text-sm text-slate-500">
              Track business operational costs: fuel, office overheads, permits, phone, tools & repairs
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Record Expense</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter size={16} className="text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Driver wages and allowances">Driver wages and allowances</option>
              <option value="Third-party vehicle hire">Third-party vehicle hire</option>
              <option value="Tolls and parking">Tolls and parking</option>
              <option value="Insurance">Insurance</option>
              <option value="Office expenses">Office expenses</option>
              <option value="Telephone and internet">Telephone and internet</option>
              <option value="Other operating expenses">Other operating expenses</option>
            </select>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Filtered Expenses</p>
            <p className="text-xl font-extrabold text-rose-600">Rs. {totalExpense?.toLocaleString()}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Expense ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Payment Mode</th>
                  <th className="p-4">Receipt Ref</th>
                  <th className="p-4 text-right">Amount (LKR)</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No expense records found. Click "Record Expense" to add one.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">{exp.expenseId}</td>
                      <td className="p-4 font-medium text-slate-700">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{exp.description}</td>
                      <td className="p-4 text-slate-700">{exp.paymentMethod}</td>
                      <td className="p-4 font-mono text-xs">{exp.receiptNumber || 'N/A'}</td>
                      <td className="p-4 text-right font-bold text-rose-600">
                        Rs. {exp.amount?.toLocaleString()}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id, exp.expenseId)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Expense"
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

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingExpense ? 'Edit Expense Record' : 'Record Operating Expense'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="Fuel">Fuel</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Driver wages and allowances">Driver wages and allowances</option>
                  <option value="Third-party vehicle hire">Third-party vehicle hire</option>
                  <option value="Tolls and parking">Tolls and parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Office expenses">Office expenses</option>
                  <option value="Telephone and internet">Telephone and internet</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other operating expenses">Other operating expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Fuel filling at Ceypetco / Highway tolls"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-rose-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt Reference</label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
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
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
