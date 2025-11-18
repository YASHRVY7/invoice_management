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
| --- | --- | --- |
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

## API Surface (selected)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create user (returns JWT). |
| `POST` | `/auth/login` | Authenticate and issue JWT containing `username`, `role`, `userId`. |
| `GET` | `/invoices` | Paginated invoices with filters `status`, `clientName`. |
| `POST` | `/invoices` | Create invoice with nested items (auto totals). |
| `PUT` / `PATCH` | `/invoices/:id` / `/invoices/:id/status` | Update invoice or just its status. |
| `GET` | `/invoices/statistics` | Summary counts & revenue for dashboard cards. |
| `GET` | `/chart/income?period=day|week|month|year` | Aggregated income for charts. |
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

