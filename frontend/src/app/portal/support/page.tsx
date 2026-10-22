'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortalLayout } from '@/components/portal/PortalLayout';
import {
  LifeBuoy,
  PlusCircle,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';

function SupportContent() {
  const searchParams = useSearchParams();
  const prefillRef = searchParams.get('ref') || '';

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // New Ticket Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const [newTicket, setNewTicket] = useState({
    category: prefillRef ? 'Booking' : 'General',
    relatedReference: prefillRef,
    subject: '',
    message: '',
    priority: 'Medium',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/portal/support')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTickets(data.data);
          if (data.data.length > 0 && !selectedTicket) {
            setSelectedTicket(data.data[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setNewTicket({
          category: 'General',
          relatedReference: '',
          subject: '',
          message: '',
          priority: 'Medium',
        });
        fetchTickets();
      } else {
        alert(data.message || 'Ticket creation failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`/api/portal/support/${selectedTicket._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplyText('');
        setSelectedTicket(data.data);
        fetchTickets();
      } else {
        alert(data.message || 'Failed to send reply.');
      }
    } catch (err: any) {
      alert(err.message || 'Connection error.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Support Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit service requests, request route modifications, or inquire regarding quotations and invoices.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>New Support Ticket</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <LifeBuoy size={40} className="text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No Support Tickets</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Need assistance with a vehicle booking, quotation clarification, or billing question? Open a ticket anytime.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Open Support Ticket</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ticket List */}
          <div className="lg:col-span-5 space-y-3">
            {tickets.map((t) => {
              const isSelected = selectedTicket?._id === t._id;
              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`bg-white rounded-2xl p-4 border transition cursor-pointer ${
                    isSelected
                      ? 'border-sky-600 shadow-md ring-2 ring-sky-500/20'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono font-bold text-xs text-slate-800">{t.ticketId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t.category} {t.relatedReference ? `• Ref: ${t.relatedReference}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Updated: {new Date(t.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ticket Thread */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[560px]">
                {/* Header */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-400">
                        {selectedTicket.ticketId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      {selectedTicket.subject}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      selectedTicket.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-sky-50 text-sky-700'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                  {(selectedTicket.responses || []).map((msg: any, i: number) => {
                    const isCust = msg.senderRole === 'Customer';
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl text-xs max-w-[85%] ${
                          isCust
                            ? 'ml-auto bg-sky-600 text-white rounded-tr-xs'
                            : 'mr-auto bg-slate-100 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-80">
                          <span className="font-bold">{msg.sender} ({msg.senderRole})</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the operations desk..."
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs transition disabled:bg-sky-400 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Open Support Ticket</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="General">General Enquiry</option>
                    <option value="Booking">Booking Modification</option>
                    <option value="Quotation">Quotation Enquiry</option>
                    <option value="Invoice">Invoicing & Billing</option>
                    <option value="Payment">Payment & Receipts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Related Reference ID</label>
                  <input
                    type="text"
                    value={newTicket.relatedReference}
                    onChange={(e) => setNewTicket({ ...newTicket, relatedReference: e.target.value })}
                    placeholder="e.g. BK-2026-001 / QT-2026-001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Summary of request (e.g. Change pickup time on Monday)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Message *</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  rows={4}
                  placeholder="Explain your request or issue with full details..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:bg-sky-400 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportDeskPage() {
  return (
    <PortalLayout>
      <Suspense fallback={<div className="text-xs text-slate-400">Loading support portal...</div>}>
        <SupportContent />
      </Suspense>
    </PortalLayout>
  );
}
