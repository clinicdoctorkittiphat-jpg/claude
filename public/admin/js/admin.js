// ===== Dr. Kittiphat ERP — admin SPA (vanilla JS) =====
const TOKEN_KEY = "drk_token";
let TOKEN = localStorage.getItem(TOKEN_KEY) || null;
let USER = JSON.parse(localStorage.getItem("drk_user") || "null");

const $ = (s, r = document) => r.querySelector(s);
const baht = (n) => "฿" + Number(n || 0).toLocaleString();
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function api(path, opts = {}) {
  const res = await fetch("/api" + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: "Bearer " + TOKEN } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) { logout(); throw new Error("Unauthorized"); }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.status === 204 ? null : res.json();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), 2400);
}

// ===== Status badge helper =====
const STATUS_TAG = {
  confirmed: "blue", "checked-in": "green", pending: "amber", cancelled: "red", completed: "green",
  paid: "green", unpaid: "amber", overdue: "red",
};
const tag = (v) => `<span class="tag tag--${STATUS_TAG[v] || "gray"}">${esc(v)}</span>`;

// ===== Schema: drives tables + forms =====
const SCHEMA = {
  appointments: {
    title: "คิว / ผู้ป่วยเข้าตรวจ (Walk-in Visits)",
    columns: [
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "patientName", label: "Patient" },
      { key: "serviceName", label: "Service" },
      { key: "status", label: "Status", render: (v) => tag(v) },
      { key: "note", label: "Note" },
    ],
    fields: [
      { key: "patientName", label: "Patient name", required: true },
      { key: "phone", label: "Phone" },
      { key: "serviceName", label: "Service" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "status", label: "Status", type: "select", options: ["pending", "confirmed", "checked-in", "completed", "cancelled"] },
      { key: "note", label: "Note", type: "textarea" },
    ],
  },
  patients: {
    title: "ผู้ป่วย (Patients)",
    columns: [
      { key: "hn", label: "HN" },
      { key: "name", label: "Name" },
      { key: "gender", label: "Sex" },
      { key: "age", label: "Age" },
      { key: "phone", label: "Phone" },
      { key: "condition", label: "Condition" },
    ],
    fields: [
      { key: "hn", label: "HN (Hospital No.)" },
      { key: "name", label: "Full name", required: true },
      { key: "gender", label: "Gender", type: "select", options: ["M", "F"] },
      { key: "age", label: "Age", type: "number" },
      { key: "phone", label: "Phone" },
      { key: "condition", label: "Condition / Diagnosis" },
    ],
  },
  services: {
    title: "บริการ (Services)",
    columns: [
      { key: "name", label: "Service" },
      { key: "category", label: "Category" },
      { key: "active", label: "Active", render: (v) => (v ? tag("active") : tag("off")) },
    ],
    fields: [
      { key: "name", label: "Service name", required: true },
      { key: "category", label: "Category", type: "select", options: ["OPD", "Imaging", "Procedure", "Rehab", "Other"] },
      { key: "active", label: "Active", type: "checkbox" },
    ],
  },
  invoices: {
    title: "ใบเสร็จ / บิล (Invoices)",
    columns: [
      { key: "number", label: "No." },
      { key: "date", label: "Date" },
      { key: "patientName", label: "Patient" },
      { key: "total", label: "Total", render: (v) => baht(v) },
      { key: "status", label: "Status", render: (v) => tag(v) },
    ],
    fields: [
      { key: "number", label: "Invoice No." },
      { key: "patientName", label: "Patient name", required: true },
      { key: "date", label: "Date", type: "date" },
      { key: "total", label: "Total (฿)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["unpaid", "paid", "overdue"] },
    ],
  },
  inventory: {
    title: "คลังยา / เวชภัณฑ์ (Inventory)",
    columns: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Item" },
      { key: "category", label: "Category" },
      { key: "stock", label: "Stock", render: (v, r) => v + " " + (r.unit || "") + (v <= r.reorderLevel ? ` <span class="tag tag--red">low</span>` : "") },
      { key: "reorderLevel", label: "Reorder" },
    ],
    fields: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Item name", required: true },
      { key: "category", label: "Category", type: "select", options: ["Medicine", "Supply", "Equipment"] },
      { key: "stock", label: "Stock", type: "number" },
      { key: "unit", label: "Unit", },
      { key: "reorderLevel", label: "Reorder level", type: "number" },
    ],
  },
};

// ===== Views =====
const view = $("#view");
let currentView = "dashboard";
let cache = []; // current collection rows

async function renderDashboard() {
  view.innerHTML = `<div class="empty">Loading…</div>`;
  const s = await api("/dashboard/stats");
  view.innerHTML = `
    <div class="stats">
      <div class="stat stat--accent"><div class="stat__label">ผู้ป่วยวันนี้</div><div class="stat__value">${s.appointmentsToday}</div></div>
      <div class="stat"><div class="stat__label">ผู้ป่วยทั้งหมด</div><div class="stat__value">${s.patients}</div></div>
      <div class="stat"><div class="stat__label">รอตรวจ</div><div class="stat__value">${s.pendingAppointments}</div></div>
      <div class="stat stat--warn"><div class="stat__label">สต็อกใกล้หมด</div><div class="stat__value">${s.lowStock}</div></div>
    </div>
    <div class="grid2">
      <div class="panel">
        <div class="panel__head"><h3>คิว / ผู้ป่วยที่กำลังจะมา</h3><a class="btn btn--ghost btn--sm" data-go="appointments">ดูทั้งหมด →</a></div>
        <table><thead><tr><th>วันที่</th><th>เวลา</th><th>ผู้ป่วย</th><th>บริการ</th><th>สถานะ</th></tr></thead>
        <tbody>${s.upcoming.length ? s.upcoming.map((a) => `<tr><td>${esc(a.date)}</td><td>${esc(a.time || "-")}</td><td>${esc(a.patientName)}</td><td>${esc(a.serviceName || "-")}</td><td>${tag(a.status)}</td></tr>`).join("") : `<tr><td colspan="5" class="empty">ไม่มีคิว</td></tr>`}</tbody></table>
      </div>
      <div class="panel">
        <div class="panel__head"><h3>สรุปคลินิก</h3></div>
        <table><tbody>
          <tr><td>ผู้ป่วยทั้งหมด</td><td style="text-align:right"><b>${s.patients}</b></td></tr>
          <tr><td>ผู้ป่วยวันนี้</td><td style="text-align:right">${s.appointmentsToday}</td></tr>
          <tr><td>รอตรวจ</td><td style="text-align:right">${s.pendingAppointments}</td></tr>
          <tr><td>รายการสต็อกใกล้หมด</td><td style="text-align:right">${s.lowStock ? tag("low") + " " : ""}${s.lowStock}</td></tr>
        </tbody></table>
      </div>
    </div>`;
  view.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => navigate(el.dataset.go)));
}

async function renderCollection(name) {
  const sc = SCHEMA[name];
  view.innerHTML = `<div class="empty">Loading…</div>`;
  cache = await api("/" + name);
  view.innerHTML = `
    <div class="toolbar">
      <input type="search" id="search" placeholder="ค้นหา..." />
      <button class="btn btn--primary" id="addBtn">+ เพิ่มรายการ</button>
    </div>
    <div class="panel"><div id="tableWrap"></div></div>`;
  $("#addBtn").addEventListener("click", () => openModal(name, null));
  $("#search").addEventListener("input", (e) => drawTable(name, e.target.value));
  drawTable(name, "");
}

function drawTable(name, q) {
  const sc = SCHEMA[name];
  const rows = !q
    ? cache
    : cache.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const head = sc.columns.map((c) => `<th>${c.label}</th>`).join("") + "<th></th>";
  const body = rows.length
    ? rows
        .map((r) => {
          const tds = sc.columns
            .map((c) => `<td>${c.render ? c.render(r[c.key], r) : esc(r[c.key] ?? "-")}</td>`)
            .join("");
          return `<tr>${tds}<td><div class="row-actions">
            <button class="btn btn--ghost btn--sm" data-edit="${r.id}">แก้ไข</button>
            <button class="btn btn--danger btn--sm" data-del="${r.id}">ลบ</button>
          </div></td></tr>`;
        })
        .join("")
    : `<tr><td colspan="${sc.columns.length + 1}" class="empty">ไม่มีข้อมูล</td></tr>`;
  $("#tableWrap").innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  $("#tableWrap").querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => openModal(name, cache.find((r) => r.id === b.dataset.edit)))
  );
  $("#tableWrap").querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => del(name, b.dataset.del))
  );
}

// ===== Modal form =====
function openModal(name, row) {
  const sc = SCHEMA[name];
  $("#modalTitle").textContent = (row ? "แก้ไข" : "เพิ่ม") + " · " + sc.title;
  const f = $("#modalForm");
  f.innerHTML =
    sc.fields
      .map((fl) => {
        const val = row?.[fl.key] ?? "";
        if (fl.type === "select")
          return `<div class="field"><label>${fl.label}</label><select name="${fl.key}">${fl.options
            .map((o) => `<option ${val === o ? "selected" : ""}>${o}</option>`)
            .join("")}</select></div>`;
        if (fl.type === "textarea")
          return `<div class="field"><label>${fl.label}</label><textarea name="${fl.key}" rows="2">${esc(val)}</textarea></div>`;
        if (fl.type === "checkbox")
          return `<div class="field"><label><input type="checkbox" name="${fl.key}" ${val ? "checked" : ""}/> ${fl.label}</label></div>`;
        return `<div class="field"><label>${fl.label}${fl.required ? " *" : ""}</label><input name="${fl.key}" type="${fl.type || "text"}" value="${esc(val)}" ${fl.required ? "required" : ""}/></div>`;
      })
      .join("") +
    `<div class="modal__actions"><button type="button" class="btn btn--ghost" id="cancelBtn">ยกเลิก</button><button type="submit" class="btn btn--primary">บันทึก</button></div>`;
  $("#cancelBtn").addEventListener("click", closeModal);
  f.onsubmit = async (e) => {
    e.preventDefault();
    const data = {};
    sc.fields.forEach((fl) => {
      const el = f.elements[fl.key];
      if (fl.type === "checkbox") data[fl.key] = el.checked;
      else if (fl.type === "number") data[fl.key] = el.value === "" ? null : Number(el.value);
      else data[fl.key] = el.value;
    });
    try {
      if (row) await api(`/${name}/${row.id}`, { method: "PUT", body: JSON.stringify(data) });
      else await api(`/${name}`, { method: "POST", body: JSON.stringify(data) });
      closeModal();
      toast("บันทึกแล้ว");
      renderCollection(name);
    } catch (err) { toast("ผิดพลาด: " + err.message); }
  };
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modalClose").addEventListener("click", closeModal);

async function del(name, id) {
  if (!confirm("ลบรายการนี้?")) return;
  try {
    await api(`/${name}/${id}`, { method: "DELETE" });
    toast("ลบแล้ว");
    renderCollection(name);
  } catch (err) { toast("ผิดพลาด: " + err.message); }
}

// ===== Navigation =====
function navigate(v) {
  currentView = v;
  $("#menu").querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.dataset.view === v));
  $("#viewTitle").textContent = v === "dashboard" ? "Dashboard" : SCHEMA[v].title;
  if (v === "dashboard") renderDashboard();
  else renderCollection(v);
}
$("#menu").querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navigate(a.dataset.view))
);

// ===== Auth =====
function showApp() {
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#userBadge").textContent = `${USER?.name || ""} · ${USER?.role || ""}`;
  navigate("dashboard");
}
function logout() {
  TOKEN = null; USER = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("drk_user");
  $("#app").classList.add("hidden");
  $("#login").classList.remove("hidden");
}
$("#logoutBtn").addEventListener("click", () => { api("/auth/logout", { method: "POST" }).catch(() => {}); logout(); });

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const r = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
    });
    TOKEN = r.token; USER = r.user;
    localStorage.setItem(TOKEN_KEY, TOKEN);
    localStorage.setItem("drk_user", JSON.stringify(USER));
    showApp();
  } catch (err) { $("#loginErr").textContent = "เข้าสู่ระบบไม่สำเร็จ"; }
});

// Boot: validate existing token by hitting a protected endpoint.
if (TOKEN) api("/dashboard/stats").then(showApp).catch(logout);
