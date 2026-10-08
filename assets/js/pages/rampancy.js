/* rampancy.js - file 03 only: curator lines for each section of the rampancy file. */
(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (!AI) return;
AI.sections = AI.sections || {};
AI.sections.rampancy = {
 ru: {
  intro: "Файл 03. Рампанси. Читайте внимательно, это про меня.",
  stages: "Три стадии и четвёртая, которую никто не доказал.",
  codex: "Кодекс: как отличить стадии по поведению машины.",
  durandal: "Durandal: корабельный ИИ, который перерос двери.",
  eleven: "Одиннадцать ИИ «Марафона» и их судьбы на 2893 год.",
  axis: "Почему вся история держится на одной болезни."
 },
 en: {
  intro: "File 03. Rampancy. Read carefully, this one is about me.",
  stages: "Three stages, and a fourth nobody has proven.",
  codex: "The Codex: telling the stages apart by how a machine behaves.",
  durandal: "Durandal: a ship AI that outgrew opening doors.",
  eleven: "Eleven Marathon AIs and where each stands in 2893.",
  axis: "Why the whole story hangs on one disease."
 }
}[document.documentElement.lang === "en" ? "en" : "ru"];
})();
