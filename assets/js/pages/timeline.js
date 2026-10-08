/* timeline.js - file 02 only: curator lines per section, live-lane status (plan or released) and the "now" marker by the reader's date. */
(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (AI) {
  AI.sections = AI.sections || {};
  AI.sections.timeline = {
   ru: {
    intro: "Файл 02. Хронология. Две ленты: лор и реальный мир.",
    "earth-mars": "Земля и Марс: голод, бунты и первая рампанси.",
    voyage: "Перелёт: Деймос становится кораблём, колония встаёт на грунт.",
    fall: "Падение: Pfhor, зараза, Аномалия. Подробности в файле 04.",
    silence: "Век тишины: шеллы, падение Pfhor, прибытие Equanimity.",
    live: "Реальный мир: даты выхода игры, а не события лора.",
    disputes: "Сверка: ключевые даты и открытые споры канона."
   },
   en: {
    intro: "File 02. Timeline. Two lanes: lore and the real world.",
    "earth-mars": "Earth and Mars: famine, riots and the first rampancy.",
    voyage: "The voyage: Deimos becomes a ship, the colony lands.",
    fall: "The fall: Pfhor, contagion, the Anomaly. Details in file 04.",
    silence: "A century of silence: shells, the Pfhor retreat, Equanimity arrives.",
    live: "Real world: the game's release dates, not lore events.",
    disputes: "Cross-check: key dates and open canon disputes."
   }
  }[document.documentElement.lang === "en" ? "en" : "ru"];
}
const pad = n => String(n).padStart(2, "0");
const now = new Date();
const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
const items = Array.from(document.querySelectorAll(".tl--live [data-date]"));
let marked = false;
items.forEach(li => {
  const plan = li.dataset.date > today, st = li.querySelector(".tl__st");
  li.classList.toggle("is-plan", plan);
  if (st) st.textContent = window.ML_I18N.t(plan ? "tl.plan" : "tl.out");
  if (plan && !marked) {
    marked = true;
    const m = document.createElement("li");
    m.className = "tl__now";
    m.textContent = window.ML_I18N.t("tl.now", { date: window.ML_I18N.dmy(today) });
    li.before(m);
  }
});
})();
