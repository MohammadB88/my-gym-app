# My Gym App — Day 1 Tracker

A simple, single-file web app to track the **Day 1** workout from my personalized
3-day training plan. No build step, no server, no dependencies — just open it.

## Use it

Open [`docs/index.html`](docs/index.html) in any browser (double-click, or serve
it). Works on phone and desktop.

- **Tap the numbered buttons** to check off each set as you complete it.
- **Log weight and reps** per exercise.
- **Progress bar** at the top tracks completed sets across the session.
- **⬇ Export CSV** — download your session as a dated CSV (opens in Excel/Sheets).
- **⬆ Import CSV** — load a previous export back in (e.g. on another device).
- **Reset** — clear the session.

Progress auto-saves in the browser (`localStorage`), so you can close the tab
mid-workout and come back. Note: it saves **per device/browser** — use Export/Import
to move data between devices.

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
| `docs/index.html` | The whole app (HTML + CSS + JS inline) — served by Pages |
| `docs/images/` | Exercise images (+ naming guide) |
| `docs/404.html`, `docs/.nojekyll` | Pages helpers |
| `Personalized_3_Day_Gym_Training_Plan.md` | The full training plan this is based on |
