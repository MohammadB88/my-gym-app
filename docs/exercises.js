// Exercise registry — one entry per distinct movement, keyed by id. Days
// reference exercises by id (see days.js), so an exercise defined once here
// can appear in multiple days, be reordered, or retired to ARCHIVE without
// copying its data. `img` is NOT here — the same machine is often photographed
// differently per day, so each day's `ex` entry carries its own `img` path.
//
// Fields: name, scheme (sets x reps · rest), cue, and optional tg / howto
// reference URLs (see index.html's technogymLink()/howtoLink() for how these
// are used).
const EXERCISES = {
  lat_pulldown: {
    name: "Neutral-Grip Lat Pulldown Machine",
    scheme: "3 × 8–12 · 90s rest",
    cue: "Pull toward the upper chest. Keep ribs controlled, avoid excessive backward lean, don't pull behind the neck.",
    tg: "https://www.technogym.com/en-US/product/selection-700-lat-machine_MNLC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/",
  },
  chest_press: {
    name: "Machine Chest Press",
    scheme: "3 × 8–10 · 90s rest",
    cue: "Handles near mid-chest. Shoulder blades gently set; stop before form changes.",
    tg: "https://www.technogym.com/en-US/product/selection-700-chest-press_MNFC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/188/seated-chest-press/",
  },
  hip_thrust: {
    name: "Hip Thrust / Glute Bridge Machine",
    scheme: "3 × 8–12 · 90–120s rest",
    cue: "Drive through the feet, finish with the glutes. Avoid excessive lower-back arching.",
    tg: "https://www.technogym.com/en-US/product/selection-900-hip-thrust_MN2P.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/",
  },
  lying_leg_curl: {
    name: "Lying Leg Curl",
    scheme: "3 × 10–12 · 75–90s rest",
    cue: "Align knee with the machine pivot. Curl smoothly without lifting hips from the pad.",
    tg: "https://www.technogym.com/en-US/product/selection-900-prone-leg-curl_MNUP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/131/prone-lying-hamstrings-curl/",
  },
  reverse_pec_deck: {
    name: "Reverse Pec Deck / Rear-Delt",
    scheme: "2 × 12–15 · 60–75s rest",
    cue: "Chest against the pad. Move upper arms back without shrugging or forcing range.",
    tg: "https://www.technogym.com/en-US/product/selection-700-dual-pectoral-reverse-fly_MNNC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/353/reverse-fly/",
  },
  overhead_press: {
    name: "Seated Overhead Press",
    scheme: "2 × 8–10 · 90s rest",
    cue: "Comfortable grip and range. Back supported; avoid forcefully locking the elbows.",
    tg: "https://www.technogym.com/en-US/product/selection-700-shoulder-press_MNEC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/186/seated-shoulder-press/",
  },
  leg_extension: {
    name: "Seated Leg Extension",
    scheme: "2 × 12–15 · 60–75s rest",
    cue: "Light load, pain-free controlled range. No swinging, don't force full extension.",
    tg: "https://www.technogym.com/en-US/product/selection-700-leg-extension_MNJC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/183/seated-leg-extension/",
  },
  hip_abductor: {
    name: "Hip Abductor Machine",
    scheme: "2 × 12–15 · 60s rest",
    cue: "Torso still, open the legs under control. Don't bounce at the end of range.",
    tg: "https://www.technogym.com/en-INT/product/selection-900-abductor_MNPP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/38/side-lying-hip-abduction/",
  },
  hip_adductor: {
    name: "Hip Adductor Machine",
    scheme: "1–2 × 12–15 · 60s rest",
    cue: "Moderate, comfortable start. Bring the legs together slowly.",
    tg: "https://www.technogym.com/en-US/product/selection-900-adductor_MNQP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/39/side-lying-hip-adduction/",
  },
  biceps_curl: {
    name: "Machine Biceps Curl",
    scheme: "2 × 10–12 · alternating pair",
    cue: "Align elbows with pivot. Avoid shoulder movement and forceful lockout. Pair with 10B.",
    tg: "https://www.technogym.com/en-US/product/selection-900-arm-curl_MNRP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/184/seated-biceps-curl/",
  },
  triceps_extension: {
    name: "Triceps Extension / Pressdown",
    scheme: "2 × 10–12 · 60–75s after pair",
    cue: "Elbows controlled, shoulders relaxed. No torso momentum. Pair with 10A.",
    tg: "https://www.technogym.com/en-US/product/selection-900-arm-extension_MNSP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/185/triceps-pushdowns/",
  },
  pallof_press: {
    name: "Pallof Press / Dead Bug",
    scheme: "2–3 × 8–10 per side · 45–60s rest",
    cue: "Brace gently; keep pelvis and rib cage controlled. Stability over load or speed.",
    tg: "https://www.technogym.com/en-US/product/dual-adjustable-pulley-performance_MB43.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/332/standing-anti-rotation-press/",
  },
  chest_supported_row: {
    name: "Chest-Supported Row Machine",
    scheme: "3 × 8–12 · 90s rest",
    cue: "Keep the chest on the pad. Pull the elbows back, pause briefly, and avoid shrugging.",
    tg: "https://www.technogym.com/en-INT/product/selection-700-low-row_MNHC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/",
  },
  incline_chest_press: {
    name: "Incline Machine Chest Press",
    scheme: "3 × 8–10 · 90s rest",
    cue: "Handles around upper-chest level. Keep shoulder blades stable; stop before form changes.",
    tg: "https://www.technogym.com/en-US/product/pure-incline-chest-press_MG1500-NBGJV0.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/25/incline-chest-press/",
  },
  back_extension: {
    name: "Back Extension (Machine or 45°)",
    scheme: "3 × 10–12 · 75–90s rest",
    cue: "Small hip-driven arc. Finish tall without leaning backward or hyperextending.",
    tg: "https://www.technogym.com/en-US/product/selection-700-lower-back_MNCC.html",
  },
  seated_leg_curl: {
    name: "Seated Leg Curl",
    scheme: "3 × 10–12 · 75–90s rest",
    cue: "Align knees with the pivot. Curl smoothly and control the return without bouncing.",
    tg: "https://www.technogym.com/en-INT/product/selection-700-leg-curl_MNIC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/153/lying-hamstrings-curl/",
  },
  pullover: {
    name: "Machine Pullover / Straight-Arm Pulldown",
    scheme: "2 × 10–12 · 60–75s rest",
    cue: "Keep ribs controlled. Move through the shoulders; don't turn it into a triceps press.",
    tg: "https://www.technogym.com/en-INT/product/pure-strength-pullover_MG9000-NBGJV0.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/37/lying-pullovers/",
  },
  lateral_raise: {
    name: "Machine Lateral Raise",
    scheme: "2 × 12–15 · 60s rest",
    cue: "Raise only to a comfortable height. Keep shoulders down and avoid swinging.",
    tg: "https://www.technogym.com/en-INT/product/selection-700-delts-machine_MNKC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/",
  },
  calf_raise: {
    name: "Seated / Standing Calf Raise",
    scheme: "3 × 10–15 · 60–75s rest",
    cue: "Controlled stretch and rise. Keep pressure even across the forefoot.",
    tg: "https://www.technogym.com/en-US/product/selection-900-standing-calf_MN5P.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/51/calf-raises/",
  },
  face_pull: {
    name: "Cable Face Pull",
    scheme: "2 × 12–15 · 60–75s rest",
    cue: "Pull toward eye level with the elbows high enough to stay comfortable. Don't arch the back.",
    tg: "https://www.technogym.com/en-US/product/dual-adjustable-pulley-performance_MB43.html",
  },
  hammer_curl: {
    name: "Machine Hammer / Neutral-Grip Curl",
    scheme: "2 × 10–12 · alternating pair",
    cue: "Upper arms still, wrists neutral. Stop before the shoulders roll forward. Pair with 10B.",
    tg: "https://www.technogym.com/en-US/product/selection-900-arm-curl_MNRP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/10/hammer-curl/",
  },
  rope_pressdown: {
    name: "Rope Triceps Pressdown",
    scheme: "2 × 10–12 · 60–75s after pair",
    cue: "Keep elbows close and shoulders relaxed. No torso momentum. Pair with 10A.",
    tg: "https://www.technogym.com/en-US/product/dual-adjustable-pulley-performance_MB43.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/185/triceps-pushdowns/",
  },
  side_plank: {
    name: "Side Plank / Bird Dog",
    scheme: "2–3 sets per side · 45–60s rest",
    cue: "Brace gently and keep the trunk long. Choose the version that stays pain-free.",
    tg: "https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/",
  },
  high_row: {
    name: "High Row Machine",
    scheme: "3 × 8–12 · 90s rest",
    cue: "Keep the chest supported. Pull down and back without leaning or shrugging.",
    tg: "https://www.technogym.com/en-US/product/selection-900-vertical-traction_MNGP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/336/high-row/",
  },
  shoulder_press: {
    name: "Seated Machine Shoulder Press",
    scheme: "3 × 8–10 · 90s rest",
    cue: "Comfortable grip and range. Back supported; avoid hard elbow lockout.",
    tg: "https://www.technogym.com/en-INT/product/selection-700-shoulder-press_MNEC.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/186/seated-shoulder-press/",
  },
  pec_deck: {
    name: "Pec Deck / Cable Chest Fly",
    scheme: "2 × 10–12 · 60–75s rest",
    cue: "Comfortable shoulder range. Bring the arms together without rounding forward.",
    tg: "https://www.technogym.com/en-US/product/selection-900-pectoral_MNTP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/160/standing-chest-fly/",
  },
  cable_row: {
    name: "Neutral-Grip Seated Cable Row",
    scheme: "2 × 10–12 · 75–90s rest",
    cue: "Stay tall and pull toward the lower ribs. Avoid rocking backward.",
    tg: "https://www.technogym.com/en-US/product/selection-900-low-row_MNHP.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/",
  },
  seated_calf_raise: {
    name: "Seated Calf Raise",
    scheme: "3 × 12–15 · 60–75s rest",
    cue: "Pause briefly at the top and lower under control. Avoid bouncing.",
    tg: "https://www.technogym.com/en-US/product/pure-seated-calf_MG4600-NBGJV0.html",
    howto: "https://www.acefitness.org/resources/everyone/exercise-library/51/calf-raises/",
  },
  cable_hip_extension: {
    name: "Supported Cable Hip Extension",
    scheme: "2 × 12–15 per side · 60s rest",
    cue: "Hold a stable support. Move from the hip without twisting the pelvis or arching.",
    tg: "https://www.technogym.com/en-US/product/dual-adjustable-pulley-performance_MB43.html",
  },
  dead_bug: {
    name: "Dead Bug",
    scheme: "2–3 × 6–10 per side · 45–60s rest",
    cue: "Keep the lower back gently supported and move the opposite arm and leg slowly.",
    tg: "https://www.acefitness.org/resources/everyone/exercise-library/147/supine-dead-bug/",
  },
};

// Exercises defined above but not currently scheduled in any day. Kept here
// (rather than deleted) so their workout history stays meaningful if they're
// re-added to a day later — just add `{ n, id, img }` to that day's `ex` list.
const ARCHIVE = [];
