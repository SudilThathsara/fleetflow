'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { FolderOpen, FileText, Download, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch quotations and invoices for this customer as secure documents
    Promise.all([
      fetch('/api/portal/quotations').then((r) => r.json()),
      fetch('/api/portal/invoices').then((r) => r.json()),
    ])
      .then(([qData, invData]) => {
        const docs: any[] = [];
        if (qData.success && qData.data) {
          qData.data.forEach((q: any) => {
            docs.push({
              id: q._id,
              title: `Formal Quotation Document - ${q.quotationNumber}`,
              category: 'Quotation Agreement',
              date: q.issueDate,
              ref: q.quotationNumber,
              type: 'PDF Document',
            });
          });
        }
        if (invData.success && invData.data) {
          invData.data.forEach((inv: any) => {
            docs.push({
              id: inv._id,
              title: `Tax Invoice Statement - ${inv.invoiceNumber}`,
              category: 'Tax Invoicing',
              date: inv.issueDate,
              ref: inv.invoiceNumber,
              type: 'PDF Statement',
            });
          });
        }
        setDocuments(docs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Document Archive</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secure, customer-authorized agreements, quotation documents, tax invoices, and verified certificates.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-3">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Access Protection:</strong> Only documents tied directly to your verified customer or corporate company membership are presented in this archive.
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading document archive...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <FolderOpen size={40} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No Documents Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When formal quotations, contracts, or tax invoices are generated for your account, they will be archived here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{doc.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doc.category} • {new Date(doc.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {doc.category === 'Quotation Agreement' ? (
                    <a
                      href="/portal/quotations"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                    >
                      View & Download
                    </a>
                  ) : (
                    <a
                      href="/portal/invoices"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                    >
                      View & Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
