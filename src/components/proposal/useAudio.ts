"use client";

import { useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";
import { AUDIO } from "@/lib/timeline";
import { useProposal } from "./state";

/**
 * Audio controller hook.
 *
 * Browsers block audio autoplay until a user gesture. The Gate screen tap
 * counts as that gesture, so we lazily instantiate the Howl on first start()
 * call and play it immediately.
 *
 * If the audio files are missing (404), Howler fails silently — the experience
 * continues without sound. This is intentional: silence is better than a
 * broken moment.
 */
export function useAudioController() {
  const bgRef = useRef<Howl | null>(null);
  const chimeRef = useRef<Howl | null>(null);
  const audioStarted = useProposal((s) => s.audioStarted);
  const audioEnabled = useProposal((s) => s.audioEnabled);

  // Lazily load + play background track when user passes the gate
  useEffect(() => {
    if (!audioStarted) return;
    if (bgRef.current) return;

    bgRef.current = new Howl({
      src: [AUDIO.background],
      loop: true,
      volume: 0.0,
      html5: true, // stream-friendly on mobile
      onloaderror: () => {
        // File missing — fail silently
        bgRef.current = null;
      },
      onplayerror: () => {
        // Some browsers need a second user gesture; ignore
      },
    });
    bgRef.current.play();
    bgRef.current.fade(0, 0.45, 2500);

    chimeRef.current = new Howl({
      src: [AUDIO.chime],
      volume: 0.6,
      html5: true,
      onloaderror: () => {
        chimeRef.current = null;
      },
    });
  }, [audioStarted]);

  // Mute / unmute in response to UI toggle
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    if (audioEnabled) {
      bg.fade(bg.volume(), 0.45, 400);
    } else {
      bg.fade(bg.volume(), 0, 400);
    }
  }, [audioEnabled]);

  const playChime = useCallback(() => {
    const chime = chimeRef.current;
    const bg = bgRef.current;
    if (chime && useProposal.getState().audioEnabled) {
      chime.play();
    }
    // Briefly duck the background track so the chime cuts through
    if (bg && useProposal.getState().audioEnabled) {
      const originalVol = bg.volume();
      bg.fade(originalVol, 0.15, 200);
      setTimeout(() => bg.fade(0.15, originalVol, 1200), 1100);
    }
  }, []);

  return { playChime };
}
