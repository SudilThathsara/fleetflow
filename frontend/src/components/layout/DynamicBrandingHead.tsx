'use client';

import { useEffect } from 'react';

export function DynamicBrandingHead() {
  useEffect(() => {
    const updateFaviconInDOM = (faviconHref: string) => {
      // 1. Remove all old icon links to force Chrome/Edge to re-render
      const oldIcons = document.querySelectorAll("link[rel*='icon']");
      oldIcons.forEach((el) => el.remove());

      // 2. Append new dynamic icon link with cache-busting
      const newIcon = document.createElement('link');
      newIcon.rel = 'icon';
      newIcon.type = 'image/png';
      newIcon.href = faviconHref;
      document.head.appendChild(newIcon);

      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = faviconHref;
      document.head.appendChild(appleIcon);
    };

    const applyBranding = (data: { companyName?: string; logoUrl?: string }) => {
      const name = data.companyName ? data.companyName.trim() : 'Tourism & Transport';

      // 1. Set Browser Tab Title
      document.title = `${name} — Fleet & Operations`;

      // 2. Set Favicon to the dynamic endpoint with timestamp cache buster
      const timestamp = Date.now();
      const faviconEndpoint = `/api/branding/favicon?t=${timestamp}`;
      updateFaviconInDOM(faviconEndpoint);
    };

    // Initial check from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          applyBranding(parsed);
        } catch {}
      }

      // Fetch fresh settings from DB
      fetch('/api/settings')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            applyBranding(res.data);
            localStorage.setItem('fleetflow_settings', JSON.stringify(res.data));
          }
        })
        .catch(() => {});
    }

    // Real-time listener when user saves in Settings
    const handleUpdate = (e: any) => {
      if (e.detail) {
        applyBranding(e.detail);
      }
    };

    window.addEventListener('fleetflow:settings-updated', handleUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleUpdate);
  }, []);

  return null;
}
