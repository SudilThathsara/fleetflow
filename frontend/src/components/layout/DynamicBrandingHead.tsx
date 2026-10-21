'use client';

import { useEffect } from 'react';

export function DynamicBrandingHead() {
  useEffect(() => {
    const updateFaviconInDOM = (faviconHref: string) => {
      // Reuse Next.js-managed links instead of removing them. Removing head
      // nodes behind React's back can cause a removeChild hydration error.
      let icon = document.head.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!icon) {
        icon = document.createElement('link');
        document.head.appendChild(icon);
      }
      icon.rel = 'icon';
      icon.type = 'image/png';
      icon.href = faviconHref;

      let appleIcon = document.head.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        document.head.appendChild(appleIcon);
      }
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = faviconHref;
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
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ companyName?: string; logoUrl?: string }>).detail;
      if (detail) {
        applyBranding(detail);
      }
    };

    window.addEventListener('fleetflow:settings-updated', handleUpdate);
    return () => window.removeEventListener('fleetflow:settings-updated', handleUpdate);
  }, []);

  return null;
}
