'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDeleteConfirmation } from '@/components/layout/DeleteConfirmation';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Plus,
  Key,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';

export default function UsersPage() {
  const { user, updateUser } = useAuth();
  const { confirmDelete } = useDeleteConfirmation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operations',
    phone: '',
    status: 'active',
  });

  // Modal State for Password Update
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fleetflow_token') : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operations',
      phone: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone || '',
      status: u.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenPasswordModal = (u: any) => {
    setSelectedUserForPassword(u);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!(await confirmDelete(`Are you sure you want to delete user ${email}?`))) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchUsers();

        // If the updated user is the currently logged in user, immediately update navbar and local state
        if (
          user &&
          editingUser &&
          (user.email.toLowerCase() === editingUser.email.toLowerCase() ||
            user.id === editingUser._id ||
            user.id === editingUser.id)
        ) {
          const updatedProfile = {
            name: data.data?.name || formData.name,
            role: data.data?.role || formData.role,
            email: data.data?.email || formData.email,
            phone: data.data?.phone || formData.phone,
          };
          updateUser(updatedProfile);
          window.dispatchEvent(new CustomEvent('fleetflow:user-updated', { detail: updatedProfile }));
        }
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const res = await fetch(`/api/users/${selectedUserForPassword._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Password for ${selectedUserForPassword.email} updated successfully!`);
        setIsPasswordModalOpen(false);
      } else {
        alert(data.message || 'Failed to update password');
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
            <h1 className="text-2xl font-bold text-slate-900">User Management & Permissions</h1>
            <p className="text-sm text-slate-500">
              Manage system staff logins, roles, access permissions and reset user passwords
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Create New User</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-900">{u.name}</td>
                      <td className="p-4 font-medium text-slate-700">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            u.role === 'super_admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'manager'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : u.role === 'accountant'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">{u.phone || 'N/A'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Reset / Update Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        {u.email !== 'admin@fleetflow.lk' && (
                          <button
                            onClick={() => handleDelete(u._id, u.email)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Edit User Details' : 'Create New System User'}
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="operations">Operations Staff</option>
                    <option value="maintenance">Maintenance Staff</option>
                    <option value="auditor">Auditor (Read-only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Set New Password</h2>
                <p className="text-xs text-slate-500">{selectedUserForPassword?.email}</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
