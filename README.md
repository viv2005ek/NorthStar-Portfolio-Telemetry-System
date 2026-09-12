# ✦ NORTHSTAR // Portfolio Intelligence Telemetry System

> **Institutional-Grade Multi-Tenant Investment Portfolio Analytics Platform**  
> *Cold on the surface, precise underneath, lit by a single acid accent.*

---

## ✦ Overview & Aesthetic Philosophy

Northstar is an internal-grade **investment portfolio analytics application** designed for investment professionals to evaluate portfolio holdings, market valuations, asset allocations, and period performance metrics with uncompromising speed and visual discipline.

### Design System: Terminal Meets High Wealth Management
- **Ink Black Canvas (`#0A0A0A`)**: Full-bleed dark mode canvas with single-surface step elevation (`#141414`).
- **Single Chromatic Accent (`#D4FF3F`)**: Acid green highlight used exclusively for active tenant dots, positive return indicators, focused input underlines, and primary actions.
- **Dual Typography Engine**:
  - **Instrument Serif** (Display, 140–180px): Renders portfolio valuation like a physical ledger entry.
  - **JetBrains Mono** (Technical): Tabular numbers and engineering telemetry across all labels, tables, and readouts.
- **Hairline Geometry (`#1A1A1A`)**: Crisp 0.5px / 1px dividers, zero border-radius, four-corner targeting ticks (`┌ ┐ └ ┘`) on interactive panels.
- **Mechanical Odometer Motion**: Split-flap digit rotation on value updates over 400ms.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Nginx / Vite Web Client                         │
│                    (React 18 + TS + Tailwind CSS)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP / JSON (Bearer JWT)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Express Node.js API                            │
│                                                                        │
│  • JWT Auth & RLS Claims Decoders    • CSV Validation Pipeline         │
│  • Atomic PostgreSQL Transactions    • Portfolio Valuation Engine      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       SQL (Parameterized Queries)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL 16 Alpine Database                     │
│                        (Docker Containerized)                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts
- **Backend**: Node.js, Express, PostgreSQL (`pg`), JWT (`jsonwebtoken`), bcryptjs, Multer, `csv-parse`
- **Infrastructure & Containerization**: PostgreSQL 16 Alpine, Nginx, Docker, Docker Compose

---

## 🔑 Demo Access & Seed Credentials

The application initializes with two isolated tenant organizations for multi-tenant verification:

| Tenant | Access Email | Password | Tenant Name | Pre-loaded Data | Keyboard Hotkey |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tenant 1** | `tenant_a@example.com` | `Password123!` | Alpha Capital | Sample Holdings | `⌘1` / `Ctrl+1` |
| **Tenant 2** | `tenant_b@example.com` | `Password123!` | Beacon Advisors | Sample Holdings | `⌘2` / `Ctrl+2` |

---

## 🚀 Quick Start (Single Command)

### 1. Run via Docker Compose (Recommended)

Start the entire full-stack application (Database, API Backend, Nginx Web Client):

```bash
docker compose up --build
```

Access points:
- **Web UI**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
- **Backend API**: `http://localhost:5000`

---

### 2. Run Local Frontend Development Server

If you prefer to run the Vite frontend locally:

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Multi-Tenant Row-Level Isolation

1. **JWT Claim Source of Truth**: All backend routes extract `tenant_id` directly from the authenticated JWT token payload. Query parameters or request body tenant overrides are strictly rejected.
2. **Parameterized SQL Queries**: Every database query filters with `WHERE tenant_id = $1`.
3. **Verified Data Boundaries**: Resetting or modifying holdings for Tenant A leaves Tenant B's dataset 100% untouched.

---

## 📊 CSV Format & Atomic Validation Rules

Holdings datasets are uploaded via CSV with mandatory schema headers:

```csv
date,ticker,asset_class,quantity,price
2026-01-01,AAPL,Equity,100,150.00
2026-01-01,MSFT,Equity,100,350.00
2026-01-01,AGG,Bond,400,94.00
2026-01-01,USD,Cash,5000,1.00
2026-06-30,AAPL,Equity,100,178.50
2026-06-30,MSFT,Equity,100,380.00
2026-06-30,AGG,Bond,350,95.00
2026-06-30,BND,Bond,23,100.00
2026-06-30,USD,Cash,5000,1.00
```

### Atomic Validation Rules
- **Schema Validation**: Required columns (`date`, `ticker`, `asset_class`, `quantity`, `price`).
- **Data Types & Ranges**: ISO date format (`YYYY-MM-DD`), numeric `quantity > 0`, non-negative `price >= 0`.
- **Duplicate Prevention**: In-file duplicate checking flags duplicate ticker/date entries with line-specific errors (`[ROW 04]`).
- **Atomic Rollback**: Executed inside `BEGIN ... ROLLBACK` transaction block. Any single invalid row aborts the entire upload, preserving data integrity.

---

## 📑 API Reference

### 1. Operator Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tenant_a@example.com",
  "password": "Password123!"
}
```

### 2. Portfolio Telemetry Readout
```http
GET /api/dashboard
Authorization: Bearer <token>
```

### 3. Holdings CSV Dataset Upload
```http
POST /api/holdings/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data (file: CSV)
```

### 4. Atomic Dataset Reset
```http
DELETE /api/holdings
Authorization: Bearer <token>
```

---

## 🧪 Verification & Build Status

- **Frontend Compilation**: Built cleanly via `tsc && vite build` in 1.15s with 0 errors.
- **Backend API & Database**: Fully verified via Docker Compose with healthchecks.

---

*System Version: Northstar OS v1.0.0 // All Rights Reserved*
