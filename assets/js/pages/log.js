/* log.js - SHIP.LOG page: changelog as curator log records, kind and shell filters, countdown to planned records, forecast journal. Loaded only by pages/log.html, before core.js. */
(() => {
"use strict";
const AI = window.ML_AI_LINES;
const LANG = document.documentElement.lang === "en" ? "en" : "ru";
const SECTION_LINES = {
  ru: {
    intro: "Бортовой журнал. Каждое обновление игры, свежее сверху.",
    log: "Фильтры над лентой: по типу записи и по шеллу.",
    forecast: "Прогнозы с датой проверки. Ошибки я не стираю.",
    src: "Ссылки на первоисточники. Проверяйте меня."
  },
  en: {
    intro: "Ship's log. Every game update, newest on top.",
    log: "Filters above the feed: by record type and by shell.",
    forecast: "Forecasts with a check date. I keep the misses.",
    src: "Links to primary sources. Check my work."
  }
}[LANG];
if (AI) window.ML_AI_LINES = Object.assign({}, AI, { sections: Object.assign({}, AI.sections, { log: SECTION_LINES }) });

const VOICE = {
 ru: {
  "launch": "Запись 001. Игроки на поверхности, пик онлайна записан.",
  "cryo-archive": "Путь на орбиту открыли сами игроки. Протокол ARG сохранён.",
  "season-2": "Nightfall: новый шелл, новая зона, прогрессия Cradle.",
  "director-change": "Смена руководства. На геймплей запись не влияет.",
  "vault-breaker": "Первый PvE-режим. Допущены соло, дуо и трио.",
  "volt-thrower-cut": "Урон V22 урезан. Цифры сверены с заметкой разработчиков.",
  "patch-1152": "Частичный откат нерфа. Магазин KKV-9SD увеличен.",
  "ordnance-heist": "Ивент на несколько забегов. Награда: первое силовое оружие.",
  "patch-1155": "Награды ивента повышены. Ключей за шаблон втрое больше.",
  "patch-119": "Арморий CyberAcme пополнен. Цены в Commendations снижены.",
  "roadmap": "Официальный план. Трёхмесячные сезоны отменены.",
  "nightfall-refresh": "Полный сброс прогресса. Косметика и валюта сохранены.",
  "vault-breaker-return": "Плановая запись. Окно режима с 20 октября по 9 ноября.",
  "symbiosis": "Плановая запись. PvE без охоты, Bishop и Tick Queen.",
  "march-2027": "Плановая запись. Новая зона и противники, дата не объявлена."
 },
 en: {
  "launch": "Record 001. Runners on the surface, peak player count logged.",
  "cryo-archive": "The players opened the route to orbit themselves. ARG protocol archived.",
  "season-2": "Nightfall: a new shell, a new zone, Cradle progression.",
  "director-change": "Change of leadership. This record does not touch gameplay.",
  "vault-breaker": "First PvE mode. Solo, duo and trio admitted.",
  "volt-thrower-cut": "V22 damage cut. Numbers checked against the developer notes.",
  "patch-1152": "Nerf partly rolled back. KKV-9SD magazine is bigger.",
  "ordnance-heist": "An event spread over several runs. Reward: the first power weapon.",
  "patch-1155": "Event rewards raised. Three keys per template instead of one.",
  "patch-119": "CyberAcme armory restocked. Commendation prices lowered.",
  "roadmap": "Official plan. Three-month seasons are cancelled.",
  "nightfall-refresh": "Full progress wipe. Cosmetics and currency stay.",
  "vault-breaker-return": "Planned record. Mode window runs 20 October to 9 November.",
  "symbiosis": "Planned record. PvE with no Runner hunting, Bishop, the Tick Queen.",
  "march-2027": "Planned record. New zone and enemies, no date announced."
 }
}[LANG];
const KIND_ORDER = ["season", "patch", "event", "balance", "roadmap", "studio"];
const FC_KEYS = ["open", "confirmed", "busted", "partial"];
const T = (k, v) => window.ML_I18N.t(k, v);
const PL = (k, n) => window.ML_I18N.pl(k, n);
const RELEASE_HOUR = "T17:00:00Z";
const URL_RE = /https?:\/\/\S+/;

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = n => String(n).padStart(2, "0");
const pad3 = n => String(n).padStart(3, "0");
const fmtDate = d => window.ML_I18N.dmy(d);
const chip = c => '<span class="chip chip--' + esc(c) + '">' + esc(c) + "</span>";
const shellsOf = e => (e.affects || []).filter(a => a.indexOf("shell:") === 0).map(a => a.slice(6));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

/** @param {object} e @returns {string} */
function voiceFor(e) {
  return VOICE[e.id] || T(e.status === "planned" ? "lg.voice.planned" : "lg.voice.done");
}

/** @param {string} date @param {number} now @returns {{ms:number,d:number,h:number,m:number}} */
function left(date, now) {
  const ms = Math.max(0, Date.parse(date + RELEASE_HOUR) - now), mins = Math.floor(ms / 60000);
  return { ms, d: Math.floor(mins / 1440), h: Math.floor(mins / 60) % 24, m: mins % 60 };
}

/** @param {{d:number,h:number,m:number,ms:number}} t @returns {string} */
function countdownHtml(t) {
  if (!t.ms) return "<b>" + T("lg.pending") + "</b>";
  return "<b>" + pad2(t.d) + "</b><small>" + T("time.d") + "</small><b>" + pad2(t.h) + "</b><small>" + T("time.h") + "</small><b>" + pad2(t.m) + "</b><small>" + T("time.m") + "</small>";
}

function boot() {
  const ML = window.ML, D = document;
  const box = D.querySelector("[data-lg]");
  if (!ML || !box) return;
  const { $, $$, Q, SHOT, store } = ML;
  const KINDS = T("lg.kinds");
  const CL = (window.ML_CHANGELOG || []).slice();
  const chrono = CL.slice().sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const num = new Map(chrono.map((e, i) => [e.id, i + 1]));
  const byDate = CL.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const planned = byDate.filter(e => e.status === "planned");
  const done = byDate.filter(e => e.status !== "planned");
  const nowMs = () => Date.now();
  const nextPlanned = planned.slice().sort((a, b) => a.date.localeCompare(b.date)).find(e => left(e.date, nowMs()).ms > 0);
  const myShell = SHOT ? "" : String(store.get("ml_shell", "") || "").toLowerCase();
  const kindsPresent = KIND_ORDER.filter(k => CL.some(e => e.kind === k)).concat(Object.keys(KINDS).filter(k => KIND_ORDER.indexOf(k) < 0 && CL.some(e => e.kind === k)));
  const shellsPresent = Array.from(new Set(CL.flatMap(shellsOf))).sort();
  let kind = kindsPresent.indexOf(Q.get("kind")) >= 0 ? Q.get("kind") : "";
  let shell = shellsPresent.indexOf(Q.get("shell")) >= 0 ? Q.get("shell") : "";

  /** @param {object} e @returns {string} */
  function record(e) {
    const isPlan = e.status === "planned", sh = shellsOf(e), mine = myShell && sh.indexOf(myShell) >= 0;
    const tags = (e.affects || []).map(a => '<span class="lg-aff' + (a.indexOf("shell:") === 0 ? " is-shell" : "") + '">' + esc(a.replace(":", " / ")) + "</span>").join("");
    return '<li class="lg-r' + (isPlan ? " is-plan" : "") + (nextPlanned && nextPlanned.id === e.id ? " is-next" : "") + '" data-id="' + esc(e.id) + '" data-kind="' + esc(e.kind) + '" data-shells="' + esc(sh.join(" ")) + '">' +
      '<div class="lg-r__m"><span class="lg-r__n">' + T(isPlan ? "lg.plan" : "lg.rec") + " " + pad3(num.get(e.id)) + '</span><time datetime="' + esc(e.date) + '">' + fmtDate(e.date) + "</time>" +
      '<span class="lg-r__k">' + esc((KINDS[e.kind] || e.kind).toUpperCase()) + "</span>" + (e.patch ? '<span class="d-patch">' + esc(e.patch) + "</span>" : "") +
      (isPlan ? '<p class="lg-r__cd" data-cd="' + esc(e.date) + '" aria-label="' + T("lg.cdLabel") + '">' + countdownHtml(left(e.date, nowMs())) + "</p>" : "") + "</div>" +
      '<div class="lg-r__b"><h3 class="lg-r__t">' + esc(e.title) + (mine ? '<span class="lg-mine">' + T("lg.mine") + "</span>" : "") + "</h3>" +
      '<p class="lg-r__v"><b>' + T("curator.tag") + "</b><span data-voice>" + esc(voiceFor(e)) + "</span></p>" +
      '<p class="lg-r__x">' + esc(e.text) + " " + chip(e.chip) + "</p>" +
      '<div class="lg-r__f">' + (tags ? '<span class="lg-r__a">' + tags + "</span>" : "") + (e.src ? '<a class="lg-r__s" href="' + esc(e.src) + '" target="_blank" rel="noopener">' + T("src") + "</a>" : "") + "</div></div></li>";
  }

  /** @param {string} title @param {object[]} list @param {string} cls @returns {string} */
  function group(title, list, cls) {
    if (!list.length) return "";
    return '<p class="lg-g ' + cls + ' lbl"><span>' + title + "</span><span>" + list.length + " " + PL("fc.entries", list.length) + '</span></p><ol class="lg-l">' + list.map(record).join("") + "</ol>";
  }

  const match = e => (!kind || e.kind === kind) && (!shell || shellsOf(e).indexOf(shell) >= 0);

  function paintButtons() {
    $$("[data-fkind] button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === kind)));
    $$("[data-fshell] button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === shell)));
  }

  function render() {
    const P = planned.filter(match), F = done.filter(match), n = P.length + F.length;
    box.innerHTML = n ? group(T("lg.ahead"), P, "is-plan") + group(T("lg.logged"), F, "is-done") :
      '<p class="lg-empty">' + T("lg.empty") + ' <button type="button" class="btn" data-reset>' + T("lg.reset") + "</button></p>";
    const c = $("[data-lg-count]");
    if (c) c.textContent = T("lg.shown", { n, total: CL.length });
    paintButtons();
    if (!SHOT) {
      const u = new URL(location.href);
      ["kind", "shell"].forEach(k => u.searchParams.delete(k));
      if (kind) u.searchParams.set("kind", kind);
      if (shell) u.searchParams.set("shell", shell);
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    }
  }

  /** @param {string} label @param {string} v @param {number} count @returns {string} */
  const fbtn = (label, v, count) => '<button type="button" data-v="' + esc(v) + '" aria-pressed="false">' + esc(label) + "<small>" + count + "</small></button>";
  const fk = $("[data-fkind]"), fs = $("[data-fshell]");
  fk.innerHTML = fbtn(T("lg.all"), "", CL.length) + kindsPresent.map(k => fbtn(KINDS[k] || k, k, CL.filter(e => e.kind === k).length)).join("");
  fs.innerHTML = fbtn(T("lg.allShells"), "", CL.length) + shellsPresent.map(s => fbtn(cap(s) + (s === myShell ? " *" : ""), s, CL.filter(e => shellsOf(e).indexOf(s) >= 0).length)).join("");
  fk.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { kind = b.dataset.v; render(); } });
  fs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { shell = b.dataset.v; render(); } });
  box.addEventListener("click", e => { if (e.target.closest("[data-reset]")) { kind = ""; shell = ""; render(); } });
  $("[data-lg-filters]").hidden = false;

  const stat = $("[data-lg-stat]");
  if (stat) stat.textContent = T("lg.stat", { done: done.length, planned: planned.length });
  const tot = $("[data-lg-total]");
  if (tot) tot.textContent = CL.length + " " + PL("fc.entries", CL.length);
  const next = $("[data-next]");
  if (next) {
    if (nextPlanned) $("[data-next-t]").textContent = nextPlanned.title + ", " + fmtDate(nextPlanned.date);
    else next.hidden = true;
  }

  function tick() {
    const now = nowMs();
    $$("[data-cd]").forEach(el => { el.innerHTML = countdownHtml(left(el.dataset.cd, now)); });
    const c = $("[data-next-c]");
    if (c && nextPlanned) c.innerHTML = countdownHtml(left(nextPlanned.date, now));
  }

  forecast($, $$);
  render();
  tick();
  if (!SHOT) setInterval(tick, 20000);
}

/** @param {Function} $ @param {Function} $$ */
function forecast($, $$) {
  const ol = $("[data-lg-fc]");
  if (!ol) return;
  const P = (window.ML_PREDICTIONS || []).slice().sort((a, b) => (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1) || b.opened.localeCompare(a.opened));
  ol.innerHTML = P.map((p, i) => {
    const ours = p.chip === "ours", vUrl = p.verdict && (p.verdict.match(URL_RE) || [""])[0];
    const vText = p.verdict ? p.verdict.replace(/\s*https?:\/\/\S+/g, "").trim() : "";
    return '<li class="lg-f is-' + esc(p.status) + '"><div class="lg-f__h"><span class="lg-f__id">F-' + pad2(i + 1) + " // " + T("fc.logged", { date: fmtDate(p.opened) }) + '</span><span class="lg-f__s">' + esc(FC_KEYS.includes(p.status) ? T("fc." + p.status) : p.status) + "</span>" +
      (ours ? '<span class="tag">' + T("fc.ours") + "</span>" + chip("theory") : chip(p.chip)) + "</div>" +
      '<p class="lg-f__c">' + esc(p.claim) + "</p>" +
      '<p class="lg-f__b"><b>' + T("fc.basis") + "</b> " + esc(p.basis) + "</p>" +
      '<p class="lg-f__m lbl"><span>' + esc(T("fc.check", { v: p.resolves_by })) + "</span>" + (p.src ? '<a href="' + esc(p.src) + '" target="_blank" rel="noopener">' + T("src") + "</a>" : "") + "</p>" +
      (vText ? '<p class="lg-f__v"><b>' + T("fc.verdict") + "</b> " + esc(vText) + (vUrl ? ' <a href="' + esc(vUrl) + '" target="_blank" rel="noopener">' + T("fc.proof") + "</a>" : "") + "</p>" : "") + "</li>";
  }).join("");
  const open = P.filter(p => p.status === "open").length;
  const s = $("[data-fc-stat]");
  if (s) s.textContent = T("fc.stat", { open, closed: P.length - open });
  const t = $("[data-fc-total]");
  if (t) t.textContent = P.length + " " + PL("fc.total", P.length);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
