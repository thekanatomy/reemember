// Reemember prototype — vanilla JS, no build step. State persists in localStorage.
const KEY = "reemember.v1";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / DAY);
const initials = (n) => n.split(/\s+/).filter((w) => !/^(dr|mr|ms)\.?$/i.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

let people = load();
let ui = { tab: "binder", q: "", tag: "all", toolOpen: null };

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(SEED); } catch { return structuredClone(SEED); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(people)); } catch {} }

// ---- derived relationship stats ----
const hue = (p) => (TYPES[p.type] || TYPES.Friend).hue;
const elapsed = (p) => daysSince(p.last);
const dueIn = (p) => p.cadence - elapsed(p);            // negative = overdue
const health = (p) => Math.max(0, Math.min(1, 1 - elapsed(p) / (p.cadence * 2)));
const healthColor = (h) => (h > .6 ? "var(--good)" : h > .3 ? "var(--warn)" : "var(--bad)");
const isDue = (p) => dueIn(p) <= 0;
const dueLabel = (p) => { const d = dueIn(p); return d < 0 ? `${-d}d overdue` : d === 0 ? "due today" : `in ${d}d`; };

// ---- views ----
function render() {
  const due = people.filter(isDue).length;
  $("#stats").innerHTML = `<span><b>${people.length}</b> cards</span><span><b>${new Set(people.map((p) => p.place)).size}</b> places</span>`;
  const badge = $("#dueBadge"); badge.hidden = !due; badge.textContent = due;
  $$("#tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === ui.tab));
  const v = $("#view");
  v.innerHTML = { binder, followups, places, tools, add }[ui.tab]();
  bind(v);
}

function cardHTML(p, big = false) {
  const r = RARITY[p.strength], t = TYPES[p.type] || TYPES.Friend, h = health(p);
  return `<div class="card ${r.cls} ${big ? "big" : ""}" data-id="${p.id}" style="--h:${hue(p)}">
    ${!big && isDue(p) ? `<span class="due-dot">${dueLabel(p)}</span>` : ""}
    <div class="card-in">
      <div class="card-head"><span class="card-name">${esc(p.name)}</span><span class="card-type">${t.icon} ${esc(p.type)}</span></div>
      <div class="art"><span class="initials">${initials(p.name)}</span><span class="glyph">${t.icon}</span></div>
      <div class="card-info"><b>${esc(p.title)}</b><br>${esc(p.company)}<br>📍 ${esc(p.place)}</div>
      <div class="hp">♥<span class="hp-bar"><i style="width:${h * 100}%;background:${healthColor(h)}"></i></span></div>
      <div class="rarity">${"★".repeat(p.strength)} ${r.name}</div>
    </div></div>`;
}

function binder() {
  const tags = ["all", ...new Set(people.flatMap((p) => p.tags))];
  const q = ui.q.toLowerCase();
  const list = people.filter((p) =>
    (ui.tag === "all" || p.tags.includes(ui.tag)) &&
    (!q || [p.name, p.company, p.title, p.place, p.event, p.notes, ...p.tags].join(" ").toLowerCase().includes(q)));
  return `<input class="search" id="q" placeholder="Search name, place, notes…" value="${esc(ui.q)}" />
    <div class="chips">${tags.map((t) => `<button class="chip ${ui.tag === t ? "on" : ""}" data-tag="${esc(t)}">${t === "all" ? "All" : "#" + esc(t)}</button>`).join("")}</div>
    ${list.length ? `<div class="grid">${list.map((p) => cardHTML(p)).join("")}</div>` : `<div class="empty">No cards match. Tap ＋ to collect someone new.</div>`}`;
}

function followups() {
  const sorted = [...people].sort((a, b) => dueIn(a) - dueIn(b));
  const due = sorted.filter(isDue), later = sorted.filter((p) => !isDue(p));
  const row = (p) => `<div class="row">
    <div class="avatar" style="--h:${hue(p)}" data-open="${p.id}">${initials(p.name)}</div>
    <div class="grow" data-open="${p.id}"><div class="name">${esc(p.name)}</div>
      <div class="sub">Last: ${elapsed(p)}d ago · met at ${esc(p.place)}</div></div>
    <div style="text-align:right"><span class="pill ${isDue(p) ? (dueIn(p) < -7 ? "bad" : "warn") : "good"}">${dueLabel(p)}</span>
      <div class="actions" style="margin-top:6px;justify-content:flex-end">
        <button class="btn small" data-draft="${p.id}">Message</button>
        <button class="btn small ghost" data-touch="${p.id}">✓</button></div></div></div>`;
  return `<h2>Follow-ups</h2>
    ${due.length ? due.map(row).join("") : `<div class="empty">🎉 You're all caught up.</div>`}
    <h3>Coming up</h3>${later.map(row).join("")}`;
}

function places() {
  const groups = {};
  people.forEach((p) => (groups[p.place] ||= []).push(p));
  const entries = Object.entries(groups).sort((a, b) => Math.max(...b[1].map((p) => +new Date(p.date))) - Math.max(...a[1].map((p) => +new Date(p.date))));
  return `<h2>Where you met</h2>` + entries.map(([place, ps]) => `<div class="place">
    <h4>📍 ${esc(place)}</h4>
    <div class="meta">${[...new Set(ps.map((p) => p.event))].map(esc).join(" · ")} · ${ps.length} ${ps.length === 1 ? "person" : "people"}</div>
    <div class="faces">${ps.map((p) => `<div class="avatar" style="--h:${hue(p)}" title="${esc(p.name)}" data-open="${p.id}">${initials(p.name)}</div>`).join("")}</div></div>`).join("");
}

const TEMPLATES = {
  "Nice to meet you": (p) => `Hey ${first(p)}! Great meeting you at ${p.event}. ${p.notes ? "Still thinking about our chat — " + hook(p) : ""} Would love to stay in touch!`,
  "Check-in": (p) => `Hey ${first(p)}, it's been ${elapsed(p)} days since ${p.event} — how's everything going at ${p.company}?`,
  "Offer help": (p) => `Hi ${first(p)}! Was thinking of you — anything I can help with right now? Happy to make an intro.`,
  "Coffee ask": (p) => `${first(p)}, let's grab coffee soon? I'd love to catch up. Free this week or next?`,
};
const first = (p) => p.name.replace(/^Dr\.\s*/, "").split(" ")[0];
const hook = (p) => p.notes.split(/(?<=\.)\s/)[0].replace(/\.$/, "").toLowerCase() + ".";

function tools() {
  const open = ui.toolOpen;
  const opts = people.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
  const weekly = [...people].sort((a, b) => dueIn(a) - dueIn(b)).slice(0, 5);
  const pairs = intros();
  return `<h2>Toolbox</h2>
  <div class="tool" data-tool="weekly"><i>🎯</i><div style="flex:1"><b>Weekly 5</b><span>Five people worth reaching out to this week.</span>
    ${open === "weekly" ? weekly.map((p) => `<div class="prompt" data-open="${p.id}"><b>${esc(p.name)}</b> — ${dueLabel(p)}. ${esc(p.notes.split(".")[0])}.</div>`).join("") : ""}</div></div>
  <div class="tool" data-tool="writer"><i>✍️</i><div style="flex:1" id="writer"><b>Message writer</b><span>Pick a person + tone, get a ready-to-send draft.</span>
    ${open === "writer" ? `<div class="form"><select id="wp">${opts}</select><select id="wt">${Object.keys(TEMPLATES).map((t) => `<option>${t}</option>`).join("")}</select></div>
      <div class="prompt" id="wout"></div><div class="actions" style="margin-top:8px"><button class="btn small" id="wcopy">Copy</button></div>` : ""}</div></div>
  <div class="tool" data-tool="intros"><i>🤝</i><div style="flex:1"><b>Intro matchmaker</b><span>Pairs in your binder who'd click (shared tags).</span>
    ${open === "intros" ? (pairs.length ? pairs.map(([a, b, t]) => `<div class="prompt"><b>${esc(a.name)}</b> ↔ <b>${esc(b.name)}</b><br><span class="muted">both #${esc(t)}</span></div>`).join("") : `<div class="prompt">No matches yet.</div>`) : ""}</div></div>
  <div class="tool" data-tool="export"><i>📤</i><div style="flex:1"><b>Export</b><span>Download your binder as CSV.</span>
    ${open === "export" ? `<div class="actions" style="margin-top:8px"><button class="btn small" id="csv">Download CSV</button></div>` : ""}</div></div>
  <div class="tool" data-tool="reset"><i>♻️</i><div style="flex:1"><b>Reset demo data</b><span>Restore the sample cards.</span>
    ${open === "reset" ? `<div class="actions" style="margin-top:8px"><button class="btn small danger" id="reset">Yes, reset</button></div>` : ""}</div></div>`;
}

function intros() {
  const out = [];
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
    const shared = people[i].tags.find((t) => people[j].tags.includes(t) && !["mentor?"].includes(t));
    if (shared && people[i].place !== people[j].place) out.push([people[i], people[j], shared]);
  }
  return out.slice(0, 5);
}

let draft = { socials: {}, strength: 2, type: "Founder" };
function add() {
  const d = draft;
  return `<h2>Collect a new card</h2>
  <div class="scan" id="scan"><div><div style="font-size:34px">📷</div>Tap to scan a business card / QR<br><small>(demo: fills in a sample)</small></div></div>
  <div class="form">
    <label>Name</label><input id="f-name" value="${esc(d.name || "")}" placeholder="Full name" />
    <div class="two"><div><label>Title</label><input id="f-title" value="${esc(d.title || "")}" /></div><div><label>Company</label><input id="f-company" value="${esc(d.company || "")}" /></div></div>
    <label>Type</label><select id="f-type">${Object.keys(TYPES).map((t) => `<option ${t === d.type ? "selected" : ""}>${t}</option>`).join("")}</select>
    <div class="two"><div><label>Where did you meet?</label><input id="f-place" value="${esc(d.place || "")}" placeholder="e.g. Coffee, Mill Ave" /></div><div><label>Event / context</label><input id="f-event" value="${esc(d.event || "")}" /></div></div>
    <label>Notes — what should future-you remember?</label><textarea id="f-notes" rows="3">${esc(d.notes || "")}</textarea>
    <label>Socials</label>
    <div class="two">${["instagram", "linkedin", "x", "github", "email", "phone"].map((k) => `<input data-soc="${k}" placeholder="${SOCIAL_META[k].label}" value="${esc(d.socials[k] || "")}" />`).join("")}</div>
    <label>Tags (comma separated)</label><input id="f-tags" value="${esc((d.tags || []).join(", "))}" placeholder="startup, dev, asu" />
    <label>How close is this relationship?</label>
    <div class="strength">${[1, 2, 3, 4, 5].map((n) => `<button data-str="${n}" class="${d.strength === n ? "on" : ""}">${RARITY[n].name}</button>`).join("")}</div>
    <label>Remind me every</label>
    <select id="f-cad">${[[7, "week"], [14, "2 weeks"], [30, "month"], [60, "2 months"], [90, "quarter"]].map(([n, l]) => `<option value="${n}" ${(d.cadence || 30) === n ? "selected" : ""}>${l}</option>`).join("")}</select>
    <div style="margin-top:18px"><button class="btn block" id="savecard">Add to binder</button></div>
  </div>`;
}

// ---- detail sheet ----
function openSheet(id) {
  const p = people.find((x) => x.id === id); if (!p) return;
  const soc = Object.entries(p.socials).filter(([, v]) => v).map(([k, v]) => {
    const m = SOCIAL_META[k]; return `<a class="social" href="${esc(m.url(v))}" target="_blank" rel="noopener"><b>${m.short}</b> ${m.prefix}${esc(v)}</a>`; }).join("");
  const s = $("#sheet");
  s.innerHTML = `<div class="grab"></div><button class="x" data-close>✕</button>
    ${cardHTML(p, true)}
    <div class="actions" style="justify-content:center;margin:10px 0">
      <button class="btn" data-draft="${p.id}">✍️ Message</button>
      <button class="btn ghost" data-touch="${p.id}">✓ Log touch</button></div>
    <div class="kv"><small>Where we met</small>📍 ${esc(p.place)}<br><span class="muted">${esc(p.event)} · ${new Date(p.date + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} (${daysSince(p.date)}d ago)</span></div>
    <div class="kv"><small>Remember</small><span id="notes" contenteditable="true" style="outline:none;display:block">${esc(p.notes)}</span></div>
    <div class="kv"><small>Relationship health</small>Follow up ${dueLabel(p)} · every ${p.cadence}d
      <div class="hp" style="margin-top:6px"><span class="hp-bar"><i style="width:${health(p) * 100}%;background:${healthColor(health(p))}"></i></span></div></div>
    <h3>Socials</h3><div class="socials">${soc || '<span class="muted">None saved</span>'}</div>
    <h3>Tags</h3><div class="socials">${p.tags.map((t) => `<span class="pill">#${esc(t)}</span>`).join("")}</div>
    <h3>History</h3><div class="timeline">${p.log.length ? p.log.map((l) => `<div>${esc(l.t)}<small>${l.d}</small></div>`).join("") : '<span class="muted">No touches yet.</span>'}</div>
    <div style="margin-top:22px"><button class="btn danger small" data-del="${p.id}">Delete card</button></div>`;
  $("#backdrop").hidden = s.hidden = false;
  s.scrollTop = 0;
  $("#notes", s).addEventListener("blur", (e) => { p.notes = e.target.textContent.trim(); save(); });
  bindTilt(s);
}
function closeSheet() { $("#sheet").hidden = $("#backdrop").hidden = true; render(); }

function openDraft(id) {
  const p = people.find((x) => x.id === id);
  const s = $("#sheet");
  s.innerHTML = `<div class="grab"></div><button class="x" data-close>✕</button>
    <h2>Message ${esc(first(p))}</h2><p class="muted" style="margin-top:-6px">Met at ${esc(p.place)} · ${esc(p.event)}</p>
    <div class="chips" style="flex-wrap:wrap">${Object.keys(TEMPLATES).map((t, i) => `<button class="chip ${i ? "" : "on"}" data-tpl="${t}">${t}</button>`).join("")}</div>
    <textarea id="dtext" rows="6" class="search" style="margin-top:8px">${esc(TEMPLATES["Nice to meet you"](p))}</textarea>
    <div class="actions" style="margin-top:12px">${["phone", "instagram", "email", "linkedin", "x"].filter((k) => p.socials[k]).map((k) =>
      `<button class="btn small ghost" data-send="${k}">Open ${SOCIAL_META[k].label}</button>`).join("")}
      <button class="btn small" id="dcopy">Copy</button><button class="btn small ghost" data-touch="${p.id}">Mark sent ✓</button></div>`;
  $("#backdrop").hidden = s.hidden = false;
  s.onclick = (e) => {
    const t = e.target.closest("[data-tpl]");
    if (t) { $$("[data-tpl]", s).forEach((c) => c.classList.toggle("on", c === t)); $("#dtext").value = TEMPLATES[t.dataset.tpl](p); }
    const snd = e.target.closest("[data-send]");
    if (snd) { const k = snd.dataset.send; window.open(SOCIAL_META[k].url(p.socials[k]), "_blank"); }
    if (e.target.id === "dcopy") copy($("#dtext").value);
  };
}

// ---- actions ----
function touch(id) {
  const p = people.find((x) => x.id === id);
  p.last = today(); p.log.unshift({ d: today(), t: "Followed up." }); save();
  toast(`Logged touch with ${first(p)} ✓`); closeSheet();
}
function copy(text) { navigator.clipboard?.writeText(text).then(() => toast("Copied!"), () => toast("Copy failed")); }
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); }

function readForm() {
  const g = (id) => $("#" + id).value.trim();
  const socials = {}; $$("[data-soc]").forEach((i) => i.value.trim() && (socials[i.dataset.soc] = i.value.trim().replace(/^@/, "")));
  return { name: g("f-name"), title: g("f-title"), company: g("f-company"), type: g("f-type"), place: g("f-place"), event: g("f-event"),
    notes: g("f-notes"), tags: g("f-tags").split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean), socials, cadence: +$("#f-cad").value };
}

// ---- event wiring ----
function bind(root) {
  bindTilt(root);
  const q = $("#q", root);
  if (q) q.oninput = (e) => { ui.q = e.target.value; const pos = e.target.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); };
  if (ui.tab === "add") {
    $("#scan").onclick = (e) => {
      const el = e.currentTarget; el.classList.add("scanning");
      setTimeout(() => {
        const s = SCAN_SAMPLES[Math.floor(Math.random() * SCAN_SAMPLES.length)];
        draft = { ...draft, ...s, socials: { ...s.socials }, place: draft.place || "", event: draft.event || "" };
        render(); toast("Scanned! Add where you met 👇");
      }, 1200);
    };
    $$("[data-str]").forEach((b) => (b.onclick = () => { draft = { ...draft, ...readForm(), strength: +b.dataset.str }; render(); }));
    $("#savecard").onclick = () => {
      const f = readForm();
      if (!f.name) return toast("Add a name first");
      people.unshift({ id: "p" + Date.now(), ...f, place: f.place || "Somewhere", event: f.event || "—", date: today(), last: today(), strength: draft.strength || 2,
        log: [{ d: today(), t: "Met and added to binder." }] });
      save(); draft = { socials: {}, strength: 2, type: "Founder" }; ui.tab = "binder"; render(); toast("Card added to your binder ✨");
    };
  }
  if (ui.tab === "tools") {
    const wp = $("#wp"), wt = $("#wt");
    if (wp) { const w = () => ($("#wout").textContent = TEMPLATES[wt.value](people.find((p) => p.id === wp.value))); wp.onchange = wt.onchange = w; w();
      $("#wcopy").onclick = () => copy($("#wout").textContent); }
    $("#csv") && ($("#csv").onclick = exportCSV);
    $("#reset") && ($("#reset").onclick = () => { people = structuredClone(SEED); save(); render(); toast("Demo data restored"); });
  }
}

function bindTilt(root) {
  $$(".card", root).forEach((c) => {
    c.onpointermove = (e) => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
      c.style.setProperty("--ry", (x - .5) * 16 + "deg"); c.style.setProperty("--rx", (.5 - y) * 16 + "deg");
    };
    c.onpointerleave = () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); };
  });
}

function exportCSV() {
  const cols = ["name", "title", "company", "type", "place", "event", "date", "last", "notes"];
  const rows = [cols.join(","), ...people.map((p) => cols.map((c) => `"${String(p[c] ?? "").replace(/"/g, '""')}"`).join(","))];
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
  a.download = "reemember.csv"; a.click();
}

document.addEventListener("click", (e) => {
  const t = (sel) => e.target.closest(sel);
  if (t("#tabbar button")) { ui.tab = t("#tabbar button").dataset.tab; ui.toolOpen = null; render(); $("#view").scrollTop = 0; return; }
  if (t("[data-close]") || e.target.id === "backdrop") return closeSheet();
  if (t("[data-touch]")) return touch(t("[data-touch]").dataset.touch);
  if (t("[data-draft]")) return openDraft(t("[data-draft]").dataset.draft);
  if (t("[data-del]")) { if (confirm("Delete this card?")) { people = people.filter((p) => p.id !== t("[data-del]").dataset.del); save(); closeSheet(); } return; }
  if (t("[data-tag]")) { ui.tag = t("[data-tag]").dataset.tag; return render(); }
  if (t("[data-open]")) return openSheet(t("[data-open]").dataset.open);
  if (t(".card") && !t(".card.big")) return openSheet(t(".card").dataset.id);
  if (t("[data-tool]") && !t("select,button,.prompt")) { const k = t("[data-tool]").dataset.tool; ui.toolOpen = ui.toolOpen === k ? null : k; return render(); }
});

render();
