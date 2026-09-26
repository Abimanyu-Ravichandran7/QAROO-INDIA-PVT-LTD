# Qaroo India — CMS-Driven Web App

Qaroo India is a full-stack CMS-driven web application built on the existing React/Vite public site plus a new Node.js/Express + MongoDB backend. The public frontend is now powered by an admin dashboard at `/admin` with role-based permissions, JWT auth (HTTP-only cookies), email verification, and a Super Admin approval workflow.

## Tech Stack

- **Frontend:** React 18, Vite 5, React Router v6, React Bootstrap, GSAP, Lenis, Motion, OGL (existing components/design preserved)
- **Backend:** Node.js, Express, MongoDB + Mongoose
- **Auth:** JWT access/refresh tokens in HTTP-only cookies, bcrypt password hashing, Nodemailer email verification
- **Images:** Cloudinary (falls back to raw URL passthrough when no credentials are configured)
- **Admin dashboard:** `/admin/*` — custom design system matching the Qaroo brand (`--admin-base: #931913`, `--admin-accent: #e4cc2e`)

## Folder Structure

```
qaroo-react-app/
├── src/                    # React frontend (public site + admin)
│   ├── admin/              # Admin dashboard (routes, layout, pages, context, css)
│   ├── api/                # Centralized API client + per-module API wrappers
│   ├── pages/              # Public pages (now fetch from the backend)
│   └── components/         # Existing React Bits components / animations
├── backend/                # Express + MongoDB API
│   ├── config/             # DB connection
│   ├── controllers/        # auth, admin, mou, page, csr, learning, contact
│   ├── middleware/         # auth, admin, permission, error
│   ├── models/             # Admin, MOU, PageContent, CSRProject, LearningProgram, ContactMessage
│   ├── routes/             # auth, admin, mou, page, csr, learning, contact
│   ├── services/           # email, image (Cloudinary)
│   ├── utils/              # generateToken, permissions (ALL_PERMISSIONS)
│   ├── data/seedData.js    # All static content migrated from the existing site
│   ├── seed/               # Seed scripts (npm run seed)
│   └── test/api.test.js    # End-to-end API test suite
└── vite.config.js          # Dev proxy: /api -> http://localhost:5000
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally on `127.0.0.1:27017` (or set `MONGODB_URI`)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # then edit .env (JWT_SECRET, admin, email, etc.)
```

Configure `backend/.env`:

- `JWT_SECRET` — long random secret (required)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — required by the seed script; the Super Admin is never created with a default password, so set both before seeding
- `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` — SMTP for verification emails (leave blank to skip actual sending in dev)
- `CLOUDINARY_*` — optional; image upload falls back to URL passthrough when blank, resumes to local disk

### 2. Seed the database

```bash
cd backend
npm run seed
```

This creates the Super Admin (using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`, both required) and seeds all migrated content (14 MOUs, 12 CSR projects, 7 learning programs, and page content for home/about/business/contact).

### 3. Start the backend

```bash
cd backend
npm run dev        # nodemon, or: npm start
```

Server runs at `http://localhost:5000`.

### 4. Frontend

```bash
npm install
npm run dev
```

The Vite dev proxy forwards `/api` requests to `http://localhost:5000`. Open `http://localhost:5173` for the public site and `http://localhost:5173/admin` for the admin dashboard.

## Admin Dashboard

- **`/admin/login`** — sign in (cookies set automatically via API)
- **`/admin/register`** — sign up as a non-Super Admin (requires email verification + Super Admin approval)
- **`/admin/dashboard`** — overview stats
- **`/admin/mous`** — MOU directory CRUD
- **`/admin/csr`** — CSR project CRUD
- **/admin/learning** — learning program CRUD
- **`/admin/content`** — edit page content (home / about / business / contact)
- **`/admin/messages`** — view/mark/resolve contact-message submissions
- **`/admin/admins`** — manage other admins, approve, and edit granular permissions (Super Admin only)

## Roles & Permissions

Super Admin bypasses all permission checks. Granular permissions are defined in `backend/utils/permissions.js`:

`dashboard.view`, `mou.create/read/update/delete`, `home.update`, `about.update`, `business.update`, `learning.create/read/update/delete`, `csr.create/read/update/delete`, `contact.read/delete`, `admin.create/read/update/delete`, `permissions.manage`

- Public reads use `optionalAuth` (only published data unless an admin token is attached).
- Mutations use `protect` + `requireVerifiedApproved` + `requirePermission(...)`.
- If no admins exist, the first registered admin automatically becomes a verified + approved Super Admin.

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login (sets cookies) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/verify-email` | Verify email via token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET/POST/PUT/DELETE | `/api/admins` | Admin management (Super Admin) |
| GET/POST/PUT/DELETE | `/api/mous` | MOU directory CRUD |
| GET | `/api/mous/categories` | MOU category dropdown list |
| GET/POST/PUT/DELETE | `/api/csr` | CSR project CRUD |
| GET | `/api/csr/categories` | CSR category dropdown list |
| GET/POST/PUT/DELETE | `/api/learning` | Learning program CRUD |
| GET/POST/PUT/DELETE | `/api/business-solutions` | Business solutions CRUD |
| GET/PUT | `/api/content/:page` | Page content (home/about/business/learning/csr/contact/mou) |
| GET | `/api/content/pages` | List valid page keys |
| GET | `/api/stats` | Live published counts (MOUs, CSR projects) |
| POST | `/api/contact` | Submit a contact message (public) |
| GET/PUT/DELETE | `/api/contact` | Admin message management |
| POST | `/api/client-errors` | Report a frontend crash (public) |
| GET | `/api/client-errors` | List frontend crashes (Super Admin) |
| GET | `/api/health` | Health check |

## Verification

- **Frontend build:** `npm run build` (verifies the whole app including admin compiles)
- **Backend API tests:** `node test/api.test.js` (runs against a running server on `localhost:5000`)
