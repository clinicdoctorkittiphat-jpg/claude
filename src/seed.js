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

  replaceAll("services", [
    { id: "svc_consult", name: "ปรึกษาแพทย์กระดูกและข้อ (Consultation)", category: "OPD", price: 800, duration: 30, active: true },
    { id: "svc_xray", name: "เอกซเรย์ (X-ray)", category: "Imaging", price: 600, duration: 15, active: true },
    { id: "svc_injection", name: "ฉีดยาเข้าข้อ (Joint Injection)", category: "Procedure", price: 2500, duration: 30, active: true },
    { id: "svc_pt", name: "กายภาพบำบัด (Physiotherapy)", category: "Rehab", price: 1200, duration: 45, active: true },
    { id: "svc_cast", name: "ใส่เฝือก (Casting)", category: "Procedure", price: 1800, duration: 40, active: true },
    { id: "svc_prp", name: "PRP Injection", category: "Procedure", price: 9000, duration: 60, active: true },
  ]);

  replaceAll("patients", [
    { id: "pat_1001", hn: "HN-1001", name: "สมชาย ใจดี", gender: "M", age: 58, phone: "081-234-5678", condition: "Knee osteoarthritis", createdAt: addDays(-120) + "T09:00:00Z" },
    { id: "pat_1002", hn: "HN-1002", name: "มาลี รักสุข", gender: "F", age: 45, phone: "089-111-2222", condition: "Frozen shoulder", createdAt: addDays(-80) + "T09:00:00Z" },
    { id: "pat_1003", hn: "HN-1003", name: "John Carter", gender: "M", age: 34, phone: "062-555-7788", condition: "ACL tear (post-op)", createdAt: addDays(-40) + "T09:00:00Z" },
    { id: "pat_1004", hn: "HN-1004", name: "ปรียา วงศ์ทอง", gender: "F", age: 67, phone: "086-777-9900", condition: "Lumbar spondylosis", createdAt: addDays(-15) + "T09:00:00Z" },
    { id: "pat_1005", hn: "HN-1005", name: "อนุชา พรหมมา", gender: "M", age: 29, phone: "095-432-1100", condition: "Ankle sprain", createdAt: addDays(-3) + "T09:00:00Z" },
  ]);

  replaceAll("appointments", [
    { id: "apt_1", patientId: "pat_1001", patientName: "สมชาย ใจดี", serviceId: "svc_consult", serviceName: "Consultation", date: addDays(0), time: "09:30", status: "confirmed", note: "Follow-up knee" },
    { id: "apt_2", patientId: "pat_1002", patientName: "มาลี รักสุข", serviceId: "svc_pt", serviceName: "Physiotherapy", date: addDays(0), time: "10:30", status: "confirmed", note: "" },
    { id: "apt_3", patientId: "pat_1005", patientName: "อนุชา พรหมมา", serviceId: "svc_xray", serviceName: "X-ray", date: addDays(0), time: "13:00", status: "checked-in", note: "Left ankle" },
    { id: "apt_4", patientId: "pat_1003", patientName: "John Carter", serviceId: "svc_pt", serviceName: "Physiotherapy", date: addDays(1), time: "11:00", status: "confirmed", note: "Rehab week 6" },
    { id: "apt_5", patientId: "pat_1004", patientName: "ปรียา วงศ์ทอง", serviceId: "svc_injection", serviceName: "Joint Injection", date: addDays(2), time: "14:00", status: "pending", note: "" },
  ]);

  replaceAll("invoices", [
    { id: "inv_1", number: "INV-2026-0001", patientId: "pat_1001", patientName: "สมชาย ใจดี", date: addDays(-1), items: [{ name: "Consultation", qty: 1, price: 800 }, { name: "X-ray", qty: 1, price: 600 }], total: 1400, status: "paid" },
    { id: "inv_2", number: "INV-2026-0002", patientId: "pat_1002", patientName: "มาลี รักสุข", date: addDays(-1), items: [{ name: "Physiotherapy", qty: 1, price: 1200 }], total: 1200, status: "paid" },
    { id: "inv_3", number: "INV-2026-0003", patientId: "pat_1004", patientName: "ปรียา วงศ์ทอง", date: addDays(0), items: [{ name: "Joint Injection", qty: 1, price: 2500 }], total: 2500, status: "unpaid" },
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
