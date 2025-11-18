# Invoice Automation Platform

[![Angular](https://img.shields.io/badge/Angular-20.3-bd002e?logo=angular&logoColor=white)](#invoice-app) 
[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?logo=nestjs&logoColor=white)](#invoice-backend) 
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](#tech-stack) 
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](#invoice-backend) 
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520.0-339933?logo=node.js&logoColor=white)](#getting-started) 
[![CI Ready](https://img.shields.io/badge/CI-ready-success)](#useful-scripts) 
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#license)

> End-to-end invoice management with JWT auth, analytics, PDF generation, and admin tooling—built with Angular 20 and NestJS 11.

---

## Highlights

- **Modern UX**: Tailwind + Flowbite based Angular standalone components for auth, dashboard, invoicing, PDF previews, and admin views.
- **Business-grade API**: NestJS + TypeORM + PostgreSQL with JWT auth, granular invoice filters, role-based admin routes, analytics, and PDF exports.
- **Productivity optimizations**: Shared models, HTTP interceptors, guards, and DTO validation keep the stack type-safe front-to-back.
- **Ready for teams**: Admin module manages users/logs, income charts visualize paid revenue, and PDF templates are customizable via UI.

---

## Repository Layout

| Path | Description | Key tech |
|------|-------------|----------|
| `invoice-app/` | Angular SPA for signup/login, invoice CRUD, dashboards, charts, PDF customization, and admin console. | Angular 20, ng2-charts, Chart.js, Tailwind, Flowbite |
| `invoice-backend/` | NestJS API for auth, invoices, PDF generation, analytics, and admin endpoints. | NestJS 11, TypeORM, PostgreSQL, JWT, PDFKit |

---

## Architecture Overview

```
Angular UI ──> Auth & Invoice Services ──┐
                                        │ REST (JWT)
Browser Storage (JWT) <─ Auth Guard <───┤
                                        ▼
                              NestJS HTTP API
                                  │
                    TypeORM ↔ PostgreSQL (invoices, users, items)
                                  │
                         PDFKit for downloadable invoices
```

- `Auth` service/guards store JWTs securely and gate both `/invoices/*` and `/admin`.
- `authInterceptor` automatically injects the `Authorization` header and redirects on `401`s.
- Backend DTOs validate every payload; services centralize calculations (e.g., overdue logic, totals, stats).
- Chart endpoints (`/chart/income`) aggregate paid revenue by day/week/month/year for the dashboard widget.
- PDF service (`/pdf/invoice/:id`) streams a branded invoice PDF that can be customized via UI form inputs.

---

## Tech Stack

- **Frontend**: Angular 20, Standalone Components, ng2-charts/Chart.js, TailwindCSS 3, Flowbite UI kit, RxJS 7.
- **Backend**: NestJS 11, TypeORM 0.3, PostgreSQL, Passport JWT, PDFKit, class-validator/transformer, bcrypt.
- **Tooling**: ESLint + Prettier, Karma/Jasmine (FE tests), Jest (BE unit/e2e), `ts-node` utilities, `check-db-connection` script.

---

## Frontend (`invoice-app`)

- **Auth**: Login/signup forms with optimistic UX, JWT storage, and role-aware guards.
- **Dashboard**: Combined stats + latest invoices + income line chart (`Chart` component) backed by `/invoices/statistics` and `/chart/income`.
- **Invoices**: CRUD screens (`InvoiceList`, `InvoiceCreate`, `InvoiceDetail`, `InvoiceEdit`) with filters (status, client name), pagination, bulk state toggling, and delete safety prompts.
- **PDF customization**: `Pdf` component collects branding fields (`fromName`, address, email, notes) before requesting a PDF blob.
- **Admin console**: Protected by `roleGuard`, surfaces user totals, active/admin counts, activity logs, and deletion controls (`AdminDashboard` + `Admin` service).
- **Shared UX**: Tailwind utility classes, Flowbite components, and centralized constants (`API`) keep endpoints configurable.

---

## Backend (`invoice-backend`)

- **Auth module**: Signup/login endpoints issue JWTs with embedded username/role, consumed by `JwtAuthGuard`.
- **Invoices module**: DTOs sanitize payloads, service auto-calculates status (e.g., auto-overdue), totals, and pagination metadata.
- **Chart module**: Uses `DATE_TRUNC` queries to aggregate paid invoices into chart-friendly `labels` + `values`.
- **PDF module**: `PdfService` builds polished invoices via PDFKit, applying customization payloads and inline INR currency formatting.
- **Admin module**: Role-protected routes (`@Roles(Role.Admin)`) expose user CRUD and audit logs.
- **Config**: `getDatabaseConfig` injects `DB_*` env vars; `synchronize` + SQL logging only enabled in development. `check-db-connection.ts` validates connectivity ahead of migrations.

---

## How It Works

### Authentication Flow

1. **User Registration/Login**:
   - User submits credentials via `Signup` or `Login` components
   - Frontend `Auth` service sends POST to `/auth/signup` or `/auth/login`
   - Backend `AuthService` validates credentials, hashes passwords with bcrypt, and issues JWT
   - JWT payload includes: `userId`, `username`, `role` (user/admin), and expiration
   - Frontend stores JWT in `localStorage` and redirects to dashboard

2. **Protected Route Access**:
   - `authGuard` checks `localStorage` for valid JWT before allowing access to `/dashboard`, `/invoices/*`, `/admin`
   - `authInterceptor` automatically attaches `Authorization: Bearer <token>` to all HTTP requests
   - On 401 responses, interceptor clears token and redirects to login
   - JWT validation includes expiration check and format validation (3-part structure)

3. **Role-Based Access**:
   - `roleGuard` reads `role` from JWT payload and compares against route `data.roles`
   - Admin routes (`/admin/*`) require `role === 'admin'`; regular users are redirected to dashboard
   - Backend `RolesGuard` + `@Roles(Role.Admin)` decorator enforce server-side authorization

### Invoice Management Workflow

1. **Creating an Invoice**:
   - User fills `InvoiceCreate` form with client details, issue/due dates, tax amount, and line items
   - Frontend calculates subtotal (sum of `quantity × unitPrice` for all items) and total (subtotal + tax)
   - On submit, `InvoiceService.create()` sends POST to `/invoices` with validated payload
   - Backend `InvoiceService.createInvoice()`:
     - Generates unique invoice number: `INV-YYYYMM-XXX` (e.g., `INV-202412-042`)
     - Calculates subtotal and totalAmount server-side
     - Auto-determines status: if `dueDate < today` and status is `unpaid`, sets to `overdue`
     - Saves invoice and nested items via TypeORM cascade
   - Response includes full invoice with ID; frontend navigates to detail view

2. **Invoice Status Management**:
   - Status can be: `unpaid`, `paid`, `overdue`, `cancelled`
   - **Auto-overdue logic**: On fetch/update, backend checks if `unpaid` invoice has `dueDate < today` → auto-updates to `overdue`
   - Manual status toggle: Dashboard/List views allow quick toggle between `paid`/`unpaid` via PATCH `/invoices/:id/status`
   - Status calculation respects business rules: `cancelled` and `paid` invoices are never auto-changed to `overdue`

3. **Listing & Filtering**:
   - `InvoiceList` component loads paginated invoices via GET `/invoices?page=1&limit=10&status=paid&clientName=John`
   - Backend `getAllInvoicesForUser()`:
     - Filters by `userId` (from JWT) to ensure data isolation
     - Applies status filter (special handling for `overdue`: includes unpaid past due)
     - Applies case-insensitive `clientName` ILIKE search
     - Returns pagination metadata: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`
   - Frontend displays table with pagination controls and filter dropdowns

4. **Editing & Deletion**:
   - `InvoiceEdit` loads invoice by ID, allows modification of all fields
   - On update, backend recalculates totals if items changed, re-applies overdue logic
   - Delete action requires confirmation; backend cascades deletion of related invoice items

### PDF Generation Process

1. **PDF Customization**:
   - User clicks "Download PDF" on invoice detail page
   - `Pdf` component opens modal form to collect optional branding:
     - `fromName`: Company name (default: "Your Company Name")
     - `fromAddress`: Multi-line address
     - `fromEmail`: Contact email
     - `extraDetails`: Additional notes/terms
   - Form submission triggers POST `/pdf/invoice/:id` with customization payload

2. **PDF Rendering**:
   - Backend `PdfService.generateInvoicePdf()`:
     - Fetches invoice with items from database
     - Creates PDFKit document (A4 size, 50px margins)
     - Renders sections:
       - **Header**: "INVOICE" title, invoice number, issue/due dates, status
       - **From block**: Customizable company info
       - **Bill To**: Client name, address, email, phone
       - **Items table**: Description, quantity, unit price, total (with rounded corners and gray header)
       - **Totals box**: Subtotal, tax, grand total (formatted as ₹ with Indian number format)
       - **Footer**: Thank you message
     - Streams PDF directly to response with `Content-Disposition: attachment`
   - Frontend receives blob, creates download link, triggers browser download

### Dashboard & Analytics

1. **Statistics Cards**:
   - Dashboard loads via `forkJoin` of two API calls:
     - GET `/invoices/statistics` → returns `totalInvoices`, `paidInvoices`, `unpaidInvoices`, `overdueInvoices`, `totalRevenue`
     - GET `/invoices?page=1&limit=5` → recent invoices for quick access
   - Backend `getInvoiceStatistics()`:
     - Counts invoices by status for current user
     - Sums `totalAmount` of all `paid` invoices for revenue
     - Auto-updates overdue invoices before calculating stats
   - Cards display with color-coded status badges

2. **Income Chart**:
   - `Chart` component uses Chart.js with ng2-charts wrapper
   - User selects period filter: `day`, `week`, `month`, `year`
   - GET `/chart/income?period=month` triggers backend aggregation:
     - `ChartService.getIncomeStats()` uses PostgreSQL `DATE_TRUNC` to group paid invoices by period
     - Returns `{ labels: ['2024-01', '2024-02', ...], values: [15000, 23000, ...] }`
   - Frontend updates line chart with gradient fill, INR currency formatting on Y-axis
   - Chart auto-refreshes when filter changes

### Admin Features

1. **User Management**:
   - Admin dashboard (`AdminDashboard`) loads on `/admin` route (protected by `roleGuard`)
   - GET `/admin/users` returns all users with counts (total, active, admin)
   - GET `/admin/logs` returns recent user creation events (mapped from user `createdAt` timestamps)
   - DELETE `/admin/users/:id` removes user (cascades to invoices via TypeORM `onDelete: 'CASCADE'`)

2. **Access Control**:
   - Backend `AdminController` uses `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.Admin)`
   - Frontend `roleGuard` checks JWT `role` field before allowing route access
   - Non-admin users attempting `/admin` are redirected to dashboard

### Data Flow & State Management

1. **Frontend State**:
   - No global state store (Redux/NgRx); components manage local state via services
   - `Auth` service provides singleton methods for token/username/role access
   - `InvoiceService`, `Chart`, `PdfService`, `Admin` services handle HTTP communication
   - JWT stored in `localStorage`; components read via `Auth.isAuthenticated()` and `Auth.getRole()`

2. **Backend State**:
   - PostgreSQL database stores persistent data (users, invoices, invoice_items)
   - TypeORM entities define relationships: `User` → `Invoice` (one-to-many), `Invoice` → `InvoiceItem` (one-to-many)
   - Database synchronization enabled in development (`synchronize: true`); disabled in production

3. **Request/Response Flow**:
   ```
   Angular Component → Service → HTTP Client → authInterceptor → NestJS Controller
                                                                    ↓
   PostgreSQL ← TypeORM Repository ← Service ← DTO Validation ← Guard (JWT)
   ```

### Key Business Logic

1. **Invoice Number Generation**:
   - Auto-generated on insert via `@BeforeInsert()` hook: `INV-{YYYY}{MM}-{random 3 digits}`
   - Ensures uniqueness via database unique constraint

2. **Total Calculations**:
   - Subtotal: sum of `item.quantity × item.unitPrice` for all items
   - Total: `subtotal + taxAmount`
   - Calculated on both frontend (for preview) and backend (for persistence)

3. **Overdue Detection**:
   - Runs automatically on: invoice fetch, list load, statistics calculation
   - Logic: if `status === 'unpaid'` AND `dueDate < today` → set `status = 'overdue'`
   - Exceptions: `paid` and `cancelled` invoices are never auto-changed

4. **Currency Formatting**:
   - PDF uses Indian Rupee (₹) with `Intl.NumberFormat('en-IN')` for thousands separators
   - Chart tooltips and Y-axis labels format values as `₹1,23,456.78`

---

## API Surface (selected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Create user (returns JWT). |
| `POST` | `/auth/login` | Authenticate and issue JWT containing `username`, `role`, `userId`. |
| `GET` | `/invoices` | Paginated invoices with filters `status`, `clientName`. |
| `POST` | `/invoices` | Create invoice with nested items (auto totals). |
| `PUT` / `PATCH` | `/invoices/:id` / `/invoices/:id/status` | Update invoice or just its status. |
| `GET` | `/invoices/statistics` | Summary counts & revenue for dashboard cards. |
| `GET` | `/chart/income?period=day\|week\|month\|year` | Aggregated income for charts. |
| `POST` | `/pdf/invoice/:id` | Streams customized PDF (accepts optional branding payload). |
| `GET` | `/admin/users` | Admin-only: list users + total counts. |
| `GET` | `/admin/logs` | Admin-only: recent audit entries. |
| `DELETE` | `/admin/users/:id` | Admin-only user removal. |

All invoice, chart, pdf, and admin routes require a valid `Authorization: Bearer <token>` header enforced by `JwtAuthGuard`.

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL ≥ 14 with a database/user ready
- Angular CLI (`npm install -g @angular/cli`) for convenience

### 2. Environment variables (backend)

Create `invoice-backend/.env`:

```
NODE_ENV=development
PORT=3000
JWT_SECRET=replace-me
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=invoice_db
```

> Run `npm run check:db` inside `invoice-backend` to verify connectivity.

### 3. Install dependencies

```bash
# from repo root
cd invoice-backend && npm install
cd ../invoice-app && npm install
```

### 4. Run development servers

```bash
# backend API (http://localhost:3000)
cd invoice-backend
npm run start:dev

# frontend SPA (http://localhost:4200)
cd ../invoice-app
npm start
```

The Angular app points to `http://localhost:3000` via `API.BASE` and will hot-reload on changes.

---

## Quality Checks & Testing

```bash
# Frontend unit tests (Karma + Jasmine)
cd invoice-app && npm test

# Backend unit tests (Jest)
cd invoice-backend && npm test

# Backend e2e tests
cd invoice-backend && npm run test:e2e

# Linting / formatting
cd invoice-backend && npm run lint
cd invoice-app && npx ng lint   # add schematic if desired
```

---

## Useful Scripts

- `invoice-backend npm run start:prod` – run compiled API from `dist/`.
- `invoice-backend npm run build` – emit transpiled server files.
- `invoice-backend npm run test:cov` – coverage reports.
- `invoice-app npm run build` – production Angular build → `invoice-app/dist`.
- `invoice-app npm run test` – watchable unit suite.

Consider wiring these into CI (GitHub Actions, CircleCI, etc.) using the provided commands.

---

## Deployment Notes

- **Backend**: Disable `synchronize` in production (set `NODE_ENV=production`) and manage migrations manually. Provide `JWT_SECRET` via secret store. Containerizing with multi-stage Node 20 images is recommended.
- **Frontend**: Serve the Angular `dist/invoice-app/browser` contents via any static host (S3, Netlify, Vercel, Nginx). Update `API.BASE` (environment-specific config) before building.
- **Security**: HTTPS termination + secure storage for JWT (currently `localStorage`) should be reviewed for production use; consider refresh tokens and stricter CSP headers.

---

## Roadmap Ideas

- Background jobs to email invoices or reminders for overdue accounts.
- Multi-tenant/company switcher support and branded themes.
- Export/import of invoices (CSV/XLSX) and scheduled PDF delivery.
- Automated CI (tests, lint, build) plus IaC for provisioning PostgreSQL.

---

## License

This repository is currently marked as **private / unlicensed**. All rights reserved—please do not distribute without explicit permission.
