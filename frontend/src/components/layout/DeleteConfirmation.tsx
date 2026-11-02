'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationContextValue {
  confirmDelete: (message: string) => Promise<boolean>;
}

const DeleteConfirmationContext = createContext<DeleteConfirmationContextValue | null>(null);

export function DeleteConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<{ message: string; resolve: (confirmed: boolean) => void } | null>(null);

  const confirmDelete = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => setRequest({ message, resolve }));
  }, []);

  const close = useCallback((confirmed: boolean) => {
    if (!request) return;
    request.resolve(confirmed);
    setRequest(null);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [request, close]);

  return (
    <DeleteConfirmationContext.Provider value={{ confirmDelete }}>
      {children}
      {request && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 cursor-default"
            onClick={() => close(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            aria-describedby="delete-confirmation-message"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => close(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cancel delete"
            >
              <X size={18} />
            </button>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={22} />
            </div>
            <h2 id="delete-confirmation-title" className="text-lg font-bold text-slate-900">Confirm deletion</h2>
            <p id="delete-confirmation-message" className="mt-2 pr-6 text-sm leading-6 text-slate-600">{request.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DeleteConfirmationContext.Provider>
  );
}

export function useDeleteConfirmation() {
  const context = useContext(DeleteConfirmationContext);
  if (!context) {
    throw new Error('useDeleteConfirmation must be used within DeleteConfirmationProvider');
  }
  return context;
}
