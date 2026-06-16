# คลินิกกระดูกและข้อหมอกิตติพัฐ — Clinic ERP (Prototype)

A landing page + admin ERP backend for **Dr. Kittiphat Orthopedic Clinic, Phuket**
(คลินิกกระดูกและข้อหมอกิตติพัฐ) — non-surgical orthopedic care.
Content based on [clinicdoctorkittiphat.com](https://www.clinicdoctorkittiphat.com).
Node + Express, SQLite (built-in `node:sqlite`, no native build), bcrypt-hashed passwords.

## Run

```bash
npm install
npm start        # http://localhost:3000  (auto-seeds demo data on first run)
```

> `npm run seed` re-loads/refreshes the demo data at any time.

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
server.js          Express app: bcrypt auth + REST API + static hosting + auto-seed
src/db.js          SQLite datastore via node:sqlite (generic CRUD)
src/seed.js        Demo data (seed / seedIfEmpty)
data/clinic.db     The SQLite database (created on first run; git-ignored)
render.yaml        Render deploy blueprint (web service + persistent disk)
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

## Deploy (Render — free)

1. Push this repo to GitHub (done).
2. Go to [render.com](https://render.com) → **New + → Blueprint** → connect this repo.
3. Render reads `render.yaml`, provisions the service + a 1 GB disk for the SQLite
   database, and deploys. You get a public URL like `https://drkittiphat-erp.onrender.com`.

The included disk keeps `clinic.db` persistent across restarts (path set via `DB_PATH`).

## Prototype notes / next steps

- ✅ Passwords are bcrypt-hashed; SQLite gives real persistence.
- Auth tokens are still **in-memory** (reset on restart, single-instance only) — move to
  JWT or a session store before scaling.
- Add: invoice line-item editor, PDF receipts, appointment calendar view,
  role-based permissions, audit log.
- For multi-user production with sensitive patient data, move to Postgres and add HTTPS,
  backups, and access logging.
