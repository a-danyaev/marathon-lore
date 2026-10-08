(() => {
"use strict";
const ML = window.ML;
if (!ML) return;
const D = document, { $, $$, SHOT, clamp, pad, I } = ML;
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = d => I.dm(d);
const fmtFull = d => I.dmy(d);
const chip = c => '<span class="chip chip--' + esc(c) + '">' + esc(c) + "</span>";

const DAY = 864e5;
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const startOf = iso => Date.parse(iso + "T00:00:00");
const endOf = iso => startOf(iso) + DAY;
const firstLine = s => { const m = String(s || "").match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : String(s || ""); };
const left = ms => {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400);
  return (d ? d + " " + I.t("time.d") + " " : "") + pad(Math.floor(s / 3600) % 24) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
};

function air() {
  const box = $("[data-air]");
  if (!box) return;
  const CL = (window.ML_CHANGELOG || []).slice(), META = window.ML_CHANGELOG_META || {};
  const forced = ML.Q.get("today");
  const today = forced && /^\d{4}-\d{2}-\d{2}$/.test(forced) ? forced : ymd(new Date());
  const offset = forced ? startOf(today) + 12 * 36e5 - Date.now() : 0;
  const clock = () => Date.now() + offset;
  const href = e => e.link ? new URL(e.link, ML.HOME).href : "";
  const title = e => e.link ? '<a href="' + esc(href(e)) + '">' + esc(e.title) + "</a>" : esc(e.title);
  const now = CL.filter(e => e.ends && e.date <= today && today <= e.ends).sort((a, b) => a.ends.localeCompare(b.ends));
  const live = new Set(now.map(e => e.id));
  const last = CL.filter(e => e.status === "done" && e.date <= today && !live.has(e.id)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const next = CL.filter(e => e.date > today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const nowBox = $("[data-air-now]"), lastBox = $("[data-air-last]"), nextBox = $("[data-air-next]");
  nowBox.innerHTML = now.length ? now.map(e => '<li class="air__live" data-from="' + startOf(e.date) + '" data-to="' + endOf(e.ends) + '"><p class="air__lt"><i class="air__dot" aria-hidden="true"></i><b>' + title(e) + "</b>" + chip(e.chip) + '</p><p class="air__lx"><span>' + fmt(e.date) + " - " + fmt(e.ends) + '</span><span>' + I.t("air.left") + ' <b data-left>--</b></span></p><span class="air__bar" aria-hidden="true"><i data-fill></i></span></li>').join("")
    : '<li class="air__none">' + esc(I.t("air.none")) + "</li>";
  const nn = $("[data-air-nown]"); if (nn) nn.textContent = now.length ? now.length + " " + I.pl("air.windows", now.length) : I.t("air.quiet");
  lastBox.innerHTML = last.map(e => '<li><span class="air__d">' + fmt(e.date) + '</span><p class="air__t"><b>' + title(e) + "</b><small>" + esc(firstLine(e.text)) + "</small></p>" + chip(e.chip) + "</li>").join("");
  nextBox.innerHTML = next.map(e => '<li data-at="' + startOf(e.date) + '"' + (e.approx ? " data-approx" : "") + '><span class="air__d">' + (e.approx ? "~" + I.my(e.date) : fmt(e.date)) + '</span><p class="air__t"><b>' + title(e) + '</b></p><span class="air__c" data-cd>' + (e.approx ? I.t("air.nodate") : "") + "</span></li>").join("");
  const cap = $("[data-air-cap]"); if (cap && META.captured) cap.textContent = fmtFull(META.captured);
  const mb = $("[data-air-mbar]"); if (mb && now[0]) mb.textContent = now[0].title.toUpperCase();
  box.classList.add("is-on");

  const pkt = $("[data-air-pkt]"), lives = $$(".air__live", nowBox), cds = $$("li[data-at]:not([data-approx]) [data-cd]", nextBox);
  const tick = () => {
    const t = clock();
    lives.forEach(li => {
      const from = +li.dataset.from, to = +li.dataset.to, f = clamp((t - from) / (to - from), 0, 1);
      $("[data-left]", li).textContent = left(to - t);
      $("[data-fill]", li).style.width = ((1 - f) * 100).toFixed(2) + "%";
    });
    cds.forEach(c => { const ms = +c.closest("li").dataset.at - t, d = Math.ceil(ms / DAY); c.textContent = ms <= 0 ? I.t("air.live") : I.t("air.in", { t: d > 2 ? d + " " + I.pl("air.days", d) : left(ms) }); });
    if (pkt) pkt.textContent = "PKT " + (Math.floor(t / 1000) & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  };
  tick();
  if (!SHOT) setInterval(tick, 1000);
}

function forecast() {
  const box = $("[data-fc]");
  if (!box) return;
  const P = (window.ML_PREDICTIONS || []).slice().sort((a, b) => (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1) || b.opened.localeCompare(a.opened));
  box.innerHTML = P.map((p, i) => {
    const ours = p.chip === "ours";
    return '<li><div class="fc__h"><span class="fc__id">F-' + pad(i + 1) + " // " + fmtFull(p.opened) + '</span><span class="fc__s' + (p.status === "busted" ? " is-busted" : "") + '">' + (["open", "confirmed", "busted", "partial"].includes(p.status) ? I.t("fc." + p.status) : esc(p.status)) + "</span>" + (ours ? '<span class="tag">' + I.t("fc.ours") + "</span>" + chip("theory") : chip(p.chip)) + "</div><p>" + esc(p.claim) + '</p><p class="fc__m lbl">' + esc(I.t("fc.check", { v: p.resolves_by })) + "</p>" + (p.verdict ? '<p class="fc__v">' + esc(p.verdict.replace(/\s*https?:\/\/\S+/g, "")) + "</p>" : "") + "</li>";
  }).join("");
  const open = P.filter(p => p.status === "open").length;
  const f = $("[data-fc-foot]"); if (f) f.innerHTML = "<span>" + P.length + " " + I.pl("fc.entries", P.length) + " // " + open + " OPEN</span><span>" + I.t("fc.closed", { n: P.length - open }) + "</span>";
}

function countdown() {
  const d = $("[data-d]");
  if (!d) return;
  const T = Date.parse("2026-12-08T17:00:00Z"), S = Date.parse("2026-09-24T17:00:00Z");
  const LOG = I.t("cnt.log");
  const pk = $("[data-cntpk]"), log = $("[data-cntlog]"), pct = $("[data-cntpct]"), H = $("[data-h]"), M = $("[data-m]"), Sx = $("[data-s]");
  const N = innerWidth < 821 ? 30 : 40;
  if (pk) { pk.innerHTML = "<i></i>".repeat(N); pk.style.gridTemplateColumns = "repeat(" + N + ",minmax(0,1fr))"; }
  const cells = pk ? Array.from(pk.children) : [];
  const tick = () => {
    const now = Date.now(), ms = Math.max(0, T - now), s = Math.floor(ms / 1000);
    d.textContent = pad(Math.floor(s / 86400)); H.textContent = pad(Math.floor(s / 3600) % 24); M.textContent = pad(Math.floor(s / 60) % 60);
    if (Sx) Sx.textContent = pad(s % 60);
    const f = clamp((now - S) / (T - S), 0, 1), full = Math.floor(f * N), sec = Math.floor(now / 1000);
    cells.forEach((c, i) => {
      c.className = i < full ? (i === sec % Math.max(1, full) ? "on hot" : "on") : i === full && ms > 0 ? "cur" : "";
    });
    if (pct) pct.textContent = (f * 100).toFixed(3) + "%";
    if (log) log.textContent = "> PKT 0x" + (sec & 0xffff).toString(16).toUpperCase().padStart(4, "0") + " // " + LOG[Math.floor(sec / 2) % LOG.length];
  };
  tick(); setInterval(tick, 1000);
}

air(); forecast(); countdown();
})();
