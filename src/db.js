// SQLite datastore using Node's built-in node:sqlite (no native build needed).
// Each collection is a table; every row is stored as a JSON document plus a few
// indexed columns. This keeps the generic CRUD API while giving real persistence.
import { DatabaseSync } from "node:sqlite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || resolve(__dirname, "../data/clinic.db");

const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

export const COLLECTIONS = [
  "users",
  "patients",
  "appointments",
  "services",
  "invoices",
  "inventory",
];

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
for (const c of COLLECTIONS) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS ${c} (
       id TEXT PRIMARY KEY,
       doc TEXT NOT NULL,
       createdAt TEXT,
       updatedAt TEXT
     );`
  );
}

const parse = (row) => (row ? JSON.parse(row.doc) : null);

function newId(collection) {
  return `${collection.slice(0, 3)}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function list(collection, filter = {}) {
  const rows = db.prepare(`SELECT doc FROM ${collection} ORDER BY createdAt`).all().map(parse);
  const entries = Object.entries(filter);
  if (!entries.length) return rows;
  return rows.filter((r) => entries.every(([k, v]) => String(r[k]) === String(v)));
}

export function get(collection, id) {
  return parse(db.prepare(`SELECT doc FROM ${collection} WHERE id = ?`).get(id));
}

export function create(collection, data) {
  const row = {
    id: data.id || newId(collection),
    createdAt: data.createdAt || new Date().toISOString(),
    ...data,
  };
  db.prepare(`INSERT INTO ${collection} (id, doc, createdAt, updatedAt) VALUES (?, ?, ?, ?)`)
    .run(row.id, JSON.stringify(row), row.createdAt, null);
  return row;
}

export function update(collection, id, data) {
  const existing = get(collection, id);
  if (!existing) return null;
  const row = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  db.prepare(`UPDATE ${collection} SET doc = ?, updatedAt = ? WHERE id = ?`)
    .run(JSON.stringify(row), row.updatedAt, id);
  return row;
}

export function remove(collection, id) {
  const info = db.prepare(`DELETE FROM ${collection} WHERE id = ?`).run(id);
  return info.changes > 0;
}

export function count(collection) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${collection}`).get().n;
}

// Replace the entire contents of a collection (used by the seeder).
export function replaceAll(collection, rows) {
  const tx = db.prepare(`DELETE FROM ${collection}`);
  tx.run();
  const ins = db.prepare(
    `INSERT INTO ${collection} (id, doc, createdAt, updatedAt) VALUES (?, ?, ?, ?)`
  );
  for (const r of rows) {
    const row = { createdAt: new Date().toISOString(), ...r };
    ins.run(row.id, JSON.stringify(row), row.createdAt, row.updatedAt || null);
  }
}
