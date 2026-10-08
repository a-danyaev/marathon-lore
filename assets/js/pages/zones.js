(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (!AI) return;
const LINES = {
 ru: {
  intro: "Файл 09. Пять зон высадки. Начинайте с Perimeter.",
  route: "Маршрут: от Perimeter к Cryo Archive.",
  perimeter: "Perimeter: старт, релейные станции, Tick Queen к 8 декабря.",
  "dire-marsh": "Dire Marsh: Аномалия и запертый ИИ Darius.",
  "night-marsh": "Night Marsh: тьма, WARDEN, Skrac.",
  outpost: "Outpost: армия UESC и общий сон колонии.",
  "cryo-archive": "Cryo Archive: эндгейм на орбите, отряд из трёх.",
  "next-zone": "Новая зона: март 2027, подробностей нет."
 },
 en: {
  intro: "File 09. Five drop zones. Start with Perimeter.",
  route: "The route: from Perimeter to the Cryo Archive.",
  perimeter: "Perimeter: the start, relay stations, the Tick Queen by 8 December.",
  "dire-marsh": "Dire Marsh: the Anomaly and Darius, an AI under lock.",
  "night-marsh": "Night Marsh: darkness, WARDEN, Skrac.",
  outpost: "Outpost: the UESC army and the colony's shared sleep.",
  "cryo-archive": "Cryo Archive: the endgame in orbit, squads of three.",
  "next-zone": "New zone: March 2027, no details yet."
 }
}[document.documentElement.lang === "en" ? "en" : "ru"];
window.ML_AI_LINES = Object.assign({}, AI, { sections: Object.assign({}, AI.sections, { zones: LINES }) });
})();
