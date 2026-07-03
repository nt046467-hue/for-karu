"use client";

import { create } from "zustand";

export type Phase =
  | "gate" // Scene 0 — black screen with "Open" button
  | "intro" // Scene 1 — starfield + intro lines
  | "memories" // Scene 2 — photo stream
  | "turn" // Scene 3 — emotional pivot
  | "ring-idle" // Scene 4 — box visible, waiting for tap
  | "ring-open" // Scene 4 — box opening, ring rising
  | "ring-reveal" // Scene 4 — ring fully revealed, rotating
  | "proposal" // Scene 5 — proposal text + Yes button visible
  | "answered"; // Scene 5 — Yes clicked, confetti + final line

interface ProposalState {
  phase: Phase;
  audioEnabled: boolean;
  audioStarted: boolean;
  startedAt: number | null; // performance.now() ms when timeline began
  setPhase: (p: Phase) => void;
  start: () => void;
  toggleAudio: () => void;
  reset: () => void;
}

export const useProposal = create<ProposalState>((set, get) => ({
  phase: "gate",
  audioEnabled: true,
  audioStarted: false,
  startedAt: null,
  setPhase: (p) => set({ phase: p }),
  start: () =>
    set({
      phase: "intro",
      audioStarted: true,
      startedAt: performance.now(),
    }),
  toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
  reset: () =>
    set({
      phase: "gate",
      audioStarted: false,
      startedAt: null,
      audioEnabled: true,
    }),
}));

/** Helper — is the user past the gate? */
export function isPastGate(phase: Phase): boolean {
  return phase !== "gate";
}

/** Helper — is the user in the ring sequence? */
export function inRingSequence(phase: Phase): boolean {
  return (
    phase === "ring-idle" ||
    phase === "ring-open" ||
    phase === "ring-reveal" ||
    phase === "proposal" ||
    phase === "answered"
  );
}
