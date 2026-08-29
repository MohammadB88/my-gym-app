# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

A single-file web app to track a personalized training plan: 3 full-body gym
days plus 2 bodyweight core sessions (Day 1/2/3, Core A/B, switchable via a
tab bar). No build step, no server-side code, no framework — plain HTML + CSS
+ inline JS, plus one CDN dependency (Supabase JS client) for auth and data
sync. To run it, open [`docs/index.html`](docs/index.html) in a browser —
GitHub OAuth needs a real HTTP origin registered with Supabase, so auth won't
work from a bare `file://` URL (see "Auth & data sync" below).

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
- Live session state (`{ sets: {...}, log: {...} }`) is tracked **per day**.
  **Workout history** (progression) is an array of
  `{ date, entries: { <exercise_num>: {w, r} } }` per day, keyed by `ex.n` so
  it survives reordering. "Finish workout" snapshots the live session into it
  and clears the session; each card shows a "Last time" hint and a "📈 Progress"
  toggle that draws a hand-rolled inline-SVG line chart (top-set weight over time,
  `progressChartSVG()`). CSV export/import round-trips history as a second section.
  See "Auth & data sync" below for where this state actually lives.
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

## Auth & data sync

- The app is gated behind GitHub OAuth via Supabase Auth. `#authScreen` (login
  button) and `#app` (the whole UI) toggle visibility based on session state;
  the Supabase client is created in a `type="module"` `<script>` near the top
  of the body using the ESM CDN import
  (`https://esm.sh/@supabase/supabase-js@2`) — this is the app's one CDN
  dependency, pulled in without a build step. `SUPABASE_URL` and the anon
  (publishable) key are plain constants in that script; the anon key is safe
  to expose client-side because access control is enforced by RLS, not by
  hiding the key.
- **Access is restricted to a single allow-listed GitHub user** via Postgres
  Row Level Security. Any GitHub account can complete the OAuth flow, but the
  RLS policies on `workout_sessions` and `workout_history` check
  `user_id = auth.uid() and auth.uid() = '<allow-listed-uuid>'`, so only that
  one uuid can read or write rows — everyone else authenticates successfully
  but gets zero rows and every write rejected. There's no separate app-level
  check; the database is the actual gate.
- **Supabase is the source of truth; `localStorage` is a read-through cache**,
  not the primary store (this replaced an earlier local-first design — don't
  reintroduce `localStorage` as authoritative for session/history data).
  `load()`/`loadHistory()` try Supabase first and fall back to the cache on
  network failure; `save()` and the history-push functions write to Supabase
  and refresh the cache alongside. `gym-current-day` (which tab is open) is
  the one thing that stays `localStorage`-only — it's a UI preference, not
  data worth syncing.
  - `workout_sessions`: one row per `(user_id, day)`, holding the live
    `{ sets, log }` blob as `jsonb`. Session writes are debounced (500ms) via
    `save()`.
  - `workout_history`: one row per `(user_id, day, date, exercise_num)` —
    flattened out of the local `{ date, entries: {...} }` shape so it's
    queryable. `pushHistorySession()` appends rows on "Finish workout";
    `replaceHistory()` deletes-and-reinserts a whole day's rows on CSV import.
- **Pending-writes queue**: a failed Supabase write (offline at the gym) is
  queued in `localStorage` (`gym-pending-writes-v1`) rather than dropped.
  `flushQueue()` replays queued ops in order — on app load and on the
  browser's `online` event — stopping at the first failure so ordering is
  preserved. When adding a new kind of write, queue it on failure the same
  way (see `runOp()`'s `type` dispatch) rather than letting it fail silently.
- To change the schema or RLS policies, use the Supabase SQL editor directly
  (there's no migrations folder in this repo — the app has no build/deploy
  step for backend changes, only for the static frontend).

## Conventions

- **Keep it single-file and build-tool-free.** The Supabase JS client (via ESM
  CDN import) is the one accepted exception. Don't add a build tool, package
  manager, framework, or further dependencies unless the user explicitly asks.
- Mobile-first: dark theme via CSS vars, safe-area insets, 16px inputs (avoids
  iOS zoom), 44px+ tap targets. Preserve these when editing styles.
- No test suite or lint config — verify changes by opening `docs/index.html`.
