# Parachute Rescue

A retro LCD handheld game built with Next.js, React, TypeScript and HTML5 Canvas.
The casing, panels and sprites follow the supplied `mockup.PNG` and `spirite.PNG` references.

## Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Controls

| Input | Action |
| --- | --- |
| LEFT / RIGHT pads | Move the boat (hold) |
| ← → or A / D | Move the boat |
| P or Esc | Pause |
| GAME A / GAME B pills | Start a game |
| TIME pill | Menu / high scores |

## Sprites

`spirite.PNG` is the master art sheet. It is sliced into individual pixel sprites by:

```bash
python3 tools/extract_sprites.py
```

Output lands in `public/sprites/<category>/`, which `SpriteManager` loads at boot.
Replacing a PNG in place swaps the artwork without touching gameplay code.

The extractor downscales each sprite to its logical game size and snaps colours to
the sheet palette (`#000000`, `#00B050`, `#E67E22`, `#3DA8FF`) so edges stay hard.

## Screen

The canvas runs at a fixed logical resolution of **164 × 142**, matching the LCD aspect
of the reference mockup, and is scaled up with `image-rendering: pixelated`.

Gameplay uses **three fixed columns** (left / centre / right), like the original Game & Watch
LCD. The boat steps between three positions when LEFT or RIGHT is pressed; parachutists
fall along one of three preset paths into the matching column. A catch only counts when
the boat and jumper share the same column.

## Layout

```
src/game/          GameEngine, GameConfig, DifficultyManager, SpriteManager, CollisionManager
src/entities/      Boat, Helicopter, Parachutist, Shark, PalmTree
src/components/    Handheld casing, canvas host and the cream UI panels
src/audio/         Synthesised retro sound effects
src/lib/storage.ts localStorage bests, player name, sound preference
tools/             Sheet analysis, sprite extraction, icon generation, screenshots
```

`tools/shots.mjs` captures the UI at desktop/portrait/landscape sizes against a running
dev server. It drives the local Chrome install and needs `npm i --no-save puppeteer-core`.

Game logic is framework-free; React only owns the casing and menus.

## Modes

- **Game A** — standard rescue, difficulty rises with score.
- **Game B** — faster and busier, and jumpers snag on the palms before dropping
  again after a randomised delay.

## Deploy

`npm run build` produces a static-friendly build ready for Vercel.
Supabase-backed global leaderboards are not wired up yet; high scores are local.
