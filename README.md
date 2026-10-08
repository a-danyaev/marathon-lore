# MARATHON // Terminal

An unofficial fan archive for **Marathon** (Bungie, 2026), built as a terminal you jack into: a UESC desktop with draggable windows, an ASCII signal field that resolves into the original frame under your cursor, and fourteen lore files on the fall of Tau Ceti IV, Runners and shells, the six factions, AI rampancy, the arsenal, the zones and the 1990s trilogy.

Live: https://a-danyaev.github.io/marathon-lore/ (Russian) and https://a-danyaev.github.io/marathon-lore/en/ (English).

## What's inside

- **Desktop home** - ARCHIVE (all files), ЭФИР / ON AIR (what is live in the game right now, the latest updates, what comes next), the countdown to Symbiosis, the forecast journal and the CURATOR console (type `help`).
- **Fourteen chapters** - timeline, rampancy, colony, runners, shells, arsenal, sound, factions, aliens, zones, seasons, trilogy, deep cuts, resources.
- **Ship log** - every patch, event and roadmap change since launch, with sources.
- **Zone maps** - interactive MapGenie maps for every zone, embedded.
- **Two languages** - Russian and English, switch in the top bar.
- **Honest sourcing** - lore claims are tagged `canon` / `datamine` / `theory`; names and terms are checked against Bungie's own texts (`data/glossary.yaml` lists the source for each).

## Under the hood

Plain HTML, CSS and JavaScript, no build step, no tracking. The background field is a WebGL2 shader with a canvas fallback; motion is off under `prefers-reduced-motion`. Data lives in `data/*.yaml` and is compiled into `data/js/` for the pages.

To run it locally, serve the folder over HTTP (browsers block WebGL from reading local images on `file://`):

```
python3 -m http.server 8000
```

then open http://localhost:8000/.

## Legal

This is an **unofficial fan project** with no affiliation with or endorsement by Bungie, Inc. Marathon, Bungie and their logos are trademarks of Bungie, Inc. Logos, key art and screenshots come from Bungie's official press kits (press.bungie.com) and remain the property of Bungie, Inc. Zone maps are embedded from MapGenie (mapgenie.io).
