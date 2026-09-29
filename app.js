// Reemember prototype — vanilla JS, no build step. State persists in localStorage.
const KEY = "reemember.v3";
const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (d) => Math.floor((Date.now() - new Date(d + "T00:00").getTime()) / DAY);
const fmtDate = (d) => new Date(d + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const ago = (n) => (n <= 0 ? "today" : n === 1 ? "yesterday" : n < 30 ? `${n} days ago` : n < 365 ? `${Math.round(n / 30)} mo ago` : `${Math.round(n / 365)} yr ago`);

// ---- icons (simple stroke set) ----
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
};

let people = load();
let ui = { tab: "people", mode: "cards", q: "", idx: 0 };
let deckList = [];

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(SEED); } catch { return structuredClone(SEED); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(people)); } catch {} }

// ---- derived ----
const initials = (n) => n.split(/\s+/).filter((w) => !/^(dr|mr|ms)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const HUES = [212, 232, 258, 282, 312, 340, 6, 24, 172, 192]; // avoids yellow/green so white text stays legible
const hueOf = (n) => HUES[[...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7) % HUES.length];
const first = (p) => p.name.replace(/^Dr\.\s*/, "").split(" ")[0];
const since = (p) => daysSince(p.last);
const dueIn = (p) => p.cadence - since(p);
const isDue = (p) => dueIn(p) <= 0;
const dueText = (p) => { const d = dueIn(p); return d < 0 ? `${-d}d overdue` : d === 0 ? "Today" : `in ${d}d`; };
const bondOf = (p) => p.bond || 2;
const short = (n) => (n < 1 ? "Today" : n < 30 ? `${n}d` : n < 365 ? `${Math.round(n / 30)}mo` : `${Math.round(n / 365)}y`);
const dots = (n) => `<span class="dots" aria-label="Bond ${BOND[n]}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
const cardHTML = (p, mode = "grid") => { const rich = mode !== "grid";
  return `<div class="card ${mode}" style="--h:${hueOf(p.name)}" data-id="${p.id}">
  <div class="card-top">${dots(bondOf(p))}${mode !== "big" && isDue(p) ? `<span class="due">Follow up</span>` : ""}</div>
  <div class="mono">${initials(p.name)}</div>
  <div class="glass"><div class="cname">${esc(p.name)}</div>
    <div class="csub">${rich ? esc([p.title, p.company].filter(Boolean).join(" · ")) : `${esc(p.place)} · ${short(daysSince(p.date))}`}</div>${rich ? `<div class="csub">${esc(p.place)}</div>` : ""}</div></div>`; };
const avatar = (p, cls = "") => `<div class="avatar ${cls}" style="--h:${hueOf(p.name)}">${initials(p.name)}</div>`;

// ---- screens ----
function render() {
  const due = people.filter(isDue).length;
  $("#view").innerHTML = ui.tab === "people" ? peopleView() : followView();
  $("#tabbar").innerHTML = [["people", "People", I.people, 0], ["follow", "Follow up", I.bell, due]].map(([k, l, ic, n]) =>
    `<button data-tab="${k}" class="${ui.tab === k ? "on" : ""}">${ic}<span>${l}</span>${n ? `<i class="badge">${n}</i>` : ""}</button>`).join("");
  const q = $("#q"); if (q) q.oninput = onSearch;
  if ($("#deck")) { layoutDeck(); setupDeck(); }
}

function personRow(p, detail) {
  return `<button class="row person" data-open="${p.id}">${avatar(p)}
    <div class="grow"><div class="name">${esc(p.name)}</div><div class="sub">${detail}</div></div>
    <div class="trail">${I.chev}</div></button>`;
}

function peopleView() {
  const q = ui.q.trim().toLowerCase();
  const list = people.filter((p) => !q || [p.name, p.company, p.title, p.place, p.event, p.notes, ...(p.tags || [])].join(" ").toLowerCase().includes(q));
  let body;
  if (!people.length) body = `<div class="empty"><b>No one yet</b>Tap + to add the first person you meet.</div>`;
  else if (!list.length) body = `<div class="empty"><b>No results</b>Nothing matches “${esc(ui.q)}”.</div>`;
  else if (ui.mode === "places") {
    const g = {}; list.forEach((p) => (g[p.place] ||= []).push(p));
    body = Object.entries(g).sort((a, b) => b[1][0].date.localeCompare(a[1][0].date) || 0).map(([place, ps]) =>
      `<div class="section"><h4>${esc(place)}</h4><div class="group">${ps.map((p) => personRow(p, `${esc(p.event)} · ${ago(daysSince(p.date))}`)).join("")}</div></div>`).join("");
  } else {
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
    deckList = sorted; ui.idx = Math.min(ui.idx, sorted.length - 1);
    body = `<div class="deck" id="deck">${sorted.map((p) => cardHTML(p, "stack")).join("")}</div><div id="deckinfo"></div>`;
  }
  return `<div class="head"><h1>People</h1><button class="iconbtn" data-add aria-label="Add person">${I.plus}</button></div>
    <div class="search">${I.search}<input id="q" type="search" placeholder="Search" value="${esc(ui.q)}" /></div>
    <div class="seg"><button data-mode="cards" class="${ui.mode === "cards" ? "on" : ""}">Cards</button><button data-mode="places" class="${ui.mode === "places" ? "on" : ""}">Places</button></div>
    ${body}`;
}

function onSearch(e) {
  ui.q = e.target.value; const pos = e.target.selectionStart; render();
  const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos);
}

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

// ---- sheets ----
function openSheet(html) {
  const s = $("#sheet"); s.innerHTML = html; s.scrollTop = 0;
  s.hidden = $("#backdrop").hidden = false;
}
function closeSheet() { $("#sheet").hidden = $("#backdrop").hidden = true; render(); }

const CADENCE = [[7, "Every week"], [14, "Every 2 weeks"], [30, "Every month"], [60, "Every 2 months"], [90, "Every 3 months"]];
const bondSelect = (v, id = "bond") => `<select class="plain" id="${id}">${BOND.map((l, i) => i ? `<option value="${i}" ${i === v ? "selected" : ""}>${l}</option>` : "").join("")}</select>`;
const cadenceLabel = (n) => (CADENCE.find(([d]) => d === n) || [0, `Every ${n} days`])[1];
const cadenceSelect = (v) => `<select class="plain" id="cad">${CADENCE.map(([d, l]) => `<option value="${d}" ${d === v ? "selected" : ""}>${l}</option>`).join("")}</select>`;

function openDetail(id) {
  const p = people.find((x) => x.id === id); if (!p) return;
  const links = Object.entries(p.socials || {}).filter(([, v]) => v);
  const act = (icon, label, href, data = "") => `<${href ? `a href="${esc(href)}" target="_blank" rel="noopener"` : `button ${data}`} class="act ${href || data ? "" : "off"}">${icon}<span>${label}</span></${href ? "a" : "button"}>`;
  const s = p.socials || {};
  openSheet(`<div class="bar"><span style="min-width:60px"></span><span></span><button data-close>Done</button></div>
  <div class="body">
    ${cardHTML(p, "big")}
    <div class="group stats">
      <div><b>${BOND[bondOf(p)]}</b><span>Bond</span></div>
      <div><b>${short(since(p))}</b><span>Last spoke</span></div>
      <div><b>${(p.log || []).length}</b><span>Touches</span></div>
    </div>
    <div class="actions">
      ${act(I.msg, "Message", "", `data-draft="${p.id}"`)}
      ${s.phone ? act(I.call, "Call", "tel:" + s.phone) : act(I.call, "Call", "")}
      ${s.email ? act(I.mail, "Email", "mailto:" + s.email) : act(I.mail, "Email", "")}
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
  const p = people.find((x) => x.id === id);
  const s = p.socials || {};
  const chan = s.phone ? ["phone", "Messages"] : s.instagram ? ["instagram", "Instagram"] : s.linkedin ? ["linkedin", "LinkedIn"] : s.email ? ["email", "Mail"] : s.x ? ["x", "X"] : null;
  openSheet(`<div class="bar"><button data-close>Cancel</button><b>Message</b><span style="min-width:60px"></span></div>
  <div class="body">
    <div class="hero" style="padding-bottom:14px"><h2 style="font-size:22px">${esc(p.name)}</h2><p>Met at ${esc(p.place)} · ${ago(daysSince(p.date))}</p></div>
    <textarea class="draft" id="dtext">${esc(suggestion(p))}</textarea>
    <button class="primary" id="send">${chan ? `Copy & open ${chan[1]}` : "Copy message"}</button>
    <button class="plainbtn" data-touch="${p.id}">Mark as contacted</button>
  </div>`);
  $("#send").onclick = () => {
    navigator.clipboard?.writeText($("#dtext").value).catch(() => {});
    toast("Copied");
    if (chan) window.open(SOCIAL_META[chan[0]].url(s[chan[0]]), "_blank");
  };
}

function openAdd() {
  const f = (id, label, ph = "", extra = "") => `<label class="row"><span class="label">${label}</span><input class="field" id="${id}" placeholder="${ph}" ${extra} /></label>`;
  openSheet(`<div class="bar"><button data-close>Cancel</button><b>New Person</b><button id="save">Add</button></div>
  <div class="body">
    <div class="section"><div class="group"><button class="row blue" id="scan">${I.scan.replace("<svg", '<svg width="22" height="22"')} Scan business card</button></div></div>
    <div class="section"><div class="group">${f("f-name", "Name", "Required", 'autocomplete="off"')}${f("f-title", "Title")}${f("f-company", "Company")}</div></div>
    <div class="section"><h4>Where you met</h4><div class="group">${f("f-place", "Place", "e.g. Coffee, Mill Ave")}${f("f-event", "Context", "e.g. Intro by Sam")}</div></div>
    <div class="section"><h4>Remember</h4><div class="group"><div class="row"><textarea class="plain" id="f-notes" rows="3" placeholder="What should future-you remember?"></textarea></div></div></div>
    <div class="section"><h4>Links</h4><div class="group">${f("s-instagram", "Instagram", "@handle")}${f("s-linkedin", "LinkedIn", "handle")}${f("s-email", "Email")}${f("s-phone", "Phone")}</div></div>
    <div class="section"><div class="group"><div class="row kv"><span style="color:var(--text)">Bond</span>${bondSelect(2, "f-bond")}</div>
      <div class="row kv"><span style="color:var(--text)">Remind me</span>${cadenceSelect(30)}</div></div></div>
  </div>`);
  $("#f-name").focus();
  $("#scan").onclick = () => {
    const c = SCAN_SAMPLES[Math.floor(Math.random() * SCAN_SAMPLES.length)];
    $("#f-name").value = c.name; $("#f-title").value = c.title; $("#f-company").value = c.company;
    Object.entries(c.socials).forEach(([k, v]) => { const el = $("#s-" + k); if (el) el.value = v; });
    toast("Card scanned"); $("#f-place").focus();
  };
  $("#save").onclick = () => {
    const g = (id) => $("#" + id).value.trim();
    if (!g("f-name")) return toast("Add a name first");
    const socials = {}; ["instagram", "linkedin", "email", "phone"].forEach((k) => g("s-" + k) && (socials[k] = g("s-" + k).replace(/^@/, "")));
    people.unshift({ id: "p" + Date.now(), name: g("f-name"), title: g("f-title"), company: g("f-company"), place: g("f-place") || "Somewhere", event: g("f-event") || "—",
      notes: g("f-notes"), tags: [], socials, bond: +$("#f-bond").value, cadence: +$("#cad").value, date: today(), last: today(), log: [{ d: today(), t: "Met." }] });
    save(); ui.tab = "people"; closeSheet(); toast("Added");
  };
}

// ---- circular card deck: front card large, the rest fanned behind on an arc ----
function layoutDeck() {
  const cards = [...$("#deck").children], n = cards.length, half = Math.floor(n / 2);
  cards.forEach((c, i) => {
    const d = ((i - ui.idx) % n + n + half) % n - half, k = Math.abs(d);
    c.dataset.d = d;
    c.style.setProperty("--x", d * 44 + "px"); c.style.setProperty("--y", k * k * 7 + "px");
    c.style.setProperty("--r", d * 7 + "deg"); c.style.setProperty("--s", 1 - Math.min(k, 3) * .09);
    c.style.zIndex = 20 - k; c.style.opacity = k > 3 ? 0 : 1; c.style.filter = `brightness(${1 - Math.min(k, 3) * .1})`;
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
    else if (down) { const d = +down.dataset.d; d === 0 ? openDetail(down.dataset.id) : goDeck(d); }
    down = null;
  };
}
document.addEventListener("keydown", (e) => { if ($("#deck") && $("#sheet").hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) goDeck(e.key === "ArrowRight" ? 1 : -1); });

// subtle Apple-style depth on the big card
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
  if (t("[data-draft]")) { e.stopPropagation(); return openDraft(t("[data-draft]").dataset.draft); }
  if (t("[data-tab]")) { ui.tab = t("[data-tab]").dataset.tab; render(); $("#view").scrollTop = 0; return; }
  if (t("[data-mode]")) { ui.mode = t("[data-mode]").dataset.mode; return render(); }
  if (t("[data-add]")) return openAdd();
  if (t("[data-close]") || e.target.id === "backdrop") return closeSheet();
  if (t("[data-touch]")) return touch(t("[data-touch]").dataset.touch);
  if (t("[data-del]")) { if (confirm("Delete this person?")) { people = people.filter((p) => p.id !== t("[data-del]").dataset.del); save(); closeSheet(); } return; }
  if (t("[data-open]")) return openDetail(t("[data-open]").dataset.open);
});

render();
