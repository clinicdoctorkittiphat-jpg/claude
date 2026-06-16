// Seed demo data. Exposes seed() so the server can auto-seed on first boot,
// and still runs standalone via `npm run seed`.
import bcrypt from "bcryptjs";
import { replaceAll, count } from "./db.js";

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export function seed() {
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  replaceAll("users", [
    { id: "usr_admin", name: "Dr. Kittiphat", email: "clinicdoctorkittiphat@gmail.com", username: "admin", password: hash("admin123"), role: "owner" },
    { id: "usr_nurse", name: "พยาบาลสมหญิง", email: "nurse@drkittiphat.clinic", username: "nurse", password: hash("nurse123"), role: "staff" },
  ]);

  // Service catalog (no fixed prices — clinic is walk-in, charges recorded per visit).
  replaceAll("services", [
    { id: "svc_consult", name: "ตรวจ/ปรึกษาแพทย์กระดูกและข้อ", category: "OPD", active: true },
    { id: "svc_xray", name: "เอกซเรย์ดิจิทัล (Digital X-ray)", category: "Imaging", active: true },
    { id: "svc_injection", name: "ฉีดยาเข้าข้อ (Joint Injection)", category: "Procedure", active: true },
    { id: "svc_trigger", name: "ฉีดยานิ้วล็อก (Trigger Finger Injection)", category: "Procedure", active: true },
    { id: "svc_dressing", name: "ทำแผล / หัตถการเล็ก", category: "Procedure", active: true },
    { id: "svc_med", name: "ยา / เวชภัณฑ์", category: "Other", active: true },
  ]);

  replaceAll("patients", [
    { id: "pat_1001", hn: "HN-1001", name: "สมชาย ใจดี", gender: "M", age: 58, phone: "081-234-5678", condition: "Knee osteoarthritis", createdAt: addDays(-120) + "T09:00:00Z" },
    { id: "pat_1002", hn: "HN-1002", name: "มาลี รักสุข", gender: "F", age: 45, phone: "089-111-2222", condition: "Frozen shoulder", createdAt: addDays(-80) + "T09:00:00Z" },
    { id: "pat_1003", hn: "HN-1003", name: "John Carter", gender: "M", age: 34, phone: "062-555-7788", condition: "ACL tear (post-op)", createdAt: addDays(-40) + "T09:00:00Z" },
    { id: "pat_1004", hn: "HN-1004", name: "ปรียา วงศ์ทอง", gender: "F", age: 67, phone: "086-777-9900", condition: "Lumbar spondylosis", createdAt: addDays(-15) + "T09:00:00Z" },
    { id: "pat_1005", hn: "HN-1005", name: "อนุชา พรหมมา", gender: "M", age: 29, phone: "095-432-1100", condition: "Ankle sprain", createdAt: addDays(-3) + "T09:00:00Z" },
  ]);

  replaceAll("inventory", [
    { id: "itm_1", sku: "MED-001", name: "Diclofenac 50mg (tab)", category: "Medicine", stock: 420, reorderLevel: 100, unit: "tab" },
    { id: "itm_2", sku: "MED-002", name: "Hyaluronic acid (vial)", category: "Medicine", stock: 12, reorderLevel: 15, unit: "vial" },
    { id: "itm_3", sku: "SUP-001", name: "Elastic bandage", category: "Supply", stock: 65, reorderLevel: 30, unit: "roll" },
    { id: "itm_4", sku: "SUP-002", name: "Fiberglass cast roll", category: "Supply", stock: 8, reorderLevel: 20, unit: "roll" },
    { id: "itm_5", sku: "SUP-003", name: "Disposable syringe 5ml", category: "Supply", stock: 300, reorderLevel: 150, unit: "pcs" },
  ]);
}

// Seed only when the DB is empty (safe to call on every boot).
export function seedIfEmpty() {
  if (count("users") === 0) {
    seed();
    return true;
  }
  return false;
}

// Run directly: `npm run seed` (force re-seed).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("seed.js")) {
  seed();
  console.log("✓ Seeded demo data → SQLite (data/clinic.db)");
  console.log("  Admin login →  username: admin   password: admin123");
}
