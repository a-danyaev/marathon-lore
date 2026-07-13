# MARATHON // World Guide

An interactive, unofficial fan lore guide to the universe of **Marathon** (Bungie, 2026) - the fall of the Tau Ceti IV colony, Runners and shells, the six factions, AI rampancy, the full arsenal, the classic 1990s trilogy and its Halo legacy.

![Marathon key art](https://images.contentstack.io/v3/assets/blt15f7b5c0d43ed112/blt4579a520aea7477a/699c18b848bd410008f09c63/Hero_Video_Fallback_Image.png?width=1200&quality=80)

## What's inside

- **Four languages** - EN / ES / DE / RU, switchable in the top bar, full content parity. Your choice is remembered (`?lang=` in the URL + local storage).
- **Spoiler toggle** - a top-bar switch hides priority-mission story beats for newcomers; on by default, remembers your choice.
- **Honest sourcing** - every lore claim is tagged `canon` / `datamine` / `theory`, and contested points are flagged as open questions instead of being smoothed over.
- **No build step, no frameworks, no tracking** - plain HTML/CSS/JS. Interactive CRT terminals, hover glossary tooltips, original SVG pictograms. Official artwork is hotlinked from public sources and needs a network connection; text and inline SVG work offline.

## Structure

A welcome page plus 13 briefing pages:

- `index.html` - welcome: hero, timeline ticker, "start here" primer, the ESCAPE-WILL-MAKE-ME-GOD banner, the terminal index (table of contents) and a note on the community patches.
- `pages/` - the 13 chapters: timeline, colony, runners, classes, arsenal, factions, rampancy, aliens, zones, seasons, trilogy, deep-cuts, canon.
- `assets/` - shared `style.css`, `app.js` and images.
- `404.html` - a self-contained easter-egg page.

## Community patches (v5.0)

This release folds in verified corrections and finds from the r/Marathon community, each credited on the relevant page. Huge thanks to the Runners who dug through terminals, manuals and the Cryo Archive to keep the lore honest. Found a mistake or something missing? The Feedback button links to the author on Reddit - canon accuracy is the whole point.

## Open it locally

No server needed - it is a static site with relative links:

1. Clone or download this repository.
2. Open `index.html` in any modern browser (double-click, or `File > Open`).
3. Navigate between pages, switch language and toggle spoilers from the top bar.

To serve it over HTTP instead (e.g. to test as GitHub Pages would): run `python3 -m http.server` in the repo root and open `http://localhost:8000/`.

## Legal

This is an **unofficial fan document**. Bungie and Marathon are registered trademarks of Bungie, Inc. Unofficial fan document. All official logos, key art and screenshots are loaded directly from their public sources and remain the property of Bungie, Inc. Original pictograms and diagrams in this guide were drawn for it from scratch. No affiliation with or endorsement by Bungie is implied.
