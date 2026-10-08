(() => {
"use strict";
const D = document, box = D.querySelector("[data-rs-find]");
if (!box) return;
const input = box.querySelector("input"), out = box.querySelector("[data-rs-n]");
const items = Array.from(D.querySelectorAll(".rs-item"));
const index = items.map(li => ({ li, text: li.textContent.toLowerCase() + " " + (li.querySelector("a") || {}).href }));
const sections = Array.from(D.querySelectorAll(".dossier")).filter(s => s.querySelector(".rs-item"));
box.hidden = false;
function apply() {
  const q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
  let shown = 0;
  index.forEach(({ li, text }) => {
    const hit = words.every(w => text.includes(w));
    li.hidden = !hit;
    if (hit) shown++;
  });
  sections.forEach(s => s.classList.toggle("rs-empty", !!q && !s.querySelector(".rs-item:not([hidden])")));
  out.textContent = window.ML_I18N.t("rs.found", { n: shown, total: items.length });
}
input.addEventListener("input", apply);
input.addEventListener("keydown", e => { if (e.key === "Escape") { input.value = ""; apply(); } });
})();
