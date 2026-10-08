/* core.js - v7 runtime core, loaded first on every page.
 *
 * Architecture (v7, static, no build step):
 *   css: base.css (tokens, type, chips) + os.css (OS chrome, field, desk windows) + page.css (chapter pages).
 *   js:  i18n.js   UI strings ru/en (window.ML_I18N), loaded first; lang comes from <html lang>, EN pages at the root, RU pages mirror them under ru/.
 *        core.js   boot, window.ML namespace, chapters registry, visited pages (localStorage ml_read),
 *                  headline glitch (decode-in, hover, idle bursts in brand colours), clock, cursor frame, reduced motion, lazy field loader.
 *        field.js  dither field (WebGL2, 2D canvas fallback, CSS poster fallback) + colour lens. Lazy: core injects it.
 *        os.js     desktop: windows, drag, taskbar, mobile deck, boot screen, CURATOR console.
 *        changelog.js  ЭФИР С ТАУ КИТА (live feed by date), FORECAST.LOG, SYMBIOSIS countdown.
 *        page.js   chapter page: TOC spy, kinetic titles, figure lens, curator lines per section.
 *   data: data/*.yaml -> v5/build_data.py -> data/js/*.js (window.ML_CHANGELOG + ML_CHANGELOG_META, ML_PREDICTIONS, ML_AI_LINES).
 *   field images: [data-field-window] carries data-field-src (+ focus/inv/label); swapping an image is one attribute.
 *   language switch: EN is the default for everybody. core injects RU | EN into #mbar, the counterpart URL adds or drops the ru/ segment, the choice is kept in localStorage ml_lang;
 *                    an EN page redirects once to its ru/ counterpart only when ml_lang is "ru" or the URL carries ?lang=ru (inline head script, old v6.4 links); RU pages never redirect.
 *   page identity: <body data-file="06"> marks the chapter as visited (ARCHIVE shows read N of total).
 *   url flags: ?shot=1 freezes animations for screenshots,
 *              ?today=YYYY-MM-DD shifts the ЭФИР clock for testing.
 */
(() => {
"use strict";
const D = document, R = D.documentElement;
const I = window.ML_I18N;
if (!I) {
  const cs = D.currentScript;
  if (cs && D.readyState === "loading") D.write('<script src="' + new URL("i18n.js", cs.src).href + '"><\/script><script src="' + cs.src + '"><\/script>');
  else console.warn("[ml core] i18n.js is not loaded, add it before core.js");
  return;
}
const Q = new URLSearchParams(location.search);
const SHOT = Q.has("shot");
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = D) => r.querySelector(s);
const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = n => String(n).padStart(2, "0");
const now = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; }
};
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, String(v)); } catch (e) { return false; } return true; }
};
const SCRIPT = D.currentScript;
const ROOT = new URL("../../", SCRIPT ? SCRIPT.src : location.href);
const LANG = I.lang;
const HOME = LANG === "ru" ? new URL("ru/", ROOT) : ROOT;
const CH_TEXT = I.t("chapters");
const CHAPTERS = [
  ["01", "index.html"], ["02", "pages/timeline.html"], ["03", "pages/rampancy.html"], ["04", "pages/colony.html"],
  ["05", "pages/runners.html"], ["06", "pages/classes.html"], ["06-B", "pages/arsenal.html"], ["06-C", "pages/sound.html"],
  ["07", "pages/factions.html"], ["08", "pages/aliens.html"], ["09", "pages/zones.html"], ["10", "pages/seasons.html"],
  ["11", "pages/trilogy.html"], ["12", "pages/deep-cuts.html"], ["13", "pages/resources.html"]
].map(([id, href]) => ({ id, href, title: CH_TEXT[id][0], desc: CH_TEXT[id][1], url: new URL(href, HOME).href }));
const FILE_IDS = CHAPTERS.map(c => c.id);
const AI = window.ML_AI_LINES || { voice: {}, sections: {} };
const VOICE = AI.voice || {};

let read = SHOT ? ["01", "02"] : store.get("ml_read", []).filter(id => FILE_IDS.includes(id));
const hooks = [];

const shellName = () => { const s = store.get("ml_shell", ""); return s ? s[0].toUpperCase() + s.slice(1) : I.t("shell.default"); };
const fill = s => String(s || "").replace("{shell}", shellName()).replace("{n}", read.length).replace("{total}", FILE_IDS.length);

function line(ctx, i) {
  const L = VOICE[ctx] || VOICE.chapter || [""];
  return fill(L[((i % L.length) + L.length) % L.length]);
}
function sectionLine(page, sec) {
  const P = AI.sections && AI.sections[page], L = P && P[sec];
  return L ? fill(L) : line("chapter", 0);
}
function voiceText(key) { return fill(VOICE[key]); }

function markRead(id) {
  if (!FILE_IDS.includes(id) || read.includes(id)) return false;
  read = read.concat(id);
  if (!SHOT) store.set("ml_read", read);
  hooks.forEach(f => f());
  return true;
}

function tickClock() {
  const d = new Date();
  $$("[data-clock]").forEach(e => { e.textContent = I.clock(d, 2893); });
  $$("[data-clock2]").forEach(e => { e.textContent = now(); });
}

function introWipe() {
  const mb = $("#mbar");
  if (!mb || SHOT || RM || session.get("ml_wiped")) return;
  session.set("ml_wiped", "1");
  mb.classList.add("is-intro");
  const sw = D.createElement("i"); sw.className = "sweep"; D.body.appendChild(sw);
  setTimeout(() => sw.remove(), 1100);
}

function cursorFrame() {
  if (RM || !matchMedia("(pointer:fine)").matches) return;
  const f = D.createElement("i"); f.className = "cfr"; f.setAttribute("aria-hidden", "true"); D.body.appendChild(f);
  const SNAP = "[data-snap],.btn,.win__btn,.arch__list a,.seg button,.toc a,.tab,.task__start,.mbar__menu a,.mbar__menu button,.mbar__logo,.ico";
  let tx = -50, ty = -50, x = -50, y = -50, w = 22, h = 22, snap = null, moving = false;
  addEventListener("pointermove", e => {
    tx = e.clientX; ty = e.clientY;
    snap = e.target.closest ? e.target.closest(SNAP) : null;
    if (!moving) { moving = true; requestAnimationFrame(loop); }
  }, { passive: true });
  function loop() {
    let gx = tx - 11, gy = ty - 11, gw = 22, gh = 22;
    if (snap && snap.isConnected) { const r = snap.getBoundingClientRect(); gx = r.left - 3; gy = r.top - 3; gw = r.width + 6; gh = r.height + 6; }
    x += (gx - x) * .3; y += (gy - y) * .3; w += (gw - w) * .3; h += (gh - h) * .3;
    f.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    f.style.width = w.toFixed(1) + "px"; f.style.height = h.toFixed(1) + "px";
    f.classList.toggle("is-snap", !!snap);
    const settled = Math.abs(gx - x) < .3 && Math.abs(gy - y) < .3 && Math.abs(gw - w) < .3;
    if (settled) { moving = false; return; }
    requestAnimationFrame(loop);
  }
}

const GLITCH_SEL = "[data-kinetic],.intro__h,.win__title";
const GLYPHS = I.t("glyphs");
const BURST_MS = 240, COOLDOWN_MS = 1000, IDLE_MIN = 6000, IDLE_SPAN = 6000;
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

function splitChars(el) {
  if (el.dataset.gl) return;
  el.dataset.gl = "1";
  const text = el.textContent.replace(/\s+/g, " ").trim();
  const walker = D.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const frag = D.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(tok => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) { frag.appendChild(D.createTextNode(tok)); return; }
      const w = D.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
      for (const c of tok) { const s = D.createElement("span"); s.className = "ch"; s.textContent = c; s.dataset.c = c; w.appendChild(s); }
      frag.appendChild(w);
    });
    node.replaceWith(frag);
  });
  if (/^H[1-6]$/.test(el.tagName)) el.setAttribute("aria-label", text);
  else { const v = D.createElement("span"); v.className = "vh"; v.textContent = text; el.appendChild(v); }
}

function decode(el) {
  const chars = $$(".ch", el), t0 = performance.now(), per = Math.min(28, 520 / Math.max(1, chars.length)), run = 360;
  el.classList.add("gl-split");
  function step(t) {
    let done = true;
    chars.forEach((s, i) => {
      if (t >= t0 + i * per + run) { if (s.textContent !== s.dataset.c) s.textContent = s.dataset.c; s.classList.remove("scr"); }
      else { done = false; s.classList.add("scr"); s.textContent = glyph(); }
    });
    if (done) { el.classList.remove("gl-split"); return; }
    setTimeout(() => requestAnimationFrame(step), 45);
  }
  requestAnimationFrame(step);
}

function glitch(el) {
  if (RM || SHOT || D.hidden || !el || el.dataset.glBusy) return;
  const chars = $$(".ch", el);
  if (!chars.length) return;
  el.dataset.glBusy = "1";
  const k = Math.max(1, Math.min(3, Math.round(chars.length * .3))), picked = new Set();
  while (picked.size < k) picked.add(chars[(Math.random() * chars.length) | 0]);
  picked.forEach(s => { s.classList.add("hj"); if (Math.random() < .5) s.textContent = glyph(); });
  el.classList.add("gl-split");
  if (Math.random() < .55) el.classList.add("tear");
  setTimeout(() => {
    picked.forEach(s => { s.classList.remove("hj"); s.textContent = s.dataset.c; });
    el.classList.remove("gl-split", "tear");
  }, BURST_MS);
  setTimeout(() => { delete el.dataset.glBusy; }, COOLDOWN_MS);
}

function glitchTitles() {
  const els = $$(GLITCH_SEL);
  els.forEach(splitChars);
  if (RM || SHOT || !("IntersectionObserver" in window)) return;
  const timers = new Map();
  const idle = el => { timers.set(el, setTimeout(() => { glitch(el); idle(el); }, IDLE_MIN + Math.random() * IDLE_SPAN)); };
  const io = new IntersectionObserver(es => es.forEach(en => {
    const el = en.target;
    if (en.isIntersecting) {
      if (!el.dataset.decoded) { el.dataset.decoded = "1"; decode(el); }
      if (!timers.has(el)) idle(el);
    } else { clearTimeout(timers.get(el)); timers.delete(el); }
  }), { threshold: .2 });
  els.forEach(el => {
    io.observe(el);
    const host = el.closest(".win__bar,.achrome") || el;
    host.addEventListener("pointerenter", () => glitch(el));
  });
}

function loadScript(name) {
  return new Promise((res, rej) => {
    const s = D.createElement("script");
    s.src = new URL("assets/js/" + name, ROOT).href;
    s.onload = res; s.onerror = () => rej(new Error("script failed: " + name));
    D.body.appendChild(s);
  });
}
function lazyField() {
  if (!$("[data-field]")) return;
  const go = () => loadScript("field.js").catch(err => console.warn("[ml core]", err.message));
  if (SHOT) return go();
  const idle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 250 }) : f => setTimeout(f, 60);
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", () => idle(go), { once: true }); else idle(go);
}

function counterpart(lang) {
  if (D.body.classList.contains("p-404")) return new URL(lang === "ru" ? "ru/404.html" : "404.html", ROOT).href;
  const base = ROOT.pathname, path = location.pathname;
  const rel = (path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "")).replace(/^ru(\/|$)/, "");
  const q = new URLSearchParams(location.search); q.delete("lang");
  const qs = q.toString();
  return new URL((lang === "ru" ? "ru/" : "") + rel, ROOT).href + (qs ? "?" + qs : "") + location.hash;
}
function langSwitch() {
  const bar = $("#mbar");
  if (!bar || $(".mbar__lang", bar)) return;
  const nav = D.createElement("nav");
  nav.className = "mbar__lang"; nav.setAttribute("aria-label", I.t("lang.label"));
  ["ru", "en"].forEach(l => {
    const a = D.createElement("a");
    a.href = counterpart(l); a.hreflang = l; a.lang = l; a.textContent = l.toUpperCase(); a.title = I.t("lang." + l);
    if (l === LANG) a.setAttribute("aria-current", "true");
    a.addEventListener("click", () => store.set("ml_lang", l));
    nav.appendChild(a);
  });
  const sp = $(".mbar__sp", bar);
  if (sp) sp.after(nav); else bar.appendChild(nav);
}

window.ML = {
  $, $$, Q, SHOT, RM, store, session, clamp, pad, now, hooks, ROOT, HOME, LANG, I, CHAPTERS, FILE_IDS, counterpart,
  line, sectionLine, voiceText, markRead, shellName, glitch, read: () => read.slice()
};

if (Q.has("touch") || matchMedia("(pointer:coarse)").matches) R.classList.add("is-touch");
tickClock(); setInterval(tickClock, 15000);
const self = D.body.dataset.file;
if (self && !SHOT) markRead(self);
langSwitch();
introWipe();
cursorFrame();
glitchTitles();
lazyField();
})();
