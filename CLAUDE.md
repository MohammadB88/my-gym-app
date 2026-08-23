# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

A single-file web app to track a personalized training plan: 3 full-body gym
days plus 2 bodyweight core sessions (Day 1/2/3, Core A/B, switchable via a
tab bar). No build step, no server, no dependencies, no framework — plain
HTML + CSS + inline JS. To run it, open [`docs/index.html`](docs/index.html)
in a browser.

## Layout

The web app lives in `docs/` (GitHub Pages serves this folder — see README).

| Path | Purpose |
|------|---------|
| [`docs/index.html`](docs/index.html) | The entire app — HTML, CSS (`<style>`), and JS (`<script>`) all inline |
| [`docs/images/`](docs/images/) | Exercise images + [`README.txt`](docs/images/README.txt) naming guide |
| [`docs/404.html`](docs/404.html) | Redirects unknown paths to the app root (for GitHub Pages) |
| [`docs/.nojekyll`](docs/.nojekyll) | Tells Pages to skip Jekyll processing |
| [`Personalized_3_Day_Gym_Training_Plan.md`](Personalized_3_Day_Gym_Training_Plan.md) | The source training plan the app is based on |
| [`core-training-sessions.md`](core-training-sessions.md) | The source core-session plan (Core A/B) the app is based on |

## How it works

- All five sessions live in a `const DAYS = {1,2,3,4,5}` object near the top of
  the `<script>` — days 1–3 are the gym days, 4–5 are the Core A/B bodyweight
  sessions. Each entry has `title`, `sub`, and an `ex` array; each exercise has
  `n` (label), `name`, `scheme`, `sets` (count), `cue`, `img` path, and optional
  `tg` / `howto` reference URLs (see links below).
  **To change a workout, edit that day's `ex` array** — the UI renders from it.
- A 5-tab bar (Day 1/2/3, Core A/B) switches `currentDay`; `selectDay()`
  reloads that day's exercises + progress + history. The chosen day persists
  in `localStorage` (`gym-current-day`).
- Live session state (`{ sets: {...}, log: {...} }`) persists **per day** under
  `gym-day<N>-v1`. Bump the key if you change the state shape.
- **Workout history** (progression) persists per day under `gym-day<N>-history-v1`
  as an array of `{ date, entries: { <exercise_num>: {w, r} } }`, keyed by `ex.n`
  so it survives reordering. "Finish workout" snapshots the live session into it
  and clears the session; each card shows a "Last time" hint and a "📈 Progress"
  toggle that draws a hand-rolled inline-SVG line chart (top-set weight over time,
  `progressChartSVG()`). CSV export/import round-trips history as a second section.
- `render()` rebuilds the DOM from state; click/input are handled via event
  delegation on `#list`. Call `save()` then `render()` after mutating `state`.
- Each card has two reference links, built in `render()`:
  - **Machine** (`technogymLink()`): the exact Technogym product page from
    `ex.tg` when set ("View this machine…"), else a Google site-search fallback
    ("Find this machine…", via `technogymSearchLink()`). Direct URLs are used
    because Technogym 403s bots and has unstable URLs — verify by hand, not fetch.
  - **How-to** (`howtoLink()`): an exercise how-to page from `ex.howto` (mostly
    ACE Fitness) when set, else a YouTube form-video search. Suppressed when it
    would duplicate the machine link (bodyweight moves point `tg` at a how-to).
- Export/import is CSV, keyed by `exercise_num` so it's robust to reordering.
  There's a hand-rolled quoted-cell parser (`parseCsvLine`) — no libraries.
- Images load lazily; a missing image triggers `onerror` → "Image coming soon"
  placeholder. Add a file to `docs/images/` matching the `img:` path and it
  appears. Prompts for generating them (equipment-only) live in
  [`image-prompts.md`](image-prompts.md).

## Conventions

- **Keep it dependency-free and single-file.** Don't add a build tool, package
  manager, or framework unless the user explicitly asks.
- Mobile-first: dark theme via CSS vars, safe-area insets, 16px inputs (avoids
  iOS zoom), 44px+ tap targets. Preserve these when editing styles.
- No test suite or lint config — verify changes by opening `docs/index.html`.
