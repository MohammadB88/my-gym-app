# My Gym App — Day 1 Tracker

A simple, single-file web app to track the **Day 1** workout from my personalized
3-day training plan. No build step, no server, no dependencies — just open it.

## Use it

Open [`index.html`](index.html) in any browser (double-click, or serve it). Works
on phone and desktop.

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

Each exercise shows an image from the [`images/`](images/) folder, or an "Image
coming soon" placeholder until one exists. Drop a file in using the filename listed
in [`images/README.txt`](images/README.txt) and it appears automatically — no code
changes needed.

## Publishing

Being a static site, it can be hosted for free on **GitHub Pages** as-is.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole app (HTML + CSS + JS inline) |
| `images/` | Exercise images (+ naming guide) |
| `Personalized_3_Day_Gym_Training_Plan.md` | The full training plan this is based on |
