'use client';

import { useEffect } from 'react';

export function DynamicBrandingHead() {
  useEffect(() => {
    const applyBranding = (data: { companyName?: string; logoUrl?: string }) => {
      const name = data.companyName || 'FleetFlow Lanka';
      const logo = data.logoUrl;

      // 1. Update Browser Tab Title
      document.title = `${name} — Transport & Fleet Operations`;

      // 2. Update Browser Favicon
      let faviconUrl = logo;
      if (!faviconUrl) {
        // Generate crisp branded SVG letter badge matching company name
        const firstLetter = name.trim().charAt(0).toUpperCase() || 'F';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#2563eb"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${firstLetter}</text></svg>`;
        faviconUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      }

      // Update or create favicon links in <head>
      const existingIcons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          el.href = faviconUrl!;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    };

    // 1. Initial hydration from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fleetflow_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          applyBranding(parsed);
        } catch {}
      }

      // 2. Fetch fresh settings from DB
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

    // 3. Listen to real-time custom event triggered from Settings page
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
