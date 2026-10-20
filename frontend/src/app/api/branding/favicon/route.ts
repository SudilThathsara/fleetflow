import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CompanySettings from '@/models/CompanySettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const settings = await CompanySettings.findOne();
    const companyName = settings?.companyName || 'FleetFlow Lanka';
    const logoUrl = settings?.logoUrl || '';

    // 1. If a custom Base64 image is uploaded
    if (logoUrl.startsWith('data:image/')) {
      const matches = logoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }

    // 2. If an external URL is provided
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return NextResponse.redirect(logoUrl);
    }

    // 3. Fallback: Clean branded SVG with first letter of company name
    const letter = companyName.trim().charAt(0).toUpperCase() || 'F';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
        <rect width="64" height="64" rx="16" fill="#2563EB"/>
        <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${letter}</text>
      </svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const fallbackSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
        <rect width="64" height="64" rx="16" fill="#2563EB"/>
        <text x="50%" y="54%" font-family="sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">F</text>
      </svg>
    `.trim();

    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}
