// Tiny JSON-file datastore — zero native deps, perfect for a prototype.
// Swap this module for SQLite/Postgres later without touching the routes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "../data/db.json");

const EMPTY = {
  users: [],
  patients: [],
  appointments: [],
  services: [],
  invoices: [],
  inventory: [],
};

function ensureFile() {
  const dir = dirname(DATA_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, JSON.stringify(EMPTY, null, 2));
}

export function load() {
  ensureFile();
  try {
    return { ...EMPTY, ...JSON.parse(readFileSync(DATA_FILE, "utf8")) };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function save(db) {
  ensureFile();
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Generic collection helpers ------------------------------------------------
export function list(collection, filter = {}) {
  const db = load();
  let rows = db[collection] ?? [];
  for (const [k, v] of Object.entries(filter)) {
    rows = rows.filter((r) => String(r[k]) === String(v));
  }
  return rows;
}

export function get(collection, id) {
  return (load()[collection] ?? []).find((r) => r.id === id) ?? null;
}

export function create(collection, data) {
  const db = load();
  if (!db[collection]) db[collection] = [];
  const row = {
    id: `${collection.slice(0, 3)}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  db[collection].push(row);
  save(db);
  return row;
}

export function update(collection, id, data) {
  const db = load();
  const rows = db[collection] ?? [];
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return null;
  rows[i] = { ...rows[i], ...data, id, updatedAt: new Date().toISOString() };
  save(db);
  return rows[i];
}

export function remove(collection, id) {
  const db = load();
  const rows = db[collection] ?? [];
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return false;
  rows.splice(i, 1);
  save(db);
  return true;
}
