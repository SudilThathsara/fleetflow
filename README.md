# FleetFlow Lanka (Pvt) Ltd
### Enterprise Tourism, Vehicle-Hire & Transport Operations Management Suite

FleetFlow Lanka is a production-oriented web platform built on **Next.js App Router, TypeScript, Tailwind CSS, and MongoDB Atlas**. It seamlessly integrates three modules into a single, cohesive architecture:

1. **Public Business Website** — A multi-page public portal for vehicle hire, double cabs, passenger vans, monthly corporate transport, and island-wide tours.
2. **Customer Portal & Authentication** — A customer portal with secure signup, email verification, password recovery, live quotation requests, quotation approvals, booking management, PDF downloads, and support tickets.
3. **Internal Transport Management System (TMS)** — Comprehensive management for vehicles, drivers, customer companies, annual contracts, daily running charts, spare-parts inventory, periodic maintenance, driver EPF/ETF payroll, invoices, and social CRM leads.

---

## 🚀 Live Route Directory

### 1. Public Business Website
| Route | Purpose & Key Features |
|---|---|
| `/` | **Homepage**: Hero banner, quick enquiry form, service spotlights, fleet highlights, FAQs, testimonials, island-wide service hubs, footer. |
| `/about` | **About Us**: Operating philosophy, fleet maintenance policies, driver safety standards, mission. |
| `/services` | **Services Directory**: Overview of monthly corporate hire, double-cab pickups, passenger vans, daily hire, and project SLAs. |
| `/services/monthly-vehicle-hire` | **Monthly Corporate Hire**: 3,000 KM base agreements, replacement guarantees, running chart reconciliation, dedicated quote request. |
| `/services/double-cab-hire` | **Double-Cab Hire (4x4)**: Toyota Hilux, Isuzu D-Max, Mitsubishi L200 pickups for highway packages and civil engineering sites. |
| `/services/van-hire` | **Passenger Van Hire**: Toyota KDH Commuter and high-roof luxury vans with dual A/C for up to 14 passengers. |
| `/services/daily-hire` | **Daily & Short-Term Hire**: 1-day hires, 2-day outstation round trips, airport transfers, interactive booking enquiry form. |
| `/corporate-transport` | **Corporate Fleet SLAs**: Annual master service agreements, multi-vehicle deployments, consolidated monthly VAT billing. |
| `/fleet` | **Public Fleet Catalogue**: Publicly approved vehicle catalogue with strict field-level privacy (no GPS, internal IDs, or owner records). |
| `/contact` | **Contact Desk**: Direct phone hotlines, WhatsApp chat link, office address, operating hours, and CRM contact form. |
| `/request-quotation` | **Formal Quotation Request**: Comprehensive quotation builder generating reference IDs (`REQ-2026-XXXXX`) connected to CRM. |
| `/request-booking` | **Reserve a Vehicle**: Booking enquiry generator creating pending booking references (`BREQ-2026-XXXXX`). |
| `/faq` | **Searchable FAQ**: Categorized accordion answering common questions on mileage, overtime, invoicing, and drivers. |
| `/privacy` | **Privacy Policy**: Transparent explanation of data handling, encryption, and confidentiality safeguards. |
| `/terms` | **Terms & Conditions**: Non-binding online enquiry terms, running chart rules, and replacement SLAs. |
| `/sitemap.xml` & `/robots.txt` | **Search Engine Optimization**: Automatically generated sitemaps and search bot access rules. |

---

### 2. Authentication & Account Recovery
| Route | Functionality |
|---|---|
| `/login` | **Unified Login**: Role-based redirection (Customers $\rightarrow$ `/portal`, Staff $\rightarrow$ `/dashboard`), password show/hide, remember me, rate-limited. |
| `/register` | **Customer Registration**: Creates Customer User + Customer profile with bcrypt hashing and single-use email verification token. Public registrants are strictly assigned the `customer` role. |
| `/verify-email` | **Email Verification**: Validates expiring cryptographic tokens and marks accounts as verified. |
| `/forgot-password` | **Password Recovery**: Neutral confirmation response (prevents account enumeration) and dispatches single-use reset links. |
| `/reset-password` | **Reset Password**: Validates token expiry, hashes new password with bcrypt, and invalidates the token. |
| `/unauthorized` | **Access Control**: Friendly permission-denied screen with routing back to authorized consoles. |

---

### 3. Customer Portal (`/portal`)
| Route | Capabilities |
|---|---|
| `/portal` | **Portal Overview**: Stat cards (Active Bookings, Pending Quotes, Unpaid Invoices, Support Tickets), recent requests, outstanding balances. |
| `/portal/quotation-requests` | **Quotation Requests**: Complete submission history, live status tracking (`Pending`, `Under Review`, `Quoted`), link to formal quotes. |
| `/portal/quotations` | **Formal Quotations**: Published quotation documents, itemized rates, validity periods, client Acceptance/Rejection actions, and jsPDF download. |
| `/portal/bookings` | **My Bookings**: Real-time vehicle assignments, trip dates, pickup/destination routes, chauffeur assignments, modification requests. |
| `/portal/invoices` | **Invoices & Billing**: Monthly fleet statements, balance due tracking, VAT itemization, bank transfer instructions, and PDF download. |
| `/portal/payments` | **Receipts**: Official payment records, bank transfer references, and cleared transaction receipts. |
| `/portal/documents` | **Secure Document Archive**: Private, customer-authorized agreements, quotation PDFs, and verified tax statements. |
| `/portal/support` | **Support Desk**: Multi-threaded support tickets for bookings, quotations, or invoicing inquiries with real-time updates. |
| `/portal/companies` | **Corporate Profiles**: Affiliated customer corporate entities, BR numbers, tax IDs, and billing preferences. |
| `/portal/profile` | **Profile & Security**: Contact information, default billing addresses, and secure password updates. |

---

### 4. Internal Management Application (TMS)
*Accessible to staff users via root routes or `/app/*` rewrites:*
- `/dashboard` / `/app/dashboard` — Enterprise fleet statistics, active contracts, and monthly revenue.
- `/vehicles` / `/app/vehicles` — Complete vehicle registry, odometers, service intervals, and public fleet publication toggles.
- `/drivers` / `/app/drivers` — Driver rosters, contact records, licensing, and EPF/ETF statutory details.
- `/companies` / `/app/companies` — Corporate customer entities and project affiliations.
- `/contracts` / `/app/contracts` — Annual contracts, rate versions, and monthly base allowances.
- `/bookings` / `/app/bookings` — Operational booking verification, vehicle dispatch, and driver assignment.
- `/running-charts` / `/app/running-charts` — Daily odometer tracking, extra-kilometres, and driver overtime reconciliation.
- `/inventory` / `/app/inventory` — Spare-parts inventory, unit costs, and transaction ledgers.
- `/maintenance` / `/app/maintenance` — Periodic workshop servicing, oil change logs, and spare-parts usage.
- `/billing-engine` / `/app/billing-engine` — Automated monthly billing calculation engine.
- `/payroll` / `/app/payroll` — Statutory Sri Lankan EPF (8% / 12%) and ETF (3%) salary periods.
- `/invoices` / `/app/invoices` — Tax invoice generation, payment receipts, and balance tracking.
- `/quotations` / `/app/quotations` — Internal quotation drafting, approval, and publishing to customer portal.
- `/payments` / `/app/payments` — Recording incoming bank transfers, cheques, and cash payments.
- `/expenses` / `/app/expenses` — Fuel, repairs, and general operational expenses.
- `/social-leads` / `/app/social-leads` — Lead CRM queue capturing website contact forms and quotation requests.
- `/users` / `/app/users` — Role-based access control and staff management.
- `/settings` / `/app/settings` — Company branding, statutory rates, bank accounts, and **Public Website CMS**.

---

## 🔑 Default Administrator Login

- **URL:** `http://localhost:3000/login`
- **Email:** `admin@fleetflow.lk`
- **Password:** `admin123`

---

## 💻 Local Execution Guide

To run the unified Next.js application:

```bash
cd "d:\Intern\Rent vehicle\fleetflow\frontend"
npm run dev
```

- Application runs at: `http://localhost:3000`
- Public Website: `http://localhost:3000/`
- Customer Portal: `http://localhost:3000/portal`
- Management Dashboard: `http://localhost:3000/dashboard` or `http://localhost:3000/app/dashboard`

---

## 🧪 Automated Acceptance Verification Test Suite

To run the end-to-end acceptance scenarios (Scenarios A through I):

```bash
cd "d:\Intern\Rent vehicle\fleetflow\frontend"
node test_integrated_platform.js
```

All 9 acceptance scenarios test:
1. Public website enquiry persistence in MongoDB
2. Secure customer registration and role isolation
3. JWT session verification and role redirection
4. Single-use password reset token consumption
5. Quotation request to formal quotation workflow
6. Booking request to operational confirmation
7. Monthly invoice generation and settlement
8. Field-level privacy and private asset protection
9. Full backwards compatibility with all existing TMS modules.
