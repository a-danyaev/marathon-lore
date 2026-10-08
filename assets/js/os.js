(() => {
"use strict";
const ML = window.ML;
if (!ML || !document.body.classList.contains("p-desk")) return;
const D = document, R = D.documentElement, { $, $$, Q, SHOT, RM, store, clamp, now, I } = ML;
const DESK = $("#main"), WINS = $$(".win"), TABS = $$(".tab[data-open]"), log = $("[data-log]");
const isDesk = () => matchMedia("(min-width:821px)").matches;
const W = id => $('[data-win="' + id + '"]');
let z = 10, focusWin = null;

WINS.forEach(w => { w.dataset.state = w.dataset.state || "open"; });
function applyStates() {
  WINS.forEach(w => {
    w.hidden = isDesk() ? w.dataset.state !== "open" : false;
  });
}

function place() {
  if (!isDesk()) return;
  const dw = DESK.clientWidth, dh = DESK.clientHeight, sx = dw / 1440, sy = dh / 828;
  WINS.forEach(w => {
    if (w.dataset.moved) return;
    const [x, y, ww, hh] = w.dataset.rect.split(",").map(Number);
    const width = Math.min(ww, dw - 40), height = Math.min(hh, dh - 40);
    w.style.setProperty("--w", width + "px"); w.style.setProperty("--h", height + "px");
    w.style.setProperty("--x", clamp(Math.round(x * sx), 8, dw - width - 8) + "px");
    w.style.setProperty("--y", clamp(Math.round(y * Math.min(1, sy)), 8, dh - height - 8) + "px");
  });
}
function front(w) {
  if (!w) return;
  w.style.zIndex = ++z;
  focusWin = w;
  WINS.forEach(o => o.classList.toggle("is-focus", o === w));
  paintTabs();
}
function paintTabs() {
  TABS.forEach(t => {
    const w = W(t.dataset.open); if (!w) return;
    t.classList.toggle("is-open", !w.hidden);
    t.classList.toggle("is-focus", w === focusWin && !w.hidden);
  });
}
function open(id, opts = {}) {
  const w = W(id); if (!w) return;
  w.dataset.state = "open"; w.hidden = false;
  front(w);
  if (!isDesk()) {
    const bar = parseFloat(getComputedStyle(R).getPropertyValue("--bar")) || 32;
    scrollTo({ top: Math.max(0, w.getBoundingClientRect().top + scrollY - bar - 10), behavior: RM || SHOT ? "auto" : "smooth" });
    return;
  }
  if (!RM) { w.classList.remove("is-opening"); void w.offsetWidth; w.classList.add("is-opening"); setTimeout(() => w.classList.remove("is-opening"), 400); }
  if (opts.focus !== false) w.focus({ preventScroll: true });
}
function close(w, state) {
  w.dataset.state = state;
  if (isDesk()) w.hidden = true;
  if (focusWin === w) {
    focusWin = null;
    const vis = WINS.filter(o => !o.hidden).sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0));
    if (vis[0]) front(vis[0]);
  }
  paintTabs();
  const ic = $('.ico[data-open="' + w.dataset.win + '"]'); if (ic && isDesk()) ic.focus();
}

$$("[data-open]").forEach(b => b.addEventListener("click", e => {
  const id = b.dataset.open, w = W(id);
  if (!w) return;
  e.preventDefault();
  if (b.classList.contains("tab") && isDesk() && !w.hidden && w === focusWin) { close(w, "min"); return; }
  open(id);
}));
WINS.forEach(w => {
  w.addEventListener("pointerdown", () => { if (isDesk()) front(w); });
  w.addEventListener("focusin", () => { if (focusWin !== w && isDesk()) front(w); });
  const c = $("[data-close]", w), m = $("[data-min]", w);
  if (c) c.addEventListener("click", () => close(w, "closed"));
  if (m) m.addEventListener("click", () => close(w, "min"));
  const bar = $("[data-drag]", w);
  let sx, sy, ox, oy, drag = false;
  bar.addEventListener("pointerdown", e => {
    if (!isDesk() || e.button !== 0 || e.target.closest("button")) return;
    drag = true; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop;
    bar.setPointerCapture(e.pointerId); w.classList.add("is-drag"); e.preventDefault();
  });
  bar.addEventListener("pointermove", e => {
    if (!drag) return;
    const dw = DESK.clientWidth, dh = DESK.clientHeight;
    w.style.setProperty("--x", clamp(ox + e.clientX - sx, 80 - w.offsetWidth, dw - 80) + "px");
    w.style.setProperty("--y", clamp(oy + e.clientY - sy, 0, dh - 28) + "px");
    w.dataset.moved = "1";
  });
  const end = () => { drag = false; w.classList.remove("is-drag"); };
  bar.addEventListener("pointerup", end); bar.addEventListener("pointercancel", end);
});
D.addEventListener("keydown", e => {
  if (e.key !== "Escape" || !isDesk()) return;
  const w = D.activeElement && D.activeElement.closest(".win");
  if (w) { e.preventDefault(); close(w, "closed"); }
});
let wasDesk = isDesk();
addEventListener("resize", () => { if (isDesk() !== wasDesk) { wasDesk = isDesk(); applyStates(); } place(); paintTabs(); });

let typing = null;
function say(text, cls) {
  if (!log || !text) return;
  const p = D.createElement("p"); p.className = cls || "is-ai";
  const t = D.createElement("time"); t.textContent = now();
  const s = D.createElement("span"); p.append(t, s); log.appendChild(p);
  while (log.children.length > 16) log.firstElementChild.remove();
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  if ((cls && cls !== "is-ai") || RM || SHOT) { s.textContent = text; scroll(); return; }
  let i = 0; const sp = 18;
  clearInterval(typing);
  typing = setInterval(() => { s.textContent = text.slice(0, ++i); scroll(); if (i >= text.length) clearInterval(typing); }, sp);
}
addEventListener("ml:say", e => say(e.detail));

const WIN_ALIASES = { archive: "archive", "эфир": "air", air: "air", "on air": "air", onair: "air", feed: "air", syl: "air", "symbiosis.cnt": "cnt", symbiosis: "cnt", cnt: "cnt", "forecast.log": "forecast", forecast: "forecast", curator: "curator" };
function findChapter(arg) {
  const a = arg.toLowerCase();
  return ML.CHAPTERS.find(c => c.id.toLowerCase() === a || c.title.toLowerCase() === a || c.href.toLowerCase().includes("/" + a + ".html"));
}
const CMDS = {
  help: () => I.t("cmd.help"),
  ls: () => I.t("cmd.ls"),
  diag: () => ML.voiceText("status"),
  rampancy: () => I.t("cmd.rampancy"),
  whoami: () => I.t("cmd.whoami", { shell: ML.shellName().toUpperCase(), n: ML.read().length, total: ML.FILE_IDS.length }),
  symbiosis: () => { const d = Math.max(0, Math.ceil((Date.parse("2026-12-08T17:00:00Z") - Date.now()) / 864e5)); return I.t("cmd.symbiosis", { date: I.dmy("2026-12-08"), d }); },
  durandal: () => I.t("cmd.durandal"),
  clear: () => { log.innerHTML = ""; return null; }
};
function run(raw) {
  const v = raw.trim().toLowerCase();
  if (!v) return;
  say(v, "is-me");
  const [c, ...rest] = v.split(/\s+/), arg = rest.join(" ");
  if ((c === "open" || c === "cd") && arg) {
    const id = WIN_ALIASES[arg];
    if (id) { open(id, { focus: false }); say(I.t("cmd.opening", { win: arg.toUpperCase() })); return; }
    const ch = findChapter(arg);
    if (ch) { say(I.t("cmd.goto", { id: ch.id, title: ch.title })); ML.markRead(ch.id); setTimeout(() => { location.href = ch.url; }, SHOT ? 0 : 500); return; }
    say(I.t("cmd.notfound"));
    return;
  }
  const f = CMDS[c];
  const out = f ? f() : ML.voiceText("unknown");
  if (out) setTimeout(() => say(out), 120);
}
const form = $("[data-cmd]");
if (form) form.addEventListener("submit", e => { e.preventDefault(); const inp = $("#cmd"); run(inp.value); inp.value = ""; });
$$("[data-cmd-chip]").forEach(b => b.addEventListener("click", () => run(b.dataset.cmdChip)));

const archDesc = $("[data-archdesc]");
function paintArch() {
  const read = ML.read();
  $$(".arch__list a[data-file]").forEach(a => {
    const r = read.includes(a.dataset.file);
    a.classList.toggle("is-read", r);
    const s = $(".arch__s", a); if (s) s.textContent = I.t(r ? "arch.read" : "arch.new");
  });
  const cnt = $("[data-archcount]"); if (cnt) cnt.textContent = I.t("arch.count", { n: ML.FILE_IDS.length, r: read.length });
  $$("[data-readcount]").forEach(e => { e.textContent = read.length; });
}
$$(".arch__list a").forEach(a => {
  const show = () => { if (archDesc) archDesc.textContent = a.dataset.desc; };
  a.addEventListener("pointerenter", show); a.addEventListener("focus", show);
  a.addEventListener("click", () => { if (a.dataset.file) ML.markRead(a.dataset.file); });
});
ML.hooks.push(paintArch);
paintArch();

function deckSpy() {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting || isDesk()) return;
    WINS.forEach(w => w.classList.toggle("is-cur", w === en.target));
    focusWin = en.target; paintTabs();
  }), { rootMargin: "-45% 0px -50% 0px" });
  WINS.forEach(w => io.observe(w));
}

function boot() {
  const b = D.createElement("div"); b.className = "boot"; b.setAttribute("role", "status");
  const L = I.t("boot.lines");
  const logo = new URL("assets/img/brand/complex-green.png", ML.ROOT).href;
  b.innerHTML = '<img class="boot__logo" src="' + logo + '" alt="MARATHON"><div class="boot__lines"></div><div class="boot__bar"><i></i></div><span class="boot__skip">' + I.t(matchMedia("(pointer:coarse)").matches ? "boot.skip.touch" : "boot.skip.key") + "</span>";
  D.body.appendChild(b);
  const box = $(".boot__lines", b); let i = 0, done = false;
  const t = setInterval(() => { if (i >= L.length) return clearInterval(t); const p = D.createElement("p"); p.className = "boot__l"; p.innerHTML = L[i++]; box.appendChild(p); }, 300);
  requestAnimationFrame(() => { $(".boot__bar i", b).style.width = "calc(100% - 2px)"; });
  const end = () => { if (done) return; done = true; clearInterval(t); store.set("ml_booted", true); b.classList.add("is-out"); setTimeout(() => b.remove(), 460); removeEventListener("keydown", end); };
  setTimeout(end, 2300);
  b.addEventListener("pointerdown", end); addEventListener("keydown", end);
}

if (!SHOT && !RM && !store.get("ml_booted", false)) boot();
applyStates();
place();
if (isDesk()) { front(W("curator")); front(W("air")); }
deckSpy();
const sys = $("[data-sysread]"); if (sys) sys.textContent = I.t("arch.sys", { n: ML.FILE_IDS.length, r: ML.read().length });
say(ML.line("home", ML.read().length > 1 ? 2 : 0));
paintTabs();
const wantRaw = Q.get("open") || (location.hash.startsWith("#win-") ? location.hash.slice(5) : "");
const want = wantRaw === "syl" ? "air" : wantRaw;
if (want && W(want)) setTimeout(() => open(want, { focus: false }), SHOT ? 0 : 60);
ML.os = { open, close, say };
})();
