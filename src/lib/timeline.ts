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
  introEnd: 18,

  // Scene 2 — Memories (photo stream)
  memoriesStart: 18,
  memoriesEnd: 58,

  // Scene 3 — The Turn (emotional pivot)
  turnStart: 58,
  turnEnd: 76,

  // Scene 4 — Ring box reveal (waits for user tap, so end is open-ended)
  ringStart: 76,

  // Per-photo cadence in the memory stream
  photoInterval: 6.5,
} as const;

export const COPY = {
  gate: {
    title: "For Karu",
    subtitle: "You're going to want to see this",
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
      "The first trip we took together",
      "That rainy afternoon we never wanted to end",
      "The way you laugh at your own jokes",
      "Slow mornings, nowhere to be",
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
    proposal: "Karu, will you marry me?",
    yesLabel: "Yes, forever",
    thinkLabel: "Try saying no",
    finalLine: "I love you. Forever starts now.",
  },
} as const;

export const PHOTOS = [
  // Drop your real photos into /public/photos/ with these filenames.
  // Placeholders (procedural gradients) are generated if the file is missing.
  { src: "/photos/photo-1.webp", caption: COPY.memories.captions[0] },
  { src: "/photos/photo-2.webp", caption: COPY.memories.captions[1] },
  { src: "/photos/photo-3.webp", caption: COPY.memories.captions[2] },
  { src: "/photos/photo-4.webp", caption: COPY.memories.captions[3] },
  { src: "/photos/photo-5.webp", caption: COPY.memories.captions[4] },
] as const;

export const AUDIO = {
  background: "/audio/background.mp3",
  chime: "/audio/chime.mp3",
};
