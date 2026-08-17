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
| MENU pill | Menu / high scores |

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
src/app/api/         High-score API backed by Supabase
supabase/            SQL schema for the high_scores table
tools/             Sheet analysis, sprite extraction, icon generation, screenshots
```

`tools/shots.mjs` captures the UI at desktop/portrait/landscape sizes against a running
dev server. It drives the local Chrome install and needs `npm i --no-save puppeteer-core`.

Game logic is framework-free; React only owns the casing and menus.

## Modes

- **Game A** — standard rescue, difficulty rises with score.
- **Game B** — faster and busier, and jumpers snag on the palms before dropping
  again after a randomised delay.

## Deploy to Vercel

1. Push the repo to GitHub ([siongchai/gw-parachute](https://github.com/siongchai/gw-parachute)).
2. Sign in at [vercel.com](https://vercel.com) with GitHub.
3. **Add New → Project**, import **gw-parachute**, and keep the defaults (Next.js, `npm run build`).
4. Click **Deploy**. Vercel assigns a URL like `https://gw-parachute.vercel.app`.
5. Future pushes to `main` redeploy automatically.

No environment variables are required for a local playtest — high scores still save in the browser (`localStorage`) if Supabase is not configured.

### High scores (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. Copy **Project URL** and **anon public** key from **Project Settings → API**.
4. Locally, copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. On Vercel, add the same two names under **Project → Settings → Environment Variables**, then redeploy.

**SAVE SCORE** writes to Supabase and also keeps a copy on the device. The high-score list loads from the database when those variables are set.


**CLI (optional):** `npm i -g vercel`, then run `vercel` and `vercel --prod` from the project root.

Verify locally first with `npm run build` if the Vercel build fails.
