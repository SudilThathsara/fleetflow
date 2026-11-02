import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteContent extends Document {
  siteKey: string; // 'default'
  businessName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  phone: string;
  whatsappNumber: string;
  publicEmail: string;
  address: string;
  serviceAreas: string[];
  businessHours: string;
  brNumberPlaceholder: string;
  aboutIntro: string;
  aboutMission: string;
  aboutFleetPractices: string;
  aboutReliability: string;
  servicesEnabled: {
    monthlyHire: boolean;
    corporateHire: boolean;
    doubleCabHire: boolean;
    vanHire: boolean;
    dailyHire: boolean;
    tourismTravel: boolean;
    projectTransport: boolean;
  };
  faqs: {
    question: string;
    answer: string;
    category: string;
  }[];
  testimonials: {
    author: string;
    company?: string;
    rating: number;
    quote: string;
    isVerified: boolean;
  }[];
  privacyPolicyText: string;
  termsConditionsText: string;
  socialLinks: {
    facebook?: string;
    whatsapp?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalBaseUrl: string;
  };
  updatedAt: Date;
}

const WebsiteContentSchema = new Schema<IWebsiteContent>(
  {
    siteKey: { type: String, default: 'default', unique: true },
    businessName: { type: String, default: 'Tourism & Transport' },
    tagline: { type: String, default: 'Professional Fleet & Operational Management' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    heroHeadline: { type: String, default: 'Reliable Vehicle Hire & Corporate Transport Solutions' },
    heroSubheadline: {
      type: String,
      default:
        'Premium double cabs, spacious passenger vans, monthly corporate transport, and island-wide vehicle hire services with verified professional drivers.',
    },
    heroImage: { type: String, default: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600' },
    phone: { type: String, default: '+94 11 234 5678 / +94 77 123 4567' },
    whatsappNumber: { type: String, default: '+94771234567' },
    publicEmail: { type: String, default: 'inquiries@transportlanka.lk' },
    address: { type: String, default: 'No. 142/B, High Level Road, Nugegoda, Sri Lanka' },
    serviceAreas: {
      type: [String],
      default: [
        'Colombo & Greater Western Province',
        'Bandaranaike International Airport (CMB)',
        'Kandy & Central Province',
        'Galle & Southern Expressway Corridor',
        'Island-wide Corporate Project Sites',
      ],
    },
    businessHours: { type: String, default: 'Monday - Saturday: 7:00 AM – 8:00 PM | 24/7 Roadside Assistance & Dispatch' },
    brNumberPlaceholder: { type: String, default: 'PV-98765/2024 (Registered Transport Provider)' },
    aboutIntro: {
      type: String,
      default:
        'We are an established Sri Lankan passenger and corporate transport solutions provider, delivering reliable, well-maintained double cabs, passenger vans, and tailored long-term fleet contracts for multinational companies, local enterprises, tourism partners, and project teams.',
    },
    aboutMission: {
      type: String,
      default:
        'To deliver dependable, transparent, and safe vehicular mobility across Sri Lanka with rigorously maintained vehicles, verified professional chauffeurs, and predictable corporate billing.',
    },
    aboutFleetPractices: {
      type: String,
      default:
        'Every vehicle in our fleet undergoes strict scheduled preventative maintenance, computerized tyre and brake checks, and continuous fitness inspections. GPS telemetry and running chart verifications ensure operational transparency.',
    },
    aboutReliability: {
      type: String,
      default:
        'With dedicated replacement vehicle contingency policies and a 24/7 operations control desk, our clients experience uninterrupted commercial continuity and dependable punctuality.',
    },
    servicesEnabled: {
      monthlyHire: { type: Boolean, default: true },
      corporateHire: { type: Boolean, default: true },
      doubleCabHire: { type: Boolean, default: true },
      vanHire: { type: Boolean, default: true },
      dailyHire: { type: Boolean, default: true },
      tourismTravel: { type: Boolean, default: true },
      projectTransport: { type: Boolean, default: true },
    },
    faqs: {
      type: [
        {
          question: String,
          answer: String,
          category: String,
        },
      ],
      default: [
        {
          question: 'What is included in a monthly vehicle hire contract?',
          answer:
            'Monthly agreements typically include a standard kilometre allowance (e.g. 3,000 km/month), full comprehensive insurance, routine scheduled maintenance, a professional driver (or self-drive options subject to approval), and backup vehicle replacement guarantees.',
          category: 'Monthly Hire',
        },
        {
          question: 'How do you calculate additional kilometres and overtime charges?',
          answer:
            'Excess kilometres beyond the agreed monthly threshold are billed at the transparent contracted extra-km rate. Driver overtime beyond the standard 8 or 9-hour working window is calculated at agreed hourly overtime rates based on signed daily running charts.',
          category: 'Billing & Rates',
        },
        {
          question: 'What types of double-cab pickups do you offer?',
          answer:
            'We provide modern 4x4 Toyota Hilux, Mitsubishi L200, and Isuzu D-Max crew-cab pickups ideal for construction supervision, engineering fieldwork, corporate site visits, and rugged terrain transport.',
          category: 'Fleet & Vehicles',
        },
        {
          question: 'Can corporate clients receive consolidated monthly VAT invoices?',
          answer:
            'Yes. Our corporate accounting engine generates consolidated or per-vehicle invoices itemizing base rental, verified running chart kilometres, driver allowances, and tax schedules on agreed credit payment terms.',
          category: 'Corporate Invoicing',
        },
        {
          question: 'How do I request a formal quotation?',
          answer:
            'You can submit your requirements via our online "Request a Quotation" form or contact our corporate desk. Our operations team reviews vehicle availability, calculates customized terms, and delivers an official quotation PDF to your account within 24 hours.',
          category: 'Quotations',
        },
      ],
    },
    testimonials: {
      type: [
        {
          author: String,
          company: String,
          rating: Number,
          quote: String,
          isVerified: Boolean,
        },
      ],
      default: [
        {
          author: 'Infrastructure Project Director',
          company: 'Civil Engineering JV, Colombo',
          rating: 5,
          quote:
            'The double-cab fleet supplied for our highway package has operated reliably with zero downtime. Running charts and monthly invoicing are always transparent and accurate.',
          isVerified: true,
        },
        {
          author: 'Operations Manager',
          company: 'Telecommunications Services Group',
          rating: 5,
          quote:
            'Outstanding monthly transport service. Drivers are disciplined, vehicles are spotless, and the corporate portal makes invoice tracking effortless.',
          isVerified: true,
        },
      ],
    },
    privacyPolicyText: {
      type: String,
      default:
        'This Privacy Policy outlines how our transport service collects, uses, and safeguards information provided when requesting quotations, booking vehicles, or accessing the customer portal. We do not sell personal information to third parties. Data is used strictly for operational logistics, booking fulfilment, and corporate invoicing.',
    },
    termsConditionsText: {
      type: String,
      default:
        'All vehicle hire requests submitted online are non-binding enquiries until formally reviewed and accepted via an official quotation or confirmed booking agreement. Vehicle dispatch is subject to driver and asset availability, verified identity, and agreed corporate terms.',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      whatsapp: { type: String, default: 'https://wa.me/94771234567' },
      instagram: { type: String, default: 'https://instagram.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      youtube: { type: String, default: '' },
    },
    seo: {
      metaTitle: { type: String, default: 'Premium Vehicle Hire & Corporate Transport Sri Lanka | Lanka Premier' },
      metaDescription: {
        type: String,
        default:
          'Reliable double-cab pickups, passenger vans, monthly corporate transport contracts, and island-wide vehicle hire solutions in Sri Lanka. Request a free quotation online.',
      },
      canonicalBaseUrl: { type: String, default: 'https://www.lankapremiertransport.lk' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteContent ||
  mongoose.model<IWebsiteContent>('WebsiteContent', WebsiteContentSchema);
