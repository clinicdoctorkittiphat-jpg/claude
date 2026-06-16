# Dr. Kittiphat — Clinic ERP (Prototype)

A landing page + admin ERP backend for **Dr. Kittiphat Orthopaedic Clinic**.
Node + Express with a zero-setup JSON datastore (no native builds, no DB server).

## Run

```bash
npm install
npm run seed     # load demo data (run once)
npm start        # http://localhost:3000
```

- **Landing page** → http://localhost:3000/
- **Admin ERP** → http://localhost:3000/admin/
- **Login** → `admin` / `admin123` (or `nurse` / `nurse123`)

## What's included

**Landing page** (`public/`)
- Hero, services (priced), about doctor, why-us, online booking form, contact.
- Booking form posts to the ERP → appears in Admin as a `pending` appointment (source: website).
- Thai-first, responsive.

**Admin ERP** (`public/admin/`)
- Token login + dashboard (revenue, today's appointments, patients, low-stock alerts).
- CRUD modules: Appointments, Patients, Services, Invoices, Inventory.
- Search, add/edit/delete via modal forms (schema-driven).

## Structure

```
server.js          Express app: auth + REST API + static hosting
src/db.js          JSON-file datastore (swap for SQLite/Postgres later)
src/seed.js        Demo data
data/db.json       The database (created on seed)
public/            Landing page
public/admin/      Admin SPA
```

## API quick reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | – | Get token |
| POST | `/api/public/appointments` | – | Booking from website |
| GET | `/api/dashboard/stats` | ✓ | Dashboard metrics |
| GET/POST | `/api/:collection` | ✓ | List / create |
| GET/PUT/DELETE | `/api/:collection/:id` | ✓ | Read / update / delete |

`:collection` = `patients` · `appointments` · `services` · `invoices` · `inventory`

## Prototype notes / next steps

- Auth is in-memory tokens with plaintext demo passwords — **replace before production** (hash passwords, persistent sessions/JWT).
- Swap `src/db.js` for SQLite/Postgres when data grows.
- Add: invoice line-item editor, PDF receipts, appointment calendar view, role-based permissions, audit log.
