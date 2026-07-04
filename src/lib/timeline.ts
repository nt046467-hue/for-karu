/**
 * Single source of truth for all narrative copy and scene timings.
 * Edit this file to tune the experience — no need to touch component code.
 *
 * Timings are in SECONDS relative to the start of the main timeline
 * (which begins when the user taps "Open" on the Gate screen).
 */

export const TIMELINE = {
  // Scene 1 — Intro
  introStart: 0,
  introEnd: 8,

  // Scene 2 — Memories (photo stream)
  memoriesStart: 8,
  memoriesEnd: 35,

  // Scene 3 — The Turn (emotional pivot)
  turnStart: 35,
  turnEnd: 46,

  // Scene 4 — Ring box reveal (waits for user tap, so end is open-ended)
  ringStart: 46,

  // Per-photo cadence in the memory stream
  photoInterval: 5,
} as const;

export const COPY = {
  gate: {
    title: "For Karu",
    subtitle: "Wan na see this humm sweetie",
    button: "Show me",
  },
  intro: {
    lines: [
      "Every story has a beginning.",
      "Ours started quietly — a hello, a glance, a moment I didn't know would change everything.",
    ],
  },
  memories: {
    captions: [
      "No light shines brighter than you sweetie",
      "Your eyes,your smile - my favorite kind of light",
      "Every moment with you, a memory worth keeping",
      "Still can't believe someone this beautiful is mine",
      "Every ordinary day, made extraordinary by you",
    ],
  },
  turn: {
    lines: [
      "And somewhere along the way…",
      "I knew you were it.",
    ],
  },
  ring: {
    openPrompt: "I have a surprise for you",
    proposal: "Karu, how's is the box. Open it sweetie",
    yesLabel: "Lah",
    thinkLabel: "Bilkul nahi",
    finalLine: "I love you. Forever Ever and Ever ",
  },
} as const;

export const PHOTOS = [
  // Drop your real photos into /public/photos/ with these filenames.
  // Placeholders (procedural gradients) are generated if the file is missing.
  { src: "/photos/photo-1.jpeg", caption: COPY.memories.captions[0] },
  { src: "/photos/photo-2.jpeg", caption: COPY.memories.captions[1] },
  { src: "/photos/photo-3.jpeg", caption: COPY.memories.captions[2] },
  { src: "/photos/photo-4.jpeg", caption: COPY.memories.captions[3] },
  { src: "/photos/photo-5.jpeg", caption: COPY.memories.captions[4] },
] as const;

export const AUDIO = {
  background: "/audio/background.mp3",
  chime: "/audio/chime.mp3",
};
