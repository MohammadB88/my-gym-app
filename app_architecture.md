# App Architecture

How the pieces of this single-file app talk to each other. See
[CLAUDE.md](CLAUDE.md) for the file layout this diagram assumes.

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
│  │ • createClient(SUPABASE_*) │──────────┼───► Supabase (auth.github.com)│
│  │ • signInWithOAuth /        │          │      OAuth + session storage   │
│  │   signOut / getSession     │◄─────────┼───  (network, cookies/JWT)     │
│  │ • onAuthStateChange        │          │                               │
│  └──────────┬──────────────────┘          │                               │
│             │ shows/hides #authScreen,    │                               │
│             │ #app; calls                 │                               │
│             │ window.__gymAppInit()  ─────┼──────────────┐                │
│             ▼                             │              ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ <script> — main app logic (classic, global scope)                │    │
│  │ ──────────────────────────────────────────────────────────────  │    │
│  │  DAYS{1..5}  ──resolveDay()──►  dayExercises (merged with        │    │
│  │                                  EXERCISES registry)              │    │
│  │                                                                    │    │
│  │  state  = { sets, log }        ◄──► localStorage:                │    │
│  │  history = [{ date, entries }] ◄──► gym-day<N>-v1                │    │
│  │                                 ◄──► gym-day<N>-history-v1        │    │
│  │                                 ◄──► gym-current-day               │    │
│  │                                                                    │    │
│  │  selectDay() ── switches currentDay, reloads state+history,      │    │
│  │                  calls render()                                   │    │
│  │  render()    ── rebuilds #list DOM from dayExercises + state     │    │
│  │  save()      ── writes state to localStorage                     │    │
│  │                                                                    │    │
│  │  event delegation on #list (click/input) ──► mutate state ──►    │    │
│  │    save() ──► render()                                            │    │
│  │                                                                    │    │
│  │  finishBtn click ──► snapshot state into history ──► saveHistory │    │
│  │                       ──► reset state ──► save() ──► render()    │    │
│  │                                                                    │    │
│  │  exportBtn/importBtn ──► CSV blob ◄──► state + history           │    │
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

2. **Auth module ↔ Supabase (network).**
   The `type="module"` script is the only part of the app that talks to a
   server. It calls the Supabase JS client to start GitHub OAuth
   (`signInWithOAuth`), check/restore a session (`getSession`), sign out
   (`signOut`), and subscribe to session changes (`onAuthStateChange`).
   Supabase handles the OAuth redirect round-trip and returns a session
   object; nothing about workout data goes over this channel.

3. **Auth module → main script (one-shot handoff via `window`).**
   Because the auth module is an ES module (separate scope) and the main
   app logic is a classic script (global scope), they can't share variables
   directly. The auth module toggles `#authScreen`/`#app` visibility, then
   calls `window.__gymAppInit()` — a function the main script attaches to
   `window` specifically so the module can invoke it. A `window.__gymAppStarted`
   guard makes this idempotent (auth state can fire the callback more than
   once, e.g. on token refresh).

4. **Main script ↔ `localStorage` (synchronous, same-tab persistence).**
   All workout data is local: `state` (`gym-day<N>-v1`, current sets/log)
   and `history` (`gym-day<N>-history-v1`, finished sessions) are read on
   `load()`/`loadHistory()` and written on `save()`/`saveHistory()`. The
   selected tab persists separately under `gym-current-day`. This is the
   only persistence layer for training data — Supabase is used for
   authentication only, not data sync.

5. **DOM ↔ main script (event delegation, one listener per container).**
   User interaction never attaches per-element handlers. Clicks on `#tabs`
   route to `selectDay()`; clicks/input inside `#list` are delegated to a
   single listener each that inspects `e.target.closest(...)` to figure out
   whether a set button, progress toggle, or log input was interacted with,
   then mutates `state`, calls `save()`, and calls `render()` to rebuild the
   DOM from scratch. `#finishBtn`, `#exportBtn`, `#importBtn`, `#resetBtn`,
   and `#importFile` each have their own direct listener since they're
   singletons outside the per-exercise list.

6. **CSV import/export ↔ `state`/`history` (file I/O, browser-only).**
   Export serializes `dayExercises` + `state` + full `history` into a CSV
   `Blob` and triggers a download. Import reads a `File` via `FileReader`,
   parses it with a hand-rolled `parseCsvLine`, and routes rows back into
   `state` (session section) or `history` (history section) by matching
   `exercise_num` — no server involved either direction.

## Key takeaway

There is no client-server data layer for training data — Supabase is scoped
strictly to authentication (gatekeeping the `#app` view), and every other
component communicates through **shared globals** (`EXERCISES`, `window.__gymAppInit`),
**`localStorage`** (state/history persistence), or **DOM events**
(delegated click/input listeners). This keeps the app dependency-free and
single-file per [CLAUDE.md](CLAUDE.md)'s conventions.
