'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Share2,
  Plus,
  Copy,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Car,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  Repeat,
} from 'lucide-react';

const FacebookIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function SocialPostCreatorPage() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'templates'>('drafts');
  const [templates, setTemplates] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postForm, setPostForm] = useState({
    title: 'Toyota Hilux Revo 4x4 Double Cab Monthly Corporate Rental',
    vehicleType: 'Toyota Hilux Revo 4x4 Double Cab',
    hireType: 'Monthly Corporate Contract',
    rateText: 'LKR 250,000 / month',
    kmAllowanceText: '3,000 KM Included Monthly',
    extraKmRateText: 'LKR 100 / Extra KM',
    driverAvailability: 'Full-time Professional Driver Included',
    fuelArrangement: 'Customer Fuel / Reimbursed Fuel Options Available',
    location: 'Hambantota / Mattala / Galle / Colombo',
    contactNumber: '+94 77 123 4567 / +94 71 987 6543',
    companyName: 'FleetFlow Lanka Tourism & Transport Services',
    bannerHeadline: 'DOUBLE CAB AVAILABLE FOR HIRE',
    badgeText: '3,000 KM INCLUDED',
    imageTheme: 'Emerald',
    caption: '',
    status: 'Ready to Share',
  });

  // Publish URL Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTargetPost, setPublishTargetPost] = useState<any>(null);
  const [publishedUrl, setPublishedUrl] = useState('');

  const cardPreviewRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        fetch('/api/social/templates'),
        fetch('/api/social/posts'),
      ]);
      const tData = await tRes.json();
      const dData = await dRes.json();
      if (tData.success) setTemplates(tData.data);
      if (dData.success) setDrafts(dData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateCaption = (form: typeof postForm) => {
    return (
      `🚗 ${form.companyName.toUpperCase()} — ${form.bannerHeadline}!\n\n` +
      `🔹 Vehicle: ${form.vehicleType}\n` +
      `💼 Hire Category: ${form.hireType}\n` +
      `💰 Commercial Rate: ${form.rateText}\n` +
      `🛣️ Included Allowance: ${form.kmAllowanceText}\n` +
      `⚡ Extra Distance: ${form.extraKmRateText}\n` +
      `👨‍✈️ Driver Service: ${form.driverAvailability}\n` +
      `⛽ Fuel Terms: ${form.fuelArrangement}\n` +
      `📍 Operating Routes / Base: ${form.location}\n\n` +
      `Immediate availability for corporate projects, expressway routes, and tourism.\n\n` +
      `📞 Call/WhatsApp: ${form.contactNumber}\n` +
      `🌐 ${form.companyName} | Official Corporate Fleet`
    );
  };

  const handleOpenNewFromTemplate = (template: any) => {
    const newForm = {
      title: template.title,
      vehicleType: template.vehicleType,
      hireType: template.category,
      rateText: template.defaultRate || 'LKR 250,000 / month',
      kmAllowanceText: template.defaultAllowance || '3,000 KM Included Monthly',
      extraKmRateText: 'LKR 100 / Extra KM',
      driverAvailability: 'Full-time Professional Driver Provided',
      fuelArrangement: 'Customer Fuel / Reimbursed Options Available',
      location: 'Colombo & Island-wide Route',
      contactNumber: '+94 77 123 4567 / +94 71 987 6543',
      companyName: 'FleetFlow Lanka Tourism & Transport Services',
      bannerHeadline: template.bannerHeadline || 'PREMIUM VEHICLE FOR HIRE',
      badgeText: template.badgeText || '3,000 KM INCLUDED',
      imageTheme: template.imageTheme || 'Emerald',
      caption: '',
      status: 'Ready to Share',
    };
    newForm.caption = generateCaption(newForm);
    setEditingPost(null);
    setPostForm(newForm);
    setIsEditorOpen(true);
  };

  const handleOpenEditDraft = (post: any) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      vehicleType: post.vehicleType,
      hireType: post.hireType,
      rateText: post.rateText,
      kmAllowanceText: post.kmAllowanceText,
      extraKmRateText: post.extraKmRateText || 'LKR 100 / Extra KM',
      driverAvailability: post.driverAvailability,
      fuelArrangement: post.fuelArrangement,
      location: post.location,
      contactNumber: post.contactNumber,
      companyName: post.companyName,
      bannerHeadline: post.bannerHeadline || 'AVAILABLE FOR HIRE',
      badgeText: post.badgeText || '3,000 KM INCLUDED',
      imageTheme: post.imageTheme || 'Emerald',
      caption: post.caption,
      status: post.status,
    });
    setIsEditorOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPost ? `/api/social/posts/${editingPost._id}` : '/api/social/posts';
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditorOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicatePost = async (id: string) => {
    try {
      const res = await fetch(`/api/social/posts/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchData();
        alert('Post duplicated! You can now adjust date, location, or rates without changing the original.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCaption = (caption: string, id: string) => {
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenPublishModal = (post: any) => {
    setPublishTargetPost(post);
    setPublishedUrl(post.publishedUrl || '');
    setIsPublishModalOpen(true);
  };

  const handleSavePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTargetPost) return;
    try {
      const res = await fetch(`/api/social/posts/${publishTargetPost._id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPublishModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'Navy':
        return 'from-slate-900 via-blue-900 to-indigo-950 text-white';
      case 'Ruby':
        return 'from-rose-950 via-red-900 to-slate-900 text-white';
      case 'Amber':
        return 'from-amber-950 via-yellow-900 to-slate-900 text-amber-50';
      case 'Charcoal':
        return 'from-neutral-900 via-stone-900 to-black text-white';
      default:
        return 'from-emerald-950 via-teal-900 to-slate-900 text-white';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="text-blue-600" /> Reusable Social Media Post Creator & Artwork Generator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create once, customize dates, rates, and locations, duplicate with 1-click, and share to Facebook groups
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
              <button
                onClick={() => setActiveTab('drafts')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'drafts'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saved Posts ({drafts.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  activeTab === 'templates'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Post Templates ({templates.length})
              </button>
            </div>

            <button
              onClick={() => {
                if (templates.length > 0) handleOpenNewFromTemplate(templates[0]);
                else {
                  setEditingPost(null);
                  setIsEditorOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={18} /> Create New Post
            </button>
          </div>
        </div>

        {/* Tab 1: Saved Posts */}
        {activeTab === 'drafts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {drafts.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  {/* Visual Artwork Banner Card */}
                  <div
                    className={`bg-gradient-to-br ${getThemeClasses(
                      d.imageTheme
                    )} p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]`}
                  >
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-white border border-white/20">
                          {d.companyName}
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight mt-2 text-white">
                          {d.bannerHeadline || d.title}
                        </h2>
                        <p className="text-xs text-white/80 font-medium">{d.vehicleType}</p>
                      </div>

                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                        {d.badgeText || '3,000 KM INCLUDED'}
                      </span>
                    </div>

                    <div className="z-10 mt-4 pt-3 border-t border-white/20 flex flex-wrap justify-between items-end gap-2">
                      <div>
                        <span className="text-[11px] text-white/70 block uppercase font-semibold">Special Rate</span>
                        <span className="text-base font-extrabold text-amber-300">{d.rateText}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-white/70 block flex items-center justify-end gap-1">
                          <MapPin size={11} /> {d.location}
                        </span>
                        <span className="text-xs font-bold text-white flex items-center justify-end gap-1 mt-0.5">
                          <Phone size={12} /> {d.contactNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body: Caption & Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-500">{d.postId}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          d.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Ready to Share'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{d.title}</h3>

                    {/* Collapsible Caption Box */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {d.caption}
                    </div>

                    {d.publishedUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 truncate">
                        <ExternalLink size={13} className="shrink-0" />
                        <a href={d.publishedUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                          {d.publishedUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCaption(d.caption, d._id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {copiedId === d._id ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Caption
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDuplicatePost(d._id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Duplicate post for a new date or route"
                    >
                      <Repeat size={14} /> 1-Click Duplicate
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenPublishModal(d)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                    >
                      <FacebookIcon size={14} /> Share / Log Link
                    </button>

                    <button
                      onClick={() => handleOpenEditDraft(d)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Reusable Templates */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                    {tpl.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{tpl.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Vehicle: {tpl.vehicleType}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Default Rate:</span>
                      <strong>{tpl.defaultRate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allowance:</span>
                      <strong>{tpl.defaultAllowance}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenNewFromTemplate(tpl)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={14} /> Create Post with Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Post Editor */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col md:flex-row max-h-[90vh]">
              {/* Form Side */}
              <form onSubmit={handleSavePost} className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {editingPost ? 'Edit Post Details' : 'Create Promotional Social Post'}
                  </h3>
                  <span className="text-xs text-slate-400">Template preserved separately</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Post Title / Reference *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => {
                      const updated = { ...postForm, title: e.target.value };
                      setPostForm({ ...updated, caption: generateCaption(updated) });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type *</label>
                    <input
                      type="text"
                      required
                      value={postForm.vehicleType}
                      onChange={(e) => {
                        const updated = { ...postForm, vehicleType: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Headline</label>
                    <input
                      type="text"
                      value={postForm.bannerHeadline}
                      onChange={(e) => {
                        const updated = { ...postForm, bannerHeadline: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rate (Daily or Monthly) *</label>
                    <input
                      type="text"
                      required
                      value={postForm.rateText}
                      onChange={(e) => {
                        const updated = { ...postForm, rateText: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Included KM Allowance</label>
                    <input
                      type="text"
                      value={postForm.kmAllowanceText}
                      onChange={(e) => {
                        const updated = { ...postForm, kmAllowanceText: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Location / Route</label>
                    <input
                      type="text"
                      value={postForm.location}
                      onChange={(e) => {
                        const updated = { ...postForm, location: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Numbers *</label>
                    <input
                      type="text"
                      required
                      value={postForm.contactNumber}
                      onChange={(e) => {
                        const updated = { ...postForm, contactNumber: e.target.value };
                        setPostForm({ ...updated, caption: generateCaption(updated) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Badge Text</label>
                    <input
                      type="text"
                      value={postForm.badgeText}
                      onChange={(e) => setPostForm({ ...postForm, badgeText: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Visual Card Theme</label>
                    <select
                      value={postForm.imageTheme}
                      onChange={(e) => setPostForm({ ...postForm, imageTheme: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Emerald">Emerald Green (Tourism & Travel)</option>
                      <option value="Navy">Royal Navy (Corporate Executive)</option>
                      <option value="Ruby">Crimson Ruby (Special Promotion)</option>
                      <option value="Amber">Amber Gold (Recruitment & Urgent)</option>
                      <option value="Charcoal">Dark Charcoal (Premium Fleet)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Caption Text *</label>
                  <textarea
                    rows={4}
                    value={postForm.caption}
                    onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Save Post Draft
                  </button>
                </div>
              </form>

              {/* Live Preview Side */}
              <div className="w-full md:w-96 bg-slate-50 p-6 border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Live Banner Artwork Preview
                  </h4>

                  {/* Artwork Card */}
                  <div
                    ref={cardPreviewRef}
                    className={`bg-gradient-to-br ${getThemeClasses(
                      postForm.imageTheme
                    )} p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[260px]`}
                  >
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-white border border-white/20">
                        {postForm.companyName}
                      </span>
                      <h2 className="text-xl font-black tracking-tight mt-3 text-white">
                        {postForm.bannerHeadline}
                      </h2>
                      <p className="text-xs text-white/80 font-medium mt-1">{postForm.vehicleType}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-white/70 block uppercase font-semibold">Special Rate</span>
                        <span className="text-base font-extrabold text-amber-300">{postForm.rateText}</span>
                      </div>
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow uppercase">
                        {postForm.badgeText}
                      </span>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-[11px] text-white/80 font-bold flex items-center justify-end gap-1">
                        <Phone size={11} /> {postForm.contactNumber}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3 text-center">
                    Artwork renders live using responsive vector styling
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(postForm.caption);
                      alert('Caption copied to clipboard!');
                    }}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} /> Copy Ready Caption
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Record Publication Link */}
        {isPublishModalOpen && publishTargetPost && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Share Post & Record Link</h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePublication} className="p-6 space-y-4">
                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs space-y-1">
                  <p className="font-bold">Manual Social Media Publication:</p>
                  <p>1. Copy the caption text below.</p>
                  <p>2. Open your Facebook Group, WhatsApp, or Page and paste the post.</p>
                  <p>3. Paste the final post URL below to verify publication.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publishTargetPost.caption);
                    window.open('https://www.facebook.com/groups/', '_blank');
                  }}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <FacebookIcon size={16} /> Copy Caption & Open Facebook Groups
                </button>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Published Post URL (e.g. facebook.com/groups/.../permalink/...)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://facebook.com/groups/..."
                    value={publishedUrl}
                    onChange={(e) => setPublishedUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Verify & Mark Published
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
