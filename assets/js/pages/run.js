/* run.js - MAPS.EXE «Карты зон»: tabs over the MapGenie interactive maps, lazy iframe per zone, loading and fallback states. Loaded only by pages/run.html, after core.js and page.js. */
(() => {
"use strict";
const D = document;
const stage = D.querySelector("[data-mp-stage]");
if (!stage) return;
const MG = "https://mapgenie.io/marathon/maps/";
const I = window.ML_I18N;
const NOTES = {
  ru: {
    "perimeter": "Perimeter: стартовая зона, исследовательский комплекс колонии New Cascadia.",
    "dire-marsh": "Dire Marsh: аграрный сектор колонии со следами карантина, с 3-го уровня Раннера.",
    "night-marsh": "Night Marsh: отдельной карты нет, показан Dire Marsh - та же зона без света.",
    "outpost": "Outpost: дальний сектор колонии с ценным ломом, с 12-го уровня Раннера.",
    "cryo-archive": "Cryo Archive: эндгейм на борту UESC Marathon, 25-й уровень, отряд из трёх, соло не пускают."
  },
  en: {
    "perimeter": "Perimeter: the starting zone, a research complex of the New Cascadia colony.",
    "dire-marsh": "Dire Marsh: the colony's farming sector, with traces of the quarantine. Opens at Runner level 3.",
    "night-marsh": "Night Marsh: there is no separate map, so this is Dire Marsh, the same zone with the lights out.",
    "outpost": "Outpost: a far sector of the colony with valuable salvage. Opens at Runner level 12.",
    "cryo-archive": "Cryo Archive: the endgame aboard UESC Marathon. Level 25, squads of three, no solo entry."
  }
}[I.lang];
const ZONES = {
  "perimeter": { name: "Perimeter", map: "perimeter", note: NOTES["perimeter"], chip: "canon" },
  "dire-marsh": { name: "Dire Marsh", map: "dire-marsh", note: NOTES["dire-marsh"], chip: "canon" },
  "night-marsh": { name: "Night Marsh", map: "dire-marsh", note: NOTES["night-marsh"], chip: "canon" },
  "outpost": { name: "Outpost", map: "outpost", note: NOTES["outpost"], chip: "canon" },
  "cryo-archive": { name: "Cryo Archive", map: "cryo-archive", note: NOTES["cryo-archive"], chip: "canon" }
};
const SLOW_MS = 12000;
const tabs = Array.from(D.querySelectorAll("[data-mp-tabs] [data-zone]"));
const note = D.querySelector("[data-mp-note]");
const outs = Array.from(D.querySelectorAll("[data-mp-out]"));
const load = D.querySelector("[data-mp-load]");
const loadT = D.querySelector("[data-mp-load-t]");
const loadZ = D.querySelector("[data-mp-load-z]");
const frames = {};
let current = null, slowT = 0;

const pick = id => (ZONES[id] ? id : "perimeter");
const urlOf = z => MG + ZONES[z].map;

function setLoading(z, state) {
  load.hidden = state === "ready";
  load.classList.toggle("is-slow", state === "slow");
  loadT.textContent = I.t(state === "slow" ? "map.slow" : "map.loading");
  loadZ.textContent = ZONES[z].name.toUpperCase() + " // MAPGENIE.IO";
}

function frameFor(z) {
  const key = ZONES[z].map;
  if (frames[key]) return frames[key];
  const f = D.createElement("iframe");
  f.className = "mp-frame";
  f.title = I.t("map.title", { zone: ZONES[z].name });
  f.allow = "fullscreen";
  f.referrerPolicy = "strict-origin-when-cross-origin";
  f.addEventListener("load", () => { f.dataset.ready = "1"; if (current && ZONES[current].map === key) { clearTimeout(slowT); setLoading(current, "ready"); } });
  f.src = urlOf(z);
  stage.appendChild(f);
  return (frames[key] = f);
}

function show(z, push) {
  z = pick(z);
  if (z === current) return;
  current = z;
  const zone = ZONES[z];
  tabs.forEach(t => {
    const on = t.dataset.zone === z;
    t.setAttribute("aria-selected", on ? "true" : "false");
    t.tabIndex = on ? 0 : -1;
    const box = t.parentElement;
    if (on && box.scrollWidth > box.clientWidth) box.scrollLeft = Math.max(0, t.offsetLeft - (box.clientWidth - t.offsetWidth) / 2);
  });
  stage.setAttribute("aria-labelledby", "tab-" + z);
  note.innerHTML = "";
  note.append(zone.note + " ");
  const chip = D.createElement("span"); chip.className = "chip chip--" + zone.chip; chip.textContent = zone.chip; note.appendChild(chip);
  outs.forEach(a => { a.href = urlOf(z); });
  const f = frameFor(z);
  Object.values(frames).forEach(x => { x.hidden = x !== f; });
  clearTimeout(slowT);
  if (f.dataset.ready) setLoading(z, "ready");
  else { setLoading(z, "loading"); slowT = setTimeout(() => { if (current === z && !f.dataset.ready) setLoading(z, "slow"); }, SLOW_MS); }
  if (push) history.replaceState(null, "", "?zone=" + z + location.hash);
  const zn = D.querySelector("[data-run-zname]"); if (zn) zn.textContent = zone.name;
}

tabs.forEach((t, i) => {
  t.addEventListener("click", e => { e.preventDefault(); show(t.dataset.zone, true); });
  t.addEventListener("keydown", e => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = tabs[(i + d + tabs.length) % tabs.length];
    n.focus(); show(n.dataset.zone, true);
  });
});

show(new URLSearchParams(location.search).get("zone"), false);
})();
