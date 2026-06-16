import express from "express";
import bcrypt from "bcryptjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import * as store from "./src/db.js";
import { seedIfEmpty } from "./src/seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// First boot on a fresh database → load demo data automatically.
if (seedIfEmpty()) console.log("  (auto-seeded demo data into empty database)");

app.use(express.json());

// --- Super-light token auth (prototype only) -------------------------------
const sessions = new Map(); // token -> user
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = sessions.get(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = store.list("users").find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password || "", user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = randomUUID();
  const safe = { id: user.id, name: user.name, role: user.role, email: user.email };
  sessions.set(token, safe);
  res.json({ token, user: safe });
});

app.post("/api/auth/logout", auth, (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  sessions.delete(token);
  res.json({ ok: true });
});

// --- Dashboard stats -------------------------------------------------------
app.get("/api/dashboard/stats", auth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const appts = store.list("appointments");
  const invoices = store.list("invoices");
  const inventory = store.list("inventory");
  res.json({
    patients: store.list("patients").length,
    appointmentsToday: appts.filter((a) => a.date === today).length,
    pendingAppointments: appts.filter((a) => a.status === "pending").length,
    revenuePaid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0),
    revenueUnpaid: invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + (i.total || 0), 0),
    lowStock: inventory.filter((i) => i.stock <= i.reorderLevel).length,
    upcoming: appts
      .filter((a) => a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 6),
  });
});

// --- Generic CRUD for the admin collections --------------------------------
const COLLECTIONS = ["patients", "appointments", "services", "invoices", "inventory"];
function guard(req, res, next) {
  if (!COLLECTIONS.includes(req.params.collection))
    return res.status(404).json({ error: "Unknown collection" });
  next();
}

app.get("/api/:collection", auth, guard, (req, res) =>
  res.json(store.list(req.params.collection))
);
app.get("/api/:collection/:id", auth, guard, (req, res) => {
  const row = store.get(req.params.collection, req.params.id);
  return row ? res.json(row) : res.status(404).json({ error: "Not found" });
});
app.post("/api/:collection", auth, guard, (req, res) =>
  res.status(201).json(store.create(req.params.collection, req.body || {}))
);
app.put("/api/:collection/:id", auth, guard, (req, res) => {
  const row = store.update(req.params.collection, req.params.id, req.body || {});
  return row ? res.json(row) : res.status(404).json({ error: "Not found" });
});
app.delete("/api/:collection/:id", auth, guard, (req, res) => {
  const ok = store.remove(req.params.collection, req.params.id);
  return ok ? res.json({ ok: true }) : res.status(404).json({ error: "Not found" });
});

// --- Static files ----------------------------------------------------------
app.use(express.static(resolve(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n  Dr. Kittiphat ERP — prototype`);
  console.log(`  Landing page →  http://localhost:${PORT}/`);
  console.log(`  Admin ERP    →  http://localhost:${PORT}/admin/`);
  console.log(`  Login        →  username: admin   password: admin123\n`);
});
