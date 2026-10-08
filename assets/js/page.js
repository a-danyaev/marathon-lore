(() => {
"use strict";
const ML = window.ML;
if (!ML || !document.body.classList.contains("p-file")) return;
const D = document, { $, $$, SHOT, RM, clamp } = ML;
const PAGE = D.body.dataset.page || "";
function fitTitles() {
  $$(".s-title,.d-name,[data-kinetic]").forEach(el => {
    el.style.fontSize = "";
    const words = $$(".w", el), lns = $$(".ln", el);
    const over = () => {
      const r = el.getBoundingClientRect(), lim = Math.min(r.left + el.clientWidth, D.documentElement.clientWidth - 6) + 1;
      return words.length ? words.some(w => w.getBoundingClientRect().right > lim) || lns.some(l => l.getBoundingClientRect().right > lim) : el.scrollWidth > el.clientWidth + 1;
    };
    let fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
    while (over() && fs > 26 && n++ < 40) { fs *= .95; el.style.fontSize = fs.toFixed(1) + "px"; }
  });
}
fitTitles();
if (D.fonts && D.fonts.ready) D.fonts.ready.then(fitTitles);
let fitT = 0;
addEventListener("resize", () => { clearTimeout(fitT); fitT = setTimeout(fitTitles, 150); });

$$(".d-fig > img").forEach(img => {
  const fig = img.closest(".d-fig");
  const broken = () => fig.classList.add("is-broken");
  img.addEventListener("error", broken);
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) broken();
});

const cur = $("[data-cur] span"), mq = $("[data-mq]");
const secs = $$("[data-sec]"), links = $$(".toc a[href^='#']"), tocBox = $(".toc");
let shown = -1;
function lineFor(i) {
  const id = secs[i] ? secs[i].dataset.sec : "intro";
  return ML.sectionLine(PAGE, id);
}
function say(i) {
  if (cur) cur.textContent = lineFor(i);
}

const AI_SECS = window.ML_AI_LINES && window.ML_AI_LINES.sections && window.ML_AI_LINES.sections[PAGE];
const bodySecs = secs.filter(s => s.dataset.sec !== "intro");
const noteStep = Math.ceil(bodySecs.length / Math.min(4, bodySecs.length || 1));
const notes = (AI_SECS ? bodySecs.filter(s => AI_SECS[s.dataset.sec]) : bodySecs.filter((s, i) => i % noteStep === noteStep - 1)).map((s, j) => {
  const p = D.createElement("p"); p.className = "cur-note";
  p.innerHTML = "<b>" + ML.I.t("curator.tag") + "</b><span></span>";
  s.appendChild(p);
  return { el: $("span", p), sec: s.dataset.sec, j };
});
function paintNotes() { notes.forEach(n => { n.el.textContent = AI_SECS ? ML.sectionLine(PAGE, n.sec) : ML.line("chapter", n.j + 1); }); }

function onSec(i) {
  if (i === shown || i < 0) return; shown = i;
  const id = secs[i].id;
  links.forEach(a => {
    const on = a.getAttribute("href") === "#" + id;
    a.classList.toggle("on", on);
    if (on && tocBox && tocBox.scrollWidth > tocBox.clientWidth) tocBox.scrollTo({ left: a.offsetLeft - 12, behavior: RM || SHOT ? "auto" : "smooth" });
  });
  say(i);
}
const sio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) onSec(secs.indexOf(en.target)); }), { rootMargin: "-40% 0px -55% 0px" });
secs.forEach(s => sio.observe(s));
function paintMq() {
  if (!mq) return;
  mq.textContent = "/// " + [0, 1, 2].map(i => ML.line("chapter", i)).join(" /// ") + " ///";
}

const prog = $("[data-prog]"), pctEl = $("[data-readpct]"), bar = $("[data-readbar]");
const main = $(".pg");
let ticking = false;
function onScroll() {
  ticking = false;
  const total = main.scrollHeight + main.offsetTop - innerHeight, f = clamp(scrollY / Math.max(1, total), 0, 1);
  const w = (f * 100).toFixed(1) + "%";
  if (prog) prog.style.width = w;
  if (bar) bar.style.width = w;
  if (pctEl) pctEl.textContent = Math.round(f * 100) + "%";
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("load", onScroll);
onScroll();

onSec(0); paintMq(); paintNotes();
})();
