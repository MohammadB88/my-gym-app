# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

A single-file web app to track the **Day 1** workout from a personalized 3-day
training plan. No build step, no server, no dependencies, no framework — plain
HTML + CSS + inline JS. To run it, open [`docs/index.html`](docs/index.html) in a
browser.

## Layout

The web app lives in `docs/` (GitHub Pages serves this folder — see README).

| Path | Purpose |
|------|---------|
| [`docs/index.html`](docs/index.html) | The entire app — HTML, CSS (`<style>`), and JS (`<script>`) all inline |
| [`docs/images/`](docs/images/) | Exercise images + [`README.txt`](docs/images/README.txt) naming guide |
| [`docs/404.html`](docs/404.html) | Redirects unknown paths to the app root (for GitHub Pages) |
| [`docs/.nojekyll`](docs/.nojekyll) | Tells Pages to skip Jekyll processing |
| [`Personalized_3_Day_Gym_Training_Plan.md`](Personalized_3_Day_Gym_Training_Plan.md) | The source training plan the app is based on |

## How it works

- All three workouts live in a `const DAYS = {1,2,3}` object near the top of the
  `<script>`. Each day has `title`, `sub`, and an `ex` array; each exercise has
  `n` (label), `name`, `scheme`, `sets` (count), `cue`, and `img` path.
  **To change a workout, edit that day's `ex` array** — the UI renders from it.
- A Day 1/2/3 tab bar switches `currentDay`; `selectDay()` reloads that day's
  exercises + progress. The chosen day persists in `localStorage` (`gym-current-day`).
- State (`{ sets: {...}, log: {...} }`) persists **per day** under
  `gym-day<N>-v1`. Bump the key if you change the state shape.
- `render()` rebuilds the DOM from state; click/input are handled via event
  delegation on `#list`. Call `save()` then `render()` after mutating `state`.
- Each card has a "Find this machine on Technogym" link — a Google site-search
  (`site:technogym.com/de-DE`) built from the exercise name by `technogymQuery()`.
  Technogym's own site 403s bots and has unstable product URLs, hence the Google hop.
- Export/import is CSV, keyed by `exercise_num` so it's robust to reordering.
  There's a hand-rolled quoted-cell parser (`parseCsvLine`) — no libraries.
- Images load lazily; a missing image triggers `onerror` → "Image coming soon"
  placeholder. Add a file to `docs/images/` matching the `img:` path and it appears.

## Conventions

- **Keep it dependency-free and single-file.** Don't add a build tool, package
  manager, or framework unless the user explicitly asks.
- Mobile-first: dark theme via CSS vars, safe-area insets, 16px inputs (avoids
  iOS zoom), 44px+ tap targets. Preserve these when editing styles.
- No test suite or lint config — verify changes by opening `docs/index.html`.
