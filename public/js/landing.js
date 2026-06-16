// Pull live services from the ERP (public read via login-free fallback list).
const FALLBACK = [
  { name: "ปรึกษาแพทย์กระดูกและข้อ", category: "OPD", price: 800, duration: 30 },
  { name: "เอกซเรย์ (X-ray)", category: "Imaging", price: 600, duration: 15 },
  { name: "ฉีดยาเข้าข้อ (Joint Injection)", category: "Procedure", price: 2500, duration: 30 },
  { name: "กายภาพบำบัด (Physiotherapy)", category: "Rehab", price: 1200, duration: 45 },
  { name: "ใส่เฝือก (Casting)", category: "Procedure", price: 1800, duration: 40 },
  { name: "PRP Injection", category: "Procedure", price: 9000, duration: 60 },
];

function renderServices(items) {
  const grid = document.getElementById("serviceGrid");
  grid.innerHTML = items
    .map(
      (s) => `
    <article class="svc">
      <div class="svc__cat">${s.category}</div>
      <h3>${s.name}</h3>
      <div class="svc__price">฿${Number(s.price).toLocaleString()} <span>· ${s.duration} นาที</span></div>
    </article>`
    )
    .join("");
}
renderServices(FALLBACK);

// Booking form -> public appointment endpoint
const form = document.getElementById("bookingForm");
const msg = document.getElementById("bookingMsg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  msg.className = "form__msg";
  msg.textContent = "กำลังส่ง...";
  try {
    const res = await fetch("/api/public/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error();
    msg.className = "form__msg ok";
    msg.textContent = "✓ ส่งคำขอเรียบร้อย ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมาย";
    form.reset();
  } catch {
    msg.className = "form__msg err";
    msg.textContent = "เกิดข้อผิดพลาด กรุณาลองใหม่ หรือโทร 02-123-4567";
  }
});
