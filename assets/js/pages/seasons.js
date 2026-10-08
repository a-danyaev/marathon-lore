(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (AI) {
  const LINES = {
   ru: {
    intro: "Файл 10. Сезоны и обновления. Лента сверху.",
    timeline: "Лента: от релиза 5 марта до марта 2027.",
    s1: "Season 1: золотая лихорадка и первый вайп.",
    s2: "Nightfall: Sentinel, Night Marsh, Cradle.",
    "vault-breaker": "Vault Breaker: PvE в Cryo Archive. Снова с 20 октября.",
    ordnance: "Ordnance Heist: Firestorm, три ключа, три шкафа.",
    roadmap: "Роадмап 24.09: без Season 3, другой ритм.",
    refresh: "Nightfall Refresh: сброс и долг перед ONI.",
    symbiosis: "Symbiosis 8 декабря: PvE, Bishop, Tick Queen.",
    "march-2027": "Март 2027: новая зона, новые противники.",
    cradle: "Cradle: лут в энергию, энергия в ветки."
   },
   en: {
    intro: "File 10. Seasons and updates. Feed on top.",
    timeline: "The feed: from the 5 March launch to March 2027.",
    s1: "Season 1: a gold rush and the first wipe.",
    s2: "Nightfall: Sentinel, Night Marsh, Cradle.",
    "vault-breaker": "Vault Breaker: PvE in the Cryo Archive. Back from 20 October.",
    ordnance: "Ordnance Heist: Firestorm, three keys, three lockers.",
    roadmap: "Roadmap of 24 September: no Season 3, a different pace.",
    refresh: "Nightfall Refresh: a wipe and a debt to ONI.",
    symbiosis: "Symbiosis on 8 December: PvE, Bishop, the Tick Queen.",
    "march-2027": "March 2027: a new zone, new enemies.",
    cradle: "Cradle: loot into energy, energy into branches."
   }
  }[document.documentElement.lang === "en" ? "en" : "ru"];
  window.ML_AI_LINES = Object.assign({}, AI, { sections: Object.assign({}, AI.sections, { seasons: LINES }) });
}
document.addEventListener("DOMContentLoaded", () => {
  const items = Array.from(document.querySelectorAll(".tl__i[data-date]"));
  const now = Date.now();
  const future = items.filter(li => !li.classList.contains("tl__i--x") && Date.parse(li.dataset.date) > now);
  items.forEach(li => { if (!li.classList.contains("tl__i--x") && Date.parse(li.dataset.date) <= now) li.classList.add("is-past"); });
  if (future.length) future[0].classList.add("is-next");
});
})();
