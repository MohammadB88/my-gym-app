# Exercise Image Prompts — Training Plan

Prompts for generating the exercise images used on each workout card,
**split one file per session** so you can paste a single session into an AI
image tool at once. Each file is self-contained (it repeats the shared
style/negative rules and numbering note).

| Session | File | Prompts |
|-----|------|---------|
| Day 1 — Full-Body | [`image-prompts/day1.md`](image-prompts/day1.md) | D1-01 … D1-12 |
| Day 2 — Push/Pull + Posterior | [`image-prompts/day2.md`](image-prompts/day2.md) | D2-01 … D2-12 |
| Day 3 — Strength + Control | [`image-prompts/day3.md`](image-prompts/day3.md) | D3-01 … D3-12 |
| Core A — Stability | [`image-prompts/core-a.md`](image-prompts/core-a.md) | CA-01 … CA-05 |
| Core B — Oblique Emphasis | [`image-prompts/core-b.md`](image-prompts/core-b.md) | CB-01 … CB-05 |

**How to use:** open a session's file, paste its prompts into an image generator,
then save each output to the file path shown directly under its heading (e.g.
`docs/images/d1/01-lat-pulldown.jpg`). The app picks up a matching file
automatically — until then it shows an "Image coming soon" placeholder.

**Key rules (spelled out in each session file):** equipment/mat only, no people;
images are AI-generated and safe to bundle (don't substitute copyrighted
manufacturer photos); each Day 1–3 machine prompt matches the Technogym machine
linked from its card, while Core A/B are bodyweight mat work (no machines).
Core A and Core B share three exercises (Dead Bug, Side Plank, Bird Dog) — their
prompts are near-duplicates, so it's fine to reuse one session's generated image
for the other instead of regenerating.
