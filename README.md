# My Gym App — 3-Day Tracker

A simple web app to track my personalized **3-day** training plan (Day 1/2/3,
switchable via a tab bar). No build step, no server, no dependencies — just open it.

**▶ Live app: https://mohammadb88.github.io/my-gym-app/**

## Use it

Open the [live app](https://mohammadb88.github.io/my-gym-app/), or run it locally by
opening [`docs/index.html`](docs/index.html) in any browser (double-click, or serve
it). Works on phone and desktop.

- **Day 1 / Day 2 / Day 3 tabs** switch between workouts; your choice is remembered.
- **Mark done** on each exercise as you complete it.
- **Log weight and reps** per exercise.
- **Progress bar** at the top tracks completed exercises across the session.
- **✓ Finish workout** — snapshots your logged sets into that day's history and
  starts a fresh session. Each exercise then shows a "Last time" hint and a
  **📈 Progress** chart of weight over time.
- **⬇ Export CSV** — download your session + history as a dated CSV (opens in
  Excel/Sheets).
- **⬆ Import CSV** — load a previous export back in (e.g. on another device).
- **Reset** — clear the current session (history is kept).

Progress and history auto-save in the browser (`localStorage`), per day, so you
can close the tab mid-workout and come back. Note: it saves **per device/browser**
— use Export/Import to move data between devices.

## Exercise images

Each exercise shows an image from the [`docs/images/`](docs/images/) folder, or an
"Image coming soon" placeholder until one exists. Drop a file in using the filename
listed in [`docs/images/README.txt`](docs/images/README.txt) and it appears
automatically — no code changes needed.

## Publishing (GitHub Pages)

The site lives in [`docs/`](docs/). In **Settings → Pages**, set the source to
**Deploy from a branch**, branch **`main`**, folder **`/docs`**. It serves at
`https://mohammadb88.github.io/my-gym-app/`.

Note: any push to `main` that changes files under `docs/` triggers a redeploy.
Pushes that touch only files *outside* `docs/` (this README, the training plan,
notes) do **not** redeploy — keep work-in-progress outside `docs/` and move it in
when you're ready to publish.

## Files

| Path | Purpose |
|------|---------|
| `docs/index.html` | The app shell — HTML + CSS + JS inline — served by Pages |
| `docs/exercises.js` | Shared exercise data (name, cue, reference links), keyed by id |
| `docs/images/` | Exercise images (+ naming guide) |
| `docs/404.html`, `docs/.nojekyll` | Pages helpers |
| `Personalized_3_Day_Gym_Training_Plan.md` | The full training plan this is based on |
