# FleetFlow Lanka (Pvt) Ltd
### Enterprise Vehicle, Driver, Fleet Maintenance & Transport Operations Management Suite

FleetFlow Lanka is structured into two completely separate, independent projects inside `fleetflow`:

```
fleetflow/
├── frontend/    --> Next.js (App Router) + TypeScript + Tailwind CSS (Ready for Vercel)
└── backend/     --> Node.js + Express + Mongoose REST API (Ready for Render)
```

---

## 🔑 Default Administrator Login

- **URL:** `http://localhost:3000/login`
- **Email:** `admin@fleetflow.lk`
- **Password:** `admin123`

---

## 💻 Local Development Setup

To run both services locally, open two separate terminal windows:

### Terminal 1: Backend (Express.js on Port 5000)
```bash
cd "d:\Intern\Rent vehicle\fleetflow\backend"
npm run dev
```
- Starts the Express REST API server with nodemon at `http://localhost:5000`.
- Health check endpoint: `http://localhost:5000/api/health`.

### Terminal 2: Frontend (Next.js on Port 3000)
```bash
cd "d:\Intern\Rent vehicle\fleetflow\frontend"
npm run dev
```
- Starts the Next.js development server at `http://localhost:3000`.
- Proxies `/api/*` requests to `http://localhost:5000`.

---

## ☁️ Production Deployment Guide

### 1. Backend Deployment on Render (Web Service)
1. In your Render Dashboard, click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node server.js`)
4. Add Environment Variables in Render:
   - `PORT`: `5000` (Render will set this dynamically, but `process.env.PORT` handles it)
   - `MONGODB_URI`: `mongodb+srv://sudilthathsara19_db_user:JRekPIJDyPvd5rX9@cluster0.xqk8qbk.mongodb.net/fleetflow_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `fleetflow_enterprise_secure_jwt_token_secret_key_2026`
   - `NEXT_PUBLIC_APP_NAME`: `FleetFlow Lanka`
5. Click **Create Web Service**. Your backend will be deployed at `https://<your-render-backend-url>.onrender.com`.

### 2. Frontend Deployment on Vercel
1. In your Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your repository.
3. In the project configuration:
   - **Root Directory:** Click Edit and select `frontend`.
   - **Framework Preset:** `Next.js`
4. Add Environment Variables in Vercel:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://<your-render-backend-url>.onrender.com`
   - `MONGODB_URI`: `mongodb+srv://sudilthathsara19_db_user:JRekPIJDyPvd5rX9@cluster0.xqk8qbk.mongodb.net/fleetflow_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `fleetflow_enterprise_secure_jwt_token_secret_key_2026`
   - `NEXT_PUBLIC_APP_NAME`: `FleetFlow Lanka`
5. Click **Deploy**. Vercel will build and host your Next.js application globally with high-speed CDN and automatic API proxying.

---

## 👥 User Management & Staff Password Updates (Like Raxwo)

FleetFlow includes a complete staff management and role-based permissions dashboard at `/users`:
1. **Roles Available**:
   - `super_admin`: Full system control, permissions, user management & deletion.
   - `manager`: Bookings, trip assignments, rates and operations.
   - `accountant`: Financial entries, invoices, driver settlements, expenses.
   - `operations`: Vehicles, running charts, drivers, and daily bookings.
   - `maintenance`: Workshop records, inspections and service logs.
   - `auditor`: Read-only access to records and financial summaries.

2. **Admin Password Reset**:
   - Super Admins can update any staff user's password directly using the **Key (🔑)** button in the actions column.
   - The user can immediately log in with their updated password.

Default Super Admin Login
Email: admin@fleetflow.lk
Password: admin123