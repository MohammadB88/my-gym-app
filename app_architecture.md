# App Architecture

How the pieces of this single-file app talk to each other. See
[CLAUDE.md](CLAUDE.md) for the file layout and the "Auth & data sync" section
this diagram assumes.

## Component overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Browser                                                                  │
│                                                                           │
│  ┌──────────────────┐                                                   │
│  │  docs/index.html  │                                                   │
│  │  ────────────────  │                                                  │
│  │  <style>           │  static CSS, no communication                    │
│  │                    │                                                  │
│  │  <script>          │◄──── loads ──────┐                               │
│  │  exercises.js      │                  │                               │
│  │  (EXERCISES        │                  │                               │
│  │   registry)         │                  │                               │
│  └──────────┬─────────┘                  │                               │
│             │ read by resolveDay()        │                               │
│             ▼                            │                               │
│  ┌────────────────────────────┐          │                               │
│  │ <script type="module">     │          │                               │
│  │ Auth module                │          │                               │
│  │ ───────────────────────    │          │                               │
│  │ • createClient(SUPABASE_*) │──────────┼───► Supabase Auth (OAuth)     │
│  │ • signInWithOAuth /        │          │      GitHub sign-in           │
│  │   signOut / getSession     │◄─────────┼───                            │
│  │ • onAuthStateChange        │          │                               │
│  │ • window.__supabase = ...  │          │                               │
│  │ • window.__gymUserId = ... │          │                               │
│  └──────────┬──────────────────┘          │                               │
│             │ shows/hides #authScreen,    │                               │
│             │ #app; publishes             │                               │
│             │ window.__supabase /         │                               │
│             │ window.__gymUserId; calls   │                               │
│             │ window.__gymAppInit()  ─────┼──────────────┐                │
│             ▼                             │              ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ <script> — main app logic (classic, global scope)                │    │
│  │ ──────────────────────────────────────────────────────────────  │    │
│  │  DAYS{1..5}  ──resolveDay()──►  dayExercises (merged with        │    │
│  │                                  EXERCISES registry)              │    │
│  │                                                                    │    │
│  │  state  = { sets, log }        ◄─cloud─►  Supabase Postgres      │    │
│  │  history = [{ date, entries }] ◄─cloud─►  (RLS: one allow-listed │    │
│  │                                             GitHub user only)     │    │
│  │                                 ◄─cache─►  localStorage           │    │
│  │                                             (read-through, +      │    │
│  │                                              pending-writes queue)│    │
│  │                                                                    │    │
│  │  selectDay() ── switches currentDay, reloads state+history,      │    │
│  │                  calls render()                                   │    │
│  │  render()    ── rebuilds #list DOM from dayExercises + state     │    │
│  │  save()      ── debounced (500ms) write to Supabase + cache      │    │
│  │  flushQueue()── replays queued writes on load / `online` event   │    │
│  │                                                                    │    │
│  │  event delegation on #list (click/input) ──► mutate state ──►    │    │
│  │    save() ──► render()                                            │    │
│  │                                                                    │    │
│  │  finishBtn click ──► pushHistorySession() ──► reset state ──►    │    │
│  │                       save() ──► render()                         │    │
│  │                                                                    │    │
│  │  exportBtn/importBtn ──► CSV blob ◄──► state + history           │    │
│  │  (import also calls replaceHistory() to overwrite cloud rows)    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  DOM elements (#tabs, #list, #finishBtn, #exportBtn, #importBtn,        │
│  #resetBtn, #importFile, #barFill, #progressLabel) are the only         │
│  channel between the user and the main script — no other UI framework.  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Communication paths

1. **`exercises.js` → main script (load-time, one-way).**
   `exercises.js` defines the global `EXERCISES` registry (movement data:
   name, scheme, cue, `tg`/`howto` links, default weight). The main script's
   `resolveDay()` merges a day's `ex` array (id/sets/img) with the matching
   `EXERCISES[id]` entry into the flat objects the rest of the app renders.
   This is a plain script-tag load into shared global scope — no imports,
   no events.

2. **Auth module ↔ Supabase Auth (network).**
   The `type="module"` script is the app's one CDN dependency (`esm.sh`
   import of `@supabase/supabase-js`). It starts GitHub OAuth
   (`signInWithOAuth`), checks/restores a session (`getSession`), signs out
   (`signOut`), and subscribes to session changes (`onAuthStateChange`).
   Requires a real HTTP origin registered with Supabase — auth doesn't work
   from a bare `file://` URL.

3. **Auth module → main script (handoff via `window`).**
   The auth module is an ES module (separate scope); the main app logic is a
   classic script (global scope) — they can't share variables directly. The
   auth module publishes `window.__supabase` (the client instance) and
   `window.__gymUserId` (the signed-in user's id) once a session is
   confirmed, toggles `#authScreen`/`#app`, then calls
   `window.__gymAppInit()`, a function the main script attaches to `window`
   specifically for this handoff. A `window.__gymAppStarted` guard makes the
   init call idempotent (auth state can fire more than once, e.g. on token
   refresh).

4. **Main script ↔ Supabase Postgres (network, source of truth).**
   Workout data itself — not just auth — lives in Supabase now.
   `workout_sessions` holds one row per `(user_id, day)` with the live
   `{ sets, log }` state as `jsonb`, upserted on a 500ms debounce from
   `save()`. `workout_history` holds one flattened row per
   `(user_id, day, date, exercise_num)`, written by `pushHistorySession()`
   ("Finish workout") or wholesale-replaced by `replaceHistory()` (CSV
   import). Access is restricted server-side: Row Level Security policies
   check `user_id = auth.uid() and auth.uid() = '<allow-listed-uuid>'`, so
   only one specific GitHub account can read or write rows — any other
   account completes OAuth successfully but gets zero rows and every write
   rejected. `cloudReady()` (`window.__supabase && window.__gymUserId`)
   gates every cloud call.

5. **Main script ↔ `localStorage` (cache + offline queue, not primary).**
   `localStorage` is now a **read-through cache**, not authoritative:
   `load()`/`loadHistory()` try Supabase first and fall back to the cached
   copy only on network failure; every successful read or write also
   refreshes the cache so the next offline load has something to show. Keys:
   `gym-day<N>-v1` (session cache), `gym-day<N>-history-v1` (history cache),
   `gym-current-day` (the one true local-only value — a UI preference, not
   synced data). A failed write is never silently dropped: it's appended to
   a **pending-writes queue** (`gym-pending-writes-v1`) and replayed in
   order by `flushQueue()`, called on app load and on the browser's
   `online` event, stopping at the first failure to preserve ordering.

6. **DOM ↔ main script (event delegation, one listener per container).**
   Clicks on `#tabs` route to `selectDay()`; clicks/input inside `#list` are
   delegated to a single listener each that inspects
   `e.target.closest(...)` to figure out whether a set button, progress
   toggle, or log input was interacted with, then mutates `state`, calls
   `save()`, and calls `render()` to rebuild the DOM from scratch.
   `#finishBtn`, `#exportBtn`, `#importBtn`, `#resetBtn`, and `#importFile`
   each have their own direct listener since they're singletons outside the
   per-exercise list.

7. **CSV import/export ↔ `state`/`history` (file I/O + cloud writeback).**
   Export serializes `dayExercises` + `state` + full `history` into a CSV
   `Blob` and triggers a download — purely local, no network. Import reads a
   `File` via `FileReader`, parses it with a hand-rolled `parseCsvLine`, and
   routes rows back into `state` (session section) or `history` (history
   section) by matching `exercise_num`; unlike export, import also calls
   `replaceHistory()` to overwrite that day's cloud rows so Supabase stays
   the source of truth after a restore.

## Key takeaway

Supabase is now **two things at once**: the auth gate (GitHub OAuth) *and*
the authoritative store for workout data, with access locked to a single
allow-listed user via Postgres RLS rather than app-level checks.
`localStorage` has been demoted to a read-through cache and offline queue —
useful when the gym has bad signal, but never the source of truth. The
handoff between the ES-module auth script and the classic-script app logic
still happens through **shared globals** (`window.__supabase`,
`window.__gymUserId`, `window.__gymAppInit`), and the UI still runs on
**delegated DOM events** — those parts of the design haven't changed.
