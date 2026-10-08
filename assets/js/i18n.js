/* i18n.js - shared UI strings for both site languages, loaded first on every page (before data/js and core.js).
 *   Language comes from <html lang>: "en" -> en, anything else -> ru. RU pages live at the repo root, EN pages mirror them under en/.
 *   window.ML_I18N = { lang, t(key, vars), pl(key, n), pick({ru, en}), dm(iso), dmy(iso), my(iso), clock(date) }.
 *   t: "{name}" placeholders are filled from vars. pl: plural forms, ru has three (1, 2-4, 5+), en has two (1, other).
 *   Dates: ru 08.10 / 08.10.2026 / 10.26; en 08 OCT / 08 OCT 2026 / OCT 2026. Page translators use the same formats in static HTML.
 *   Every key exists in both dictionaries; v5/validate_v7.py fails on a key present in one language only.
 */
(() => {
"use strict";
const LANG = document.documentElement.lang === "en" ? "en" : "ru";
const DICT = {
  ru: {
    "lang.label": "Язык сайта",
    "lang.ru": "Русская версия",
    "lang.en": "English version",
    "shell.default": "шелл",
    "glyphs": "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789#/%+=<>[]",
    "months": ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"],
    "chapters": {
      "01": ["С чего начать", "Что происходит на Tau Ceti IV"],
      "02": ["Хронология", "От Земли до Tau Ceti, 2070-2893"],
      "03": ["Рампанси", "Корабельные ИИ и болезнь, которая их ломает"],
      "04": ["Колония", "Три катастрофы подряд обрывают колонию"],
      "05": ["Раннеры", "Разумы в шеллах из биоматерии"],
      "06": ["Классы", "Модели шеллов и что умеет каждая"],
      "06-B": ["Арсенал", "Оружие: лор, статы, происхождение"],
      "06-C": ["Звук", "Звуковой язык Tau Ceti IV"],
      "07": ["Фракции", "Шесть корпораций и их агенты"],
      "08": ["Пришельцы", "Pfhor и нечеловеческое присутствие"],
      "09": ["Зоны", "Точки высадки и Cryo Archive"],
      "10": ["Сезоны", "Как вайпы двигают сюжет"],
      "11": ["Трилогия", "Bungie, 1994-1996, и её корни"],
      "12": ["Глубокие отсылки", "ARG, ниточки к Halo, пасхалки"],
      "13": ["Ресурсы", "Вики, базы, карты, треды"]
    },
    "boot.lines": ["UESC TERMINAL OS 7.0 // УЗЕЛ АРХИВА 06 // TAU CETI IV", "РУКОПОЖАТИЕ С ОРБИТОЙ ......... <b>OK</b>", "ПОДПИСЬ РАННЕРА ............... <b>ПРИНЯТА</b>", "ДОЛГ CYBERACME ................ НЕ ПОГАШЕН", "МОНТИРУЮ АРХИВ: 15 ФАЙЛОВ ..... <b>OK</b>", "ИИ АРХИВА «КУРАТОР» ........... <b>НА СВЯЗИ</b>"],
    "boot.skip.touch": "тапни, чтобы пропустить",
    "boot.skip.key": "любая клавиша - пропустить",
    "cmd.help": "КОМАНДЫ: help · ls · open <окно или файл> · diag · whoami · symbiosis · clear",
    "cmd.ls": "ОКНА: ARCHIVE  ЭФИР  SYMBIOSIS.CNT  FORECAST.LOG  CURATOR // ФАЙЛЫ: 01-13, 06-B, 06-C",
    "cmd.rampancy": "Рампанси: болезнь корабельных ИИ. Подробно в файле 03.",
    "cmd.whoami": "РАННЕР // ШЕЛЛ: {shell} // ПРОЧИТАНО {n}/{total} // ДОЛГ CYBERACME: НЕ ПОГАШЕН",
    "cmd.symbiosis": "Symbiosis: {date}. Осталось дней: {d}. Bishop в комплекте.",
    "cmd.durandal": "Известный корабельный ИИ. Файл 03, раздел о рампанси.",
    "cmd.opening": "Открываю {win}.",
    "cmd.goto": "Файл {id}: {title}. Перехожу.",
    "cmd.notfound": "Файл не найден. Список: ls.",
    "arch.read": "ПРОЧИТАН",
    "arch.new": "НОВЫЙ",
    "arch.count": "{n} ФАЙЛОВ // {r} ПРОЧИТАНО",
    "arch.sys": "АРХИВ: {n} ФАЙЛОВ // ПРОЧИТАНО: {r}",
    "air.left": "ОСТАЛОСЬ",
    "air.none": "Сейчас в игре нет временных событий. Следующее - в блоке «Дальше».",
    "air.windows": ["ОКНО", "ОКНА", "ОКОН"],
    "air.quiet": "ТИХО",
    "air.nodate": "ДАТЫ НЕТ",
    "air.live": "УЖЕ В ЭФИРЕ",
    "air.in": "ЧЕРЕЗ {t}",
    "air.days": ["ДЕНЬ", "ДНЯ", "ДНЕЙ"],
    "time.d": "Д",
    "time.h": "Ч",
    "time.m": "М",
    "fc.open": "OPEN",
    "fc.confirmed": "СБЫЛОСЬ",
    "fc.busted": "МИМО",
    "fc.partial": "ЧАСТИЧНО",
    "fc.ours": "наша",
    "fc.check": "Проверка: {v}",
    "fc.entries": ["ЗАПИСЬ", "ЗАПИСИ", "ЗАПИСЕЙ"],
    "fc.closed": "ЗАКРЫТЫЕ: {n}",
    "fc.logged": "ЗАПИСАН {date}",
    "fc.basis": "ОСНОВАНИЕ&gt;",
    "fc.verdict": "ВЕРДИКТ&gt;",
    "fc.proof": "Подтверждение",
    "fc.stat": "{open} open // {closed} закрыто",
    "fc.total": ["ПРОГНОЗ", "ПРОГНОЗА", "ПРОГНОЗОВ"],
    "cnt.log": ["ПРИЁМ: РАСШИРЕННЫЙ PERIMETER", "ПРИЁМ: ПРОФИЛЬ ШЕЛЛА BISHOP", "ПРИЁМ: ГНЕЗДО TICK QUEEN", "СВЕРКА КОНТРОЛЬНЫХ СУММ", "СИГНАЛ С ОРБИТЫ: УСТОЙЧИВЫЙ", "ДЕШИФРОВКА ПАКЕТА"],
    "field.mode": "ДЕШИФРОВКА",
    "curator.tag": "КУРАТОР&gt;",
    "src": "Источник",
    "lg.kinds": { "season": "Сезон", "patch": "Патч", "event": "Ивент", "balance": "Баланс", "roadmap": "Роадмап", "studio": "Студия", "lore": "Лор" },
    "lg.pending": "ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ",
    "lg.plan": "ПЛАН",
    "lg.rec": "ЗАП.",
    "lg.mine": "ТВОЙ ШЕЛЛ",
    "lg.ahead": "Впереди // плановые записи",
    "lg.logged": "Записано // свежее сверху",
    "lg.empty": "Под этот фильтр записей нет.",
    "lg.reset": "Сбросить фильтры",
    "lg.shown": "Показано {n} из {total}",
    "lg.all": "Все",
    "lg.allShells": "Все шеллы",
    "lg.stat": "{done} записано // {planned} в плане",
    "lg.cdLabel": "До записи",
    "lg.voice.done": "Запись внесена. Факт сверен с источником.",
    "lg.voice.planned": "Плановая запись. Дата из анонса.",
    "map.slow": "КАРТА НЕ ОТВЕТИЛА",
    "map.loading": "ЗАГРУЗКА КАРТЫ",
    "map.title": "Интерактивная карта {zone}, MapGenie",
    "rs.found": "{n} из {total}",
    "tl.plan": "План",
    "tl.out": "Вышло",
    "tl.now": "Сейчас // {date}"
  },
  en: {
    "lang.label": "Site language",
    "lang.ru": "Русская версия",
    "lang.en": "English version",
    "shell.default": "shell",
    "glyphs": "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/%+=<>[]",
    "months": ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    "chapters": {
      "01": ["Start here", "What is happening on Tau Ceti IV"],
      "02": ["Timeline", "From Earth to Tau Ceti, 2070-2893"],
      "03": ["Rampancy", "Ship AIs and the disease that breaks them"],
      "04": ["Colony", "Three disasters in a row end the colony"],
      "05": ["Runners", "Minds inside biomatter shells"],
      "06": ["Classes", "Shell models and what each one does"],
      "06-B": ["Arsenal", "Weapons: lore, stats, origins"],
      "06-C": ["Sound", "The sound language of Tau Ceti IV"],
      "07": ["Factions", "Six corporations and their agents"],
      "08": ["Aliens", "The Pfhor and other non-human presence"],
      "09": ["Zones", "Drop zones and the Cryo Archive"],
      "10": ["Seasons", "How wipes move the story"],
      "11": ["Trilogy", "Bungie, 1994-1996, and where it came from"],
      "12": ["Deep cuts", "ARG, Halo threads, easter eggs"],
      "13": ["Resources", "Wikis, databases, maps, threads"]
    },
    "boot.lines": ["UESC TERMINAL OS 7.0 // ARCHIVE NODE 06 // TAU CETI IV", "ORBITAL HANDSHAKE ............. <b>OK</b>", "RUNNER SIGNATURE .............. <b>ACCEPTED</b>", "CYBERACME DEBT ................ OUTSTANDING", "MOUNTING ARCHIVE: 15 FILES .... <b>OK</b>", "ARCHIVE AI \"CURATOR\" .......... <b>ONLINE</b>"],
    "boot.skip.touch": "tap to skip",
    "boot.skip.key": "press any key to skip",
    "cmd.help": "COMMANDS: help · ls · open <window or file> · diag · whoami · symbiosis · clear",
    "cmd.ls": "WINDOWS: ARCHIVE  ON AIR  SYMBIOSIS.CNT  FORECAST.LOG  CURATOR // FILES: 01-13, 06-B, 06-C",
    "cmd.rampancy": "Rampancy: the disease of ship AIs. Full entry in file 03.",
    "cmd.whoami": "RUNNER // SHELL: {shell} // READ {n}/{total} // CYBERACME DEBT: OUTSTANDING",
    "cmd.symbiosis": "Symbiosis: {date}. Days left: {d}. Bishop included.",
    "cmd.durandal": "A ship AI of some note. File 03, rampancy section.",
    "cmd.opening": "Opening {win}.",
    "cmd.goto": "File {id}: {title}. Switching.",
    "cmd.notfound": "File not found. For the list, type ls.",
    "arch.read": "READ",
    "arch.new": "NEW",
    "arch.count": "{n} FILES // {r} READ",
    "arch.sys": "ARCHIVE: {n} FILES // READ: {r}",
    "air.left": "ENDS IN",
    "air.none": "No timed events in the game right now. The next one is listed under Next.",
    "air.windows": ["WINDOW", "WINDOWS"],
    "air.quiet": "QUIET",
    "air.nodate": "NO DATE",
    "air.live": "ON AIR NOW",
    "air.in": "IN {t}",
    "air.days": ["DAY", "DAYS"],
    "time.d": "D",
    "time.h": "H",
    "time.m": "M",
    "fc.open": "OPEN",
    "fc.confirmed": "HIT",
    "fc.busted": "MISS",
    "fc.partial": "PARTIAL",
    "fc.ours": "ours",
    "fc.check": "Resolves: {v}",
    "fc.entries": ["ENTRY", "ENTRIES"],
    "fc.closed": "CLOSED: {n}",
    "fc.logged": "LOGGED {date}",
    "fc.basis": "BASIS&gt;",
    "fc.verdict": "VERDICT&gt;",
    "fc.proof": "Proof",
    "fc.stat": "{open} open // {closed} closed",
    "fc.total": ["FORECAST", "FORECASTS"],
    "cnt.log": ["RECEIVING: EXPANDED PERIMETER", "RECEIVING: BISHOP SHELL PROFILE", "RECEIVING: TICK QUEEN NEST", "VERIFYING CHECKSUMS", "ORBITAL SIGNAL: STABLE", "DECRYPTING PACKET"],
    "field.mode": "DECRYPT",
    "curator.tag": "CURATOR&gt;",
    "src": "Source",
    "lg.kinds": { "season": "Season", "patch": "Patch", "event": "Event", "balance": "Balance", "roadmap": "Roadmap", "studio": "Studio", "lore": "Lore" },
    "lg.pending": "AWAITING CONFIRMATION",
    "lg.plan": "PLAN",
    "lg.rec": "REC.",
    "lg.mine": "YOUR SHELL",
    "lg.ahead": "Ahead // planned records",
    "lg.logged": "Logged // newest first",
    "lg.empty": "No records match this filter.",
    "lg.reset": "Reset filters",
    "lg.shown": "Showing {n} of {total}",
    "lg.all": "All",
    "lg.allShells": "All shells",
    "lg.stat": "{done} logged // {planned} planned",
    "lg.cdLabel": "Time to record",
    "lg.voice.done": "Record filed. Checked against the source.",
    "lg.voice.planned": "Planned record. Date taken from the announcement.",
    "map.slow": "MAP NOT RESPONDING",
    "map.loading": "LOADING MAP",
    "map.title": "{zone} interactive map, MapGenie",
    "rs.found": "{n} of {total}",
    "tl.plan": "Planned",
    "tl.out": "Out",
    "tl.now": "Now // {date}"
  }
};
const D = DICT[LANG];
const pad = n => String(n).padStart(2, "0");
const ISO = /^(\d{4})-(\d{2})-(\d{2})/;

function t(key, vars) {
  const v = key in D ? D[key] : DICT.ru[key];
  if (v === undefined) { console.warn("[ml i18n] missing key", key); return key; }
  if (typeof v !== "string" || !vars) return v;
  return v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
function pl(key, n) {
  const f = t(key);
  if (LANG === "en") return n === 1 ? f[0] : f[1];
  const m = n % 10, h = n % 100;
  return m === 1 && h !== 11 ? f[0] : m >= 2 && m <= 4 && (h < 12 || h > 14) ? f[1] : f[2];
}
const pick = o => (o && LANG in o ? o[LANG] : o && o.ru);
const parts = iso => { const m = ISO.exec(String(iso || "")); return m ? { y: m[1], m: +m[2], d: m[3] } : null; };
function dm(iso) { const p = parts(iso); if (!p) return String(iso || ""); return LANG === "en" ? p.d + " " + D.months[p.m - 1] : p.d + "." + pad(p.m); }
function dmy(iso) { const p = parts(iso); if (!p) return String(iso || ""); return LANG === "en" ? p.d + " " + D.months[p.m - 1] + " " + p.y : p.d + "." + pad(p.m) + "." + p.y; }
function my(iso) { const p = parts(iso); if (!p) return String(iso || ""); return LANG === "en" ? D.months[p.m - 1] + " " + p.y : pad(p.m) + "." + p.y.slice(2); }
function clock(date, year) { const iso = (year || date.getFullYear()) + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); return dmy(iso) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()); }

window.ML_I18N = { lang: LANG, dict: DICT, t, pl, pick, dm, dmy, my, clock };
})();
