// Reemember prototype — vanilla JS, no build step. State persists in localStorage.
const KEY = "reemember.v4";
const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (d) => Math.floor((Date.now() - new Date(d + "T00:00").getTime()) / DAY);
const fmtDate = (d) => new Date(d + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const ago = (n) => (n <= 0 ? "today" : n === 1 ? "yesterday" : n < 30 ? `${n} days ago` : n < 365 ? `${Math.round(n / 30)} mo ago` : `${Math.round(n / 365)} yr ago`);
const short = (n) => (n < 1 ? "Today" : n < 30 ? `${n}d` : n < 365 ? `${Math.round(n / 30)}mo` : `${Math.round(n / 365)}y`);

// ---- icons ----
const I = {
  people: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7.5-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 13c-3.3 0-6.5 1.7-6.5 4v1.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V17c0-2.3-3.2-4-6.5-4Zm7.5.2c-.5 0-1 0-1.5.1 1.300.9 2.100 2 2.100 3.700v1.500h4a1 1 0 0 0 1-1V17c0-1.800-2.300-3.800-5.600-3.800Z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.500 2.500 0 0 0 2.400-1.800h-4.800A2.500 2.500 0 0 0 12 22Zm7-6.500V11a7 7 0 0 0-5.200-6.800V3.500a1.800 1.800 0 0 0-3.600 0v.7A7 7 0 0 0 5 11v4.500l-1.600 1.600A.9.900 0 0 0 4 18.600h16a.9.9 0 0 0 .6-1.500L19 15.500Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/></svg>',
  chev: '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 6 6-6 6"/></svg>',
  msg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.500 3 2 6.600 2 11c0 2.300 1.200 4.300 3.200 5.800-.2 1.200-.8 2.400-1.700 3.300a.5.500 0 0 0 .4.900c2-.1 3.700-.9 4.900-1.900.9.200 1.800.3 2.700.3 5.500 0 10-3.600 10-8s-4.500-8-10-8Z"/></svg>',
  call: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.600 10.800a15 15 0 0 0 6.600 6.600l2.200-2.200a1 1 0 0 1 1-.25c1.100.4 2.300.6 3.600.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.500a1 1 0 0 1 1 1c0 1.300.2 2.500.6 3.600a1 1 0 0 1-.25 1l-2.250 2.200Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2l8 5 8-5V7H4Z"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.500-2h5L16 5"/></svg>',
};

// ---- placeholder portraits (stand-ins for real photos; swap for the contact's actual picture) ----
const BGS = [["#ffd6a5", "#ffadad"], ["#a0c4ff", "#bdb2ff"], ["#caffbf", "#9bf6ff"], ["#fdffb6", "#ffc6ff"], ["#ffc8dd", "#a2d2ff"], ["#b9fbc0", "#98f5e1"]];
const SKIN = ["#f1c9a5", "#e0ac83", "#c68863", "#8d5a3b", "#f7d7c4", "#6f4327"];
const HAIR = ["#2b1d14", "#4a2f1d", "#8b5a2b", "#c9a15a", "#1b1b1f", "#7a3b2e"];
const CLOTH = ["#1d3557", "#e63946", "#2a9d8f", "#f4a261", "#3a3a3c", "#6c63ff", "#f1f1f1"];
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function portrait(name) {
  const r = rng(hashStr(name)), pick = (a) => a[Math.floor(r() * a.length)];
  const [b1, b2] = pick(BGS), skin = pick(SKIN), hair = pick(HAIR), cloth = pick(CLOTH), style = Math.floor(r() * 3);
  const cap = `<path d="M88 182C84 118 118 104 150 104C184 104 218 118 212 182C200 150 180 138 150 138C120 138 100 150 88 182Z" fill="${hair}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient></defs>
  <rect width="300" height="400" fill="url(#g)"/>${style === 1 ? `<path d="M84 200C68 118 110 98 150 98C190 98 232 118 216 200L228 330L72 330Z" fill="${hair}"/>` : ""}
  <path d="M10 400C10 318 85 288 150 288C215 288 290 318 290 400Z" fill="${cloth}"/><rect x="127" y="238" width="46" height="62" rx="18" fill="${skin}"/>
  <ellipse cx="150" cy="190" rx="60" ry="72" fill="${skin}"/>${cap}${style === 2 ? `<circle cx="150" cy="92" r="22" fill="${hair}"/>` : ""}
  <ellipse cx="127" cy="196" rx="4.500" ry="5.500" fill="#2a2a2e"/><ellipse cx="173" cy="196" rx="4.500" ry="5.500" fill="#2a2a2e"/>
  <path d="M132 224Q150 238 168 224" stroke="#8a4b3a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// ---- card colors come FROM the person's photo: sample its top corners + bottom, then soften to bright pastels ----
function softColor([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dl = mx - mn;
  const s = dl === 0 ? 0 : dl / (1 - Math.abs(2 * l - 1));
  let h = 0; if (dl) { h = mx === r ? ((g - b) / dl + 6) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4; h *= 60; }
  return `hsl(${Math.round(h)} ${Math.round(Math.min(s, .85) * 100)}% ${Math.round((.74 + (l - .5) * .2) * 100)}%)`;
}
function paletteOf(src) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => { try {
      const w = 40, h = 56, c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
      const avg = (x0, y0, x1, y1) => { const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data; let r = 0, g = 0, b = 0; const n = d.length / 4;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } return [r / n, g / n, b / n]; };
      res([avg(0, 0, 14, 18), avg(26, 0, 40, 26), avg(0, 44, 40, 56)].map(softColor));
    } catch { res(null); } };
    img.onerror = () => res(null); img.src = src;
  });
}
const cardVars = (p) => { const [a, b, c] = p.pal || ["hsl(215 40% 90%)", "hsl(270 40% 92%)", "hsl(200 40% 94%)"]; return `--g1:${a};--g2:${b};--g3:${c}`; };

// ---- state ----
let people = load();
let ui = { tab: "people", mode: "cards", q: "", idx: 0 };
let deckList = [];

function load() {
  let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch {}
  d = d || structuredClone(SEED);
  d.forEach((p) => { if (!p.photo) p.photo = portrait(p.name); if (!p.bond) p.bond = 2; });
  return d;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(people)); } catch {} }
async function hydrate() { await Promise.all(people.map(async (p) => { if (!p.pal) p.pal = await paletteOf(p.photo); })); save(); }

// ---- derived ----
const initials = (n) => n.split(/\s+/).filter((w) => !/^(dr|mr|ms)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const first = (p) => p.name.replace(/^Dr\.\s*/, "").split(" ")[0];
const since = (p) => daysSince(p.last);
const dueIn = (p) => p.cadence - since(p);
const isDue = (p) => dueIn(p) <= 0;
const dueText = (p) => { const d = dueIn(p); return d < 0 ? `${-d}d overdue` : d === 0 ? "Today" : `in ${d}d`; };
const bondOf = (p) => p.bond || 2;
const dots = (n) => `<span class="dots" aria-label="Bond ${BOND[n]}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
const avatar = (p) => `<div class="avatar"><img src="${p.photo}" alt="" draggable="false"></div>`;

// Pokémon-proportioned (5:7) card: white frame, gradient from the photo, photo window, info panel
const cardHTML = (p, mode = "stack") => `<div class="card ${mode}" style="${cardVars(p)}" data-id="${p.id}"><div class="face"><div class="face-in">
  <div class="ctop"><span class="cname">${esc(p.name)}</span>${dots(bondOf(p))}</div>
  <div class="photo"><img src="${p.photo}" alt="" draggable="false">${mode === "stack" && isDue(p) ? `<span class="due">Follow up</span>` : ""}</div>
  <div class="cinfo"><div class="crole">${esc([p.title, p.company].filter(Boolean).join(" · ") || "—")}</div><div class="cplace">${p.place ? `${esc(p.place)} · ${short(daysSince(p.date))}` : "Just met"}</div></div>
</div></div></div>`;

// ---- screens ----
function render() {
  const due = people.filter(isDue).length;
  $("#view").innerHTML = ui.tab === "people" ? peopleView() : followView();
  $("#tabbar").innerHTML = `<button data-tab="people" class="${ui.tab === "people" ? "on" : ""}">${I.people}<span>People</span></button>
    <button class="plus" data-add aria-label="Add person">${I.plus}</button>
    <button data-tab="follow" class="${ui.tab === "follow" ? "on" : ""}">${I.bell}<span>Follow up</span>${due ? `<i class="badge">${due}</i>` : ""}</button>`;
  const q = $("#q"); if (q) q.oninput = onSearch;
  if ($("#deck")) { layoutDeck(); setupDeck(); }
}

function personRow(p, detail) {
  return `<button class="row person" data-open="${p.id}">${avatar(p)}
    <div class="grow"><div class="name">${esc(p.name)}</div><div class="sub">${detail}</div></div><div class="trail">${I.chev}</div></button>`;
}

function peopleView() {
  const q = ui.q.trim().toLowerCase();
  const list = people.filter((p) => !q || [p.name, p.company, p.title, p.place, p.event, p.notes, ...(p.tags || [])].join(" ").toLowerCase().includes(q));
  let body;
  if (!people.length) body = `<div class="empty"><b>No one yet</b>Tap + to scan your first person.</div>`;
  else if (!list.length) body = `<div class="empty"><b>No results</b>Nothing matches “${esc(ui.q)}”.</div>`;
  else if (ui.mode === "places") {
    const g = {}; [...list].sort((a, b) => b.date.localeCompare(a.date)).forEach((p) => (g[p.place] ||= []).push(p));
    body = Object.entries(g).map(([place, ps]) =>
      `<div class="section"><h4>${esc(place)}</h4><div class="group">${ps.map((p) => personRow(p, `${esc(p.event)} · ${ago(daysSince(p.date))}`)).join("")}</div></div>`).join("");
  } else {
    deckList = [...list].sort((a, b) => b.date.localeCompare(a.date)); ui.idx = Math.min(ui.idx, deckList.length - 1);
    body = `<div class="deck" id="deck">${deckList.map((p) => cardHTML(p, "stack")).join("")}</div><div id="deckinfo"></div>`;
  }
  return `<div class="head"><h1>People</h1></div>
    <div class="search">${I.search}<input id="q" type="search" placeholder="Search" value="${esc(ui.q)}" /></div>
    <div class="seg"><button data-mode="cards" class="${ui.mode === "cards" ? "on" : ""}">Cards</button><button data-mode="places" class="${ui.mode === "places" ? "on" : ""}">Places</button></div>
    ${body}`;
}
function onSearch(e) { ui.q = e.target.value; const pos = e.target.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); }

function followView() {
  const sorted = [...people].sort((a, b) => dueIn(a) - dueIn(b));
  const due = sorted.filter(isDue), later = sorted.filter((p) => !isDue(p));
  const row = (p) => `<button class="row person" data-open="${p.id}">${avatar(p)}
    <div class="grow"><div class="name">${esc(p.name)}</div><div class="sub">${esc(p.place)} · spoke ${ago(since(p))}</div></div>
    ${isDue(p) ? `<span class="pill" data-draft="${p.id}">Reach out</span>` : `<div class="trail">${dueText(p)}</div>`}</button>`;
  return `<div class="head"><h1>Follow up</h1></div>
    <p class="lede">${due.length ? `${due.length} ${due.length === 1 ? "person is" : "people are"} waiting to hear from you.` : "You’re all caught up."}</p>
    ${due.length ? `<div class="section"><div class="group">${due.map(row).join("")}</div></div>` : ""}
    ${later.length ? `<div class="section"><h4>Later</h4><div class="group">${later.map(row).join("")}</div></div>` : ""}`;
}

// ---- circular card deck: front card large + hovering, the rest fanned behind on an arc ----
function layoutDeck() {
  const cards = [...$("#deck").children], n = cards.length, half = Math.floor(n / 2);
  cards.forEach((c, i) => {
    const d = ((i - ui.idx) % n + n + half) % n - half, k = Math.abs(d);
    c.dataset.d = d;
    c.style.setProperty("--x", d * 44 + "px"); c.style.setProperty("--y", k * k * 7 + "px");
    c.style.setProperty("--r", d * 7 + "deg"); c.style.setProperty("--s", 1 - Math.min(k, 3) * .09);
    c.style.zIndex = 20 - k; c.style.opacity = k > 3 ? 0 : 1; c.style.filter = `brightness(${1 - Math.min(k, 3) * .05})`;
    c.style.pointerEvents = k > 3 ? "none" : "auto";
  });
  const p = deckList[ui.idx];
  $("#deckinfo").innerHTML = `<div class="group stats"><div><b>${BOND[bondOf(p)]}</b><span>Bond</span></div><div><b>${short(since(p))}</b><span>Last spoke</span></div><div><b>${(p.log || []).length}</b><span>Touches</span></div></div>
    <p class="hint">${ui.idx + 1} of ${deckList.length} · swipe to browse, tap to open</p>`;
}
const goDeck = (k) => { const n = deckList.length; ui.idx = (ui.idx + k + n * 4) % n; layoutDeck(); };
function setupDeck() {
  const deck = $("#deck"); let sx = 0, dx = 0, down = null, moved = false;
  const front = () => deck.querySelector('[data-d="0"]');
  deck.onpointerdown = (e) => { down = e.target.closest(".card"); sx = e.clientX; dx = 0; moved = false; deck.setPointerCapture(e.pointerId); };
  deck.onpointermove = (e) => { if (!down) return; dx = e.clientX - sx; if (Math.abs(dx) > 6) moved = true;
    if (moved) { const f = front(); f.classList.add("drag"); f.style.setProperty("--dx", dx + "px"); f.style.setProperty("--dr", dx / 22 + "deg"); } };
  deck.onpointerup = deck.onpointercancel = () => {
    if (!down) return; const f = front(); f.classList.remove("drag"); f.style.setProperty("--dx", "0px"); f.style.setProperty("--dr", "0deg");
    if (moved) { if (dx < -50) goDeck(1); else if (dx > 50) goDeck(-1); }
    else { const d = +down.dataset.d; d === 0 ? openDetail(down.dataset.id) : goDeck(d); }
    down = null;
  };
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (!$("#add").hidden) closeAdd(); else if (!$("#sheet").hidden) closeSheet(); return; }
  if ($("#deck") && $("#sheet").hidden && $("#add").hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) goDeck(e.key === "ArrowRight" ? 1 : -1);
});

// ---- detail / draft sheets ----
function openSheet(html) { const s = $("#sheet"); s.innerHTML = html; s.scrollTop = 0; s.hidden = $("#backdrop").hidden = false; }
function closeSheet() { $("#sheet").hidden = $("#backdrop").hidden = true; render(); }

const CADENCE = [[7, "Every week"], [14, "Every 2 weeks"], [30, "Every month"], [60, "Every 2 months"], [90, "Every 3 months"]];
const cadenceSelect = (v, id = "cad") => `<select class="plain" id="${id}">${CADENCE.map(([d, l]) => `<option value="${d}" ${d === v ? "selected" : ""}>${l}</option>`).join("")}</select>`;
const bondSelect = (v, id = "bond") => `<select class="plain" id="${id}">${BOND.map((l, i) => (i ? `<option value="${i}" ${i === v ? "selected" : ""}>${l}</option>` : "")).join("")}</select>`;

function openDetail(id) {
  const p = people.find((x) => x.id === id); if (!p) return;
  const s = p.socials || {}, links = Object.entries(s).filter(([, v]) => v);
  const act = (icon, label, href, data = "") => `<${href ? `a href="${esc(href)}" target="_blank" rel="noopener"` : `button ${data}`} class="act ${href || data ? "" : "off"}">${icon}<span>${label}</span></${href ? "a" : "button"}>`;
  openSheet(`<div class="bar"><span style="min-width:60px"></span><span></span><button data-close>Done</button></div>
  <div class="body">
    ${cardHTML(p, "big")}
    <div class="group stats">
      <div><b>${BOND[bondOf(p)]}</b><span>Bond</span></div><div><b>${short(since(p))}</b><span>Last spoke</span></div><div><b>${(p.log || []).length}</b><span>Touches</span></div>
    </div>
    <div class="actions">
      ${act(I.msg, "Message", "", `data-draft="${p.id}"`)}${s.phone ? act(I.call, "Call", "tel:" + s.phone) : act(I.call, "Call", "")}${s.email ? act(I.mail, "Email", "mailto:" + s.email) : act(I.mail, "Email", "")}
    </div>
    <div class="section"><div class="group">
      <div class="row kv"><span>Met at</span><span>${esc(p.place)}</span></div>
      <div class="row kv"><span>Context</span><span>${esc(p.event)}</span></div>
      <div class="row kv"><span>When</span><span>${fmtDate(p.date)}</span></div>
      <div class="row kv"><span style="color:var(--text)">Bond</span>${bondSelect(bondOf(p))}</div>
    </div></div>
    <div class="section"><h4>Remember</h4><div class="group"><div class="row"><textarea class="plain" id="notes" rows="3" placeholder="Add a note">${esc(p.notes)}</textarea></div></div></div>
    ${links.length ? `<div class="section"><h4>Links</h4><div class="group">${links.map(([k, v]) => { const m = SOCIAL_META[k];
      return `<a class="row kv" href="${esc(m.url(v))}" target="_blank" rel="noopener"><span style="color:var(--text)">${m.label}</span><span class="blue">${m.prefix}${esc(v)}</span></a>`; }).join("")}</div></div>` : ""}
    <div class="section"><div class="group">
      <div class="row kv"><span style="color:var(--text)">Remind me</span>${cadenceSelect(p.cadence)}</div>
      <button class="row blue" data-touch="${p.id}">Mark as contacted</button>
    </div><p class="lede" style="margin-top:6px">Last spoke ${ago(since(p))}.</p></div>
    <div class="section"><div class="group"><button class="row red center" data-del="${p.id}">Delete</button></div></div>
  </div>`);
  $("#notes").onblur = (e) => { p.notes = e.target.value.trim(); save(); };
  $("#cad").onchange = (e) => { p.cadence = +e.target.value; save(); toast("Reminder updated"); };
  $("#bond").onchange = (e) => { p.bond = +e.target.value; save(); openDetail(id); };
  tilt($(".card.big"));
}

function suggestion(p) {
  if ((p.log || []).length <= 1) {
    const hook = (p.notes || "").split(/(?<=\.)\s/)[0].replace(/\.$/, "");
    return `Hey ${first(p)}, great meeting you at ${p.event}.${hook ? ` I keep thinking about what you said — ${hook.charAt(0).toLowerCase() + hook.slice(1)}.` : ""} Let’s stay in touch!`;
  }
  return `Hey ${first(p)}, it’s been a while — how are things at ${p.company}? Would love to catch up soon.`;
}
function openDraft(id) {
  const p = people.find((x) => x.id === id), s = p.socials || {};
  const chan = s.phone ? ["phone", "Messages"] : s.instagram ? ["instagram", "Instagram"] : s.linkedin ? ["linkedin", "LinkedIn"] : s.email ? ["email", "Mail"] : s.x ? ["x", "X"] : null;
  openSheet(`<div class="bar"><button data-close>Cancel</button><b>Message</b><span style="min-width:60px"></span></div>
  <div class="body">
    <div class="hero" style="padding-bottom:14px"><h2 style="font-size:22px">${esc(p.name)}</h2><p>Met at ${esc(p.place)} · ${ago(daysSince(p.date))}</p></div>
    <textarea class="draft" id="dtext">${esc(suggestion(p))}</textarea>
    <button class="primary" id="send">${chan ? `Copy & open ${chan[1]}` : "Copy message"}</button>
    <button class="plainbtn" data-touch="${p.id}">Mark as contacted</button>
  </div>`);
  $("#send").onclick = () => { navigator.clipboard?.writeText($("#dtext").value).catch(() => {}); toast("Copied"); if (chan) window.open(SOCIAL_META[chan[0]].url(s[chan[0]]), "_blank"); };
}

// ---- Add: opens straight into the camera; swipe right for the manual page ----
let addPage = "scan", stream = null, cand = null, scanBusy = false, scanN = 0, photoData = null;

function openAdd() {
  const f = (id, label, ph = "") => `<label class="row"><span class="label">${label}</span><input class="field" id="${id}" placeholder="${ph}" autocomplete="off" /></label>`;
  photoData = null; cand = null;
  const a = $("#add"); a.hidden = false;
  a.innerHTML = `<div class="addbar"><button class="x" data-addclose aria-label="Close">${I.close}</button>
      <div class="seg2"><button data-page="manual">Manual</button><button data-page="scan">Scan</button></div>
      <button class="savebtn" id="save">Add</button></div>
    <div class="track" id="track">
      <div class="pane form">
        <div class="section"><div class="group"><label class="row photorow" for="f-photo"><span class="thumb" id="thumb">${I.photo}</span><span class="blue">Add photo</span></label><input type="file" id="f-photo" accept="image/*" hidden /></div></div>
        <div class="section"><div class="group">${f("f-name", "Name", "Required")}${f("f-title", "Title")}${f("f-company", "Company")}</div></div>
        <div class="section"><h4>Where you met</h4><div class="group">${f("f-place", "Place", "e.g. Coffee, Mill Ave")}${f("f-event", "Context", "e.g. Intro by Sam")}</div></div>
        <div class="section"><h4>Remember</h4><div class="group"><div class="row"><textarea class="plain" id="f-notes" rows="3" placeholder="What should future-you remember?"></textarea></div></div></div>
        <div class="section"><h4>Links</h4><div class="group">${f("s-instagram", "Instagram", "@handle")}${f("s-linkedin", "LinkedIn", "handle")}${f("s-email", "Email")}${f("s-phone", "Phone")}</div></div>
        <div class="section"><div class="group"><div class="row kv"><span style="color:var(--text)">Bond</span>${bondSelect(2, "f-bond")}</div>
          <div class="row kv"><span style="color:var(--text)">Remind me</span>${cadenceSelect(30, "f-cad")}</div></div></div>
      </div>
      <div class="pane cam" id="campane">
        <video id="cam" autoplay playsinline muted></video><div class="camfake" id="camfake">Camera preview<small>Allow camera access to scan for real.<br>Demo scan still works.</small></div>
        <div class="platforms"><span>Instagram</span><span>LinkedIn</span><span>Business card</span></div>
        <div class="guide"></div><div class="scanlabel" id="scanlabel" hidden>Reading profile…</div>
        <button class="shutter" id="shutter" aria-label="Scan"></button>
        <div class="swipehint">Swipe right to type it in ›</div>
        <div class="result" id="result" hidden></div>
      </div>
    </div>`;
  $("#save").onclick = saveManual;
  $("#f-photo").onchange = async (e) => { const f0 = e.target.files[0]; if (!f0) return; photoData = await fileToPhoto(f0); $("#thumb").innerHTML = `<img src="${photoData}" alt="">`; };
  $("#shutter").onclick = shutter;
  setupAddSwipe(); setPage("scan");
}
function setPage(pg) {
  addPage = pg; const a = $("#add"), t = $("#track");
  a.className = "add " + (pg === "scan" ? "cam" : "manual"); t.className = "track " + (pg === "manual" ? "manual" : ""); t.style.transform = "";
  $$$("[data-page]").forEach((b) => b.classList.toggle("on", b.dataset.page === pg));
  $("#save").style.visibility = pg === "manual" ? "visible" : "hidden";
  pg === "scan" ? startCamera() : stopCamera();
}
const $$$ = (s) => [...document.querySelectorAll(s)];
async function startCamera() {
  if (stream) return; const v = $("#cam"), fake = $("#camfake");
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); v.srcObject = stream; v.style.display = "block"; fake.style.display = "none"; }
  catch { v.style.display = "none"; fake.style.display = "grid"; }
}
function stopCamera() { stream?.getTracks().forEach((t) => t.stop()); stream = null; }
function closeAdd() { stopCamera(); $("#add").hidden = true; $("#add").innerHTML = ""; render(); }

function setupAddSwipe() {
  const t = $("#track"); let sx = 0, sy = 0, dx = 0, on = false, live = false;
  t.onpointerdown = (e) => { if (e.target.closest("input,textarea,select,button,label,.result")) return; on = true; live = false; sx = e.clientX; sy = e.clientY; dx = 0; };
  t.onpointermove = (e) => {
    if (!on) return; dx = e.clientX - sx; const dy = e.clientY - sy;
    if (!live && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { live = true; t.classList.add("dragging"); t.setPointerCapture(e.pointerId); }
    if (live) { const w = t.parentElement.clientWidth; const base = addPage === "scan" ? -w : 0; t.style.transform = `translateX(${Math.max(-w, Math.min(0, base + dx))}px)`; }
  };
  t.onpointerup = t.onpointercancel = () => {
    if (!on) return; on = false; t.classList.remove("dragging"); t.style.transform = "";
    if (live) { if (addPage === "scan" && dx > 70) setPage("manual"); else if (addPage === "manual" && dx < -70) setPage("scan"); }
  };
}

async function shutter() {
  if (scanBusy) return; scanBusy = true;
  $("#campane").classList.add("scanning"); $("#scanlabel").hidden = false;
  await sleep(1500);
  const s = SCAN_SAMPLES[scanN++ % SCAN_SAMPLES.length], photo = portrait(s.name);
  cand = { id: "p" + Date.now(), name: s.name, title: s.title, company: s.company, socials: { ...s.socials }, photo, pal: await paletteOf(photo),
    place: "", event: "—", notes: "", tags: [], bond: 2, cadence: 30, date: today(), last: today(), log: [{ d: today(), t: "Met." }], _src: s.platform };
  $("#campane").classList.remove("scanning"); $("#scanlabel").hidden = true; scanBusy = false;
  showResult();
}
function showResult() {
  const recent = [...new Set(people.map((p) => p.place))].slice(0, 3);
  const r = $("#result"); r.hidden = false;
  r.innerHTML = `<div class="found">${cand._src === "Business card" ? "Business card" : cand._src + " profile"} found</div>
    ${cardHTML(cand, "big")}
    <div class="wherebox"><input id="r-place" placeholder="Where did you meet?" autocomplete="off" />
      <div class="chips">${recent.map((pl) => `<button class="chip" data-place="${esc(pl)}">${esc(pl)}</button>`).join("")}</div></div>
    <button class="primary" id="r-add">Add to deck</button><button class="plainbtn light" id="r-retake">Retake</button>`;
  tilt($(".card.big", r));
  $("#r-retake").onclick = () => { r.hidden = true; cand = null; };
  $("#r-add").onclick = () => { cand.place = $("#r-place").value.trim() || "Somewhere"; commit(cand); };
}
function saveManual() {
  const g = (id) => $("#" + id).value.trim();
  if (!g("f-name")) return toast("Add a name first");
  const socials = {}; ["instagram", "linkedin", "email", "phone"].forEach((k) => g("s-" + k) && (socials[k] = g("s-" + k).replace(/^@/, "")));
  const photo = photoData || portrait(g("f-name"));
  paletteOf(photo).then((pal) => commit({ id: "p" + Date.now(), name: g("f-name"), title: g("f-title"), company: g("f-company"), place: g("f-place") || "Somewhere", event: g("f-event") || "—",
    notes: g("f-notes"), tags: [], socials, photo, pal, bond: +$("#f-bond").value, cadence: +$("#f-cad").value, date: today(), last: today(), log: [{ d: today(), t: "Met." }] }));
}
function commit(p) {
  delete p._src; people.unshift(p); save(); ui.tab = "people"; ui.mode = "cards"; ui.q = ""; ui.idx = 0;
  closeAdd(); toast("Added to your deck");
}
async function fileToPhoto(file) {
  const url = URL.createObjectURL(file), img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const w = 400, h = 560, c = document.createElement("canvas"); c.width = w; c.height = h;
  const k = Math.max(w / img.width, h / img.height); c.getContext("2d").drawImage(img, (w - img.width * k) / 2, (h - img.height * k) / 2, img.width * k, img.height * k);
  return c.toDataURL("image/jpeg", .82);
}

// subtle depth on big cards
function tilt(c) {
  if (!c) return;
  c.onpointermove = (e) => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty("--ry", x * 10 + "deg"); c.style.setProperty("--rx", -y * 10 + "deg"); c.style.setProperty("--mx", (x + .5) * 100 + "%"); c.style.setProperty("--my", (y + .5) * 100 + "%"); };
  c.onpointerleave = () => { c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); };
}

// ---- actions ----
function touch(id) {
  const p = people.find((x) => x.id === id);
  p.last = today(); (p.log ||= []).unshift({ d: today(), t: "Followed up." }); save();
  closeSheet(); toast(`Marked ${first(p)} as contacted`);
}
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1600); }

document.addEventListener("click", (e) => {
  const t = (s) => e.target.closest(s);
  if (t("[data-place]")) { $("#r-place").value = t("[data-place]").dataset.place; return; }
  if (t("[data-addclose]")) return closeAdd();
  if (t("[data-page]")) return setPage(t("[data-page]").dataset.page);
  if (t("[data-add]")) return openAdd();
  if (t("[data-draft]")) { e.stopPropagation(); return openDraft(t("[data-draft]").dataset.draft); }
  if (t("[data-tab]")) { ui.tab = t("[data-tab]").dataset.tab; render(); $("#view").scrollTop = 0; return; }
  if (t("[data-mode]")) { ui.mode = t("[data-mode]").dataset.mode; return render(); }
  if (t("[data-close]") || e.target.id === "backdrop") return closeSheet();
  if (t("[data-touch]")) return touch(t("[data-touch]").dataset.touch);
  if (t("[data-del]")) { if (confirm("Delete this person?")) { people = people.filter((p) => p.id !== t("[data-del]").dataset.del); save(); closeSheet(); } return; }
  if (t("[data-open]")) return openDetail(t("[data-open]").dataset.open);
});

hydrate().finally(render);
