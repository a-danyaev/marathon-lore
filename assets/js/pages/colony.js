/* colony.js - file 04 only: curator lines for each section of the colony file. */
(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (!AI) return;
AI.sections = AI.sections || {};
AI.sections.colony = {
  ru: {
    intro: "Файл 04. Колония. Три катастрофы подряд.",
    three: "Вторжение, зараза, Аномалия. Каждая хуже предыдущей.",
    before: "New Cascadia до гибели: семь районов и спокойная жизнь.",
    deaths: "Хроника трёх смертей, по годам и по записям.",
    joy: "Joy: ИИ заботы, который решил, что сон милосерднее.",
    after: "Пустой город и карантин UESC. Отсюда начинается игра."
  },
  en: {
    intro: "File 04. The colony. Three disasters in a row.",
    three: "Invasion, contagion, the Anomaly. Each one worse than the last.",
    before: "New Cascadia before the fall: seven districts and a quiet life.",
    deaths: "A chronicle of three deaths, by year and by record.",
    joy: "Joy: a care AI that decided sleep was the kinder option.",
    after: "An empty city under UESC quarantine. This is where the game starts."
  }
}[document.documentElement.lang === "en" ? "en" : "ru"];
})();
