import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.lankapremiertransport.lk';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/about',
        '/services',
        '/services/*',
        '/corporate-transport',
        '/fleet',
        '/contact',
        '/request-quotation',
        '/request-booking',
        '/faq',
        '/privacy',
        '/terms',
      ],
      disallow: [
        '/portal',
        '/portal/*',
        '/dashboard',
        '/app',
        '/app/*',
        '/vehicles',
        '/drivers',
        '/payroll',
        '/invoices',
        '/quotations',
        '/inventory',
        '/running-charts',
        '/settings',
        '/users',
        '/billing-engine',
        '/api/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
