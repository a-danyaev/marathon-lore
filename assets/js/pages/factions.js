(() => {
"use strict";
const AI = window.ML_AI_LINES;
if (!AI) return;
const LINES = {
 ru: {
  intro: "Файл 07. Шесть нанимателей, шесть агентов. Читайте по порядку.",
  contracts: "Контракт, рейд, сдача, репутация. Петля простая.",
  cyberacme: "CyberAcme: брокер всех контрактов и арморий C.A.R.R.I.",
  nucaloric: "NuCaloric: снабжение, лечение, тихое расследование.",
  traxus: "Traxus: деньги, права возврата, чужие руки.",
  mida: "MIDA: саботаж, малварь, революция под присмотром.",
  arachne: "Arachne: PvP, охота на Раннеров, смерть как данные.",
  sekiguchi: "Sekiguchi: черви, шеллы, перенос сознания.",
  network: "Сеть: витрина вражды и сделки за ней.",
  uesc: "UESC: не фракция, а противник всех Раннеров."
 },
 en: {
  intro: "File 07. Six employers, six agents. Read them in order.",
  contracts: "Contract, raid, turn-in, reputation. A simple loop.",
  cyberacme: "CyberAcme: broker of every contract and the C.A.R.R.I armory.",
  nucaloric: "NuCaloric: supply, medicine, a quiet investigation.",
  traxus: "Traxus: money, salvage rights, other people's hands.",
  mida: "MIDA: sabotage, malware, a revolution with a handler.",
  arachne: "Arachne: PvP, Runner hunts, death as data.",
  sekiguchi: "Sekiguchi: worms, shells, mind transfer.",
  network: "The network: a shop window of feuds, deals behind it.",
  uesc: "UESC: the enemy of every Runner, outside the faction system."
 }
}[document.documentElement.lang === "en" ? "en" : "ru"];
window.ML_AI_LINES = Object.assign({}, AI, { sections: Object.assign({}, AI.sections, { factions: LINES }) });
})();
