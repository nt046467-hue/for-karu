"use client";

import { useEffect, useRef } from "react";
import { useProposal } from "./state";
import { TIMELINE } from "@/lib/timeline";

/**
 * useTimelineController — advances scenes 1 → 4 based on the timings
 * defined in timeline.ts. Scenes 4 (ring open) and 5 (Yes) are user-gated.
 *
 * The controller waits for `startedAt` to be set (when the user taps Open
 * on the Gate screen) and then schedules phase transitions.
 */
export function useTimelineController() {
  const startedAt = useProposal((s) => s.startedAt);
  const setPhase = useProposal((s) => s.setPhase);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (startedAt === null) return;

    // Clear any previous timers (safety on remount)
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const schedule = (delaySec: number, fn: () => void) => {
      const t = setTimeout(fn, delaySec * 1000);
      timersRef.current.push(t);
    };

    // Scene 1 → Scene 2
    schedule(TIMELINE.memoriesStart, () => setPhase("memories"));
    // Scene 2 → Scene 3
    schedule(TIMELINE.turnStart, () => setPhase("turn"));
    // Scene 3 → Scene 4 (ring box appears)
    schedule(TIMELINE.ringStart, () => setPhase("ring-idle"));

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [startedAt, setPhase]);
}
