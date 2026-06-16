// Conditions the clinic treats (from clinicdoctorkittiphat.com).
const SERVICES = [
  { icon: "🦵", category: "เข่า", name: "ปวดเข่า / ข้อเข่าเสื่อม", desc: "ประเมินและดูแลอาการปวดเข่าและข้อเข่าเสื่อมแบบไม่ผ่าตัด" },
  { icon: "🧍", category: "หลัง", name: "ปวดหลัง / ปวดร้าวลงขา", desc: "ตรวจหาสาเหตุอาการปวดหลังและปวดร้าวลงขา" },
  { icon: "💆", category: "คอ บ่า ไหล่", name: "ปวดคอ บ่า ไหล่ แขน", desc: "ดูแลอาการปวดคอ บ่า ไหล่ และปวดร้าวลงแขน" },
  { icon: "✋", category: "มือ", name: "มือชา / นิ้วล็อก", desc: "รักษาภาวะมือชาและนิ้วล็อก" },
  { icon: "🏃", category: "บาดเจ็บ", name: "บาดเจ็บจากงาน / กีฬา", desc: "ประเมินและฟื้นฟูการบาดเจ็บจากการทำงานและกีฬา" },
  { icon: "🩻", category: "ตรวจ", name: "เอกซเรย์ดิจิทัล (X-ray)", desc: "เอกซเรย์ดิจิทัลในคลินิกเพื่อวินิจฉัยที่แม่นยำ" },
];

function renderServices(items) {
  const grid = document.getElementById("serviceGrid");
  grid.innerHTML = items
    .map(
      (s) => `
    <article class="svc">
      <div class="svc__cat">${s.icon} ${s.category}</div>
      <h3>${s.name}</h3>
      <p class="svc__price"><span>${s.desc}</span></p>
    </article>`
    )
    .join("");
}
renderServices(SERVICES);

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
