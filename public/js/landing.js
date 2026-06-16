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
