'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Share2, Plus, ExternalLink, Trash2, Edit2, X, Users } from 'lucide-react';

export default function SocialGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook',
    url: '',
    area: 'Western Province',
    category: 'Transport & Hire',
    memberCount: 25000,
    postingRules: '',
    notes: '',
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/social/groups');
      const data = await res.json();
      if (data.success) setGroups(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      platform: 'Facebook',
      url: 'https://facebook.com/groups/',
      area: 'Island-wide / Western Province',
      category: 'Transport & Hire',
      memberCount: 30000,
      postingRules: 'Contact numbers mandatory in post text',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: any) => {
    setEditingGroup(g);
    setFormData({
      name: g.name,
      platform: g.platform,
      url: g.url,
      area: g.area,
      category: g.category,
      memberCount: g.memberCount || 0,
      postingRules: g.postingRules || '',
      notes: g.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove group ${name}?`)) return;
    try {
      const res = await fetch(`/api/social/groups/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchGroups();
      else alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingGroup ? 'PUT' : 'POST';
      const url = editingGroup ? `/api/social/groups/${editingGroup._id}` : '/api/social/groups';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchGroups();
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
            <h1 className="text-2xl font-bold text-slate-900">Facebook & Social Media Groups Directory</h1>
            <p className="text-sm text-slate-500">
              Curate Facebook transport groups, vehicle rental forums & WhatsApp driver communities
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Add Group</span>
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-8 text-center text-slate-400 font-medium">
              Loading social groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400">
              No groups added yet. Click "Add Group" to add a Facebook or WhatsApp group.
            </div>
          ) : (
            groups.map((g) => (
              <div
                key={g._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {g.platform}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <Users size={14} className="mr-1" />
                      {g.memberCount?.toLocaleString()} Members
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">{g.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{g.area} • {g.category}</p>

                  {g.postingRules && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-700">Rules: </span>
                      {g.postingRules}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>Visit Group</span>
                    <ExternalLink size={14} />
                  </a>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                      title="Edit Group"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(g._id, g.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingGroup ? 'Edit Social Media Group' : 'Add Social Media Group'}
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sri Lanka Tourism Vehicle Hire & Drivers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Ikman">Ikman</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Member Count</label>
                  <input
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Group URL / Link *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region / Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Posting Guidelines</label>
                <textarea
                  rows={2}
                  value={formData.postingRules}
                  onChange={(e) => setFormData({ ...formData, postingRules: e.target.value })}
                  placeholder="Rules regarding rate disclosure, contacts, admin approval..."
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
                  {editingGroup ? 'Save Changes' : 'Add Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
