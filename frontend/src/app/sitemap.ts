import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.lankapremiertransport.lk';

  const routes = [
    '',
    '/about',
    '/services',
    '/services/monthly-vehicle-hire',
    '/services/double-cab-hire',
    '/services/van-hire',
    '/services/daily-hire',
    '/corporate-transport',
    '/fleet',
    '/contact',
    '/request-quotation',
    '/request-booking',
    '/faq',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/services') || route === '/corporate-transport' ? 0.9 : 0.8,
  }));
}
