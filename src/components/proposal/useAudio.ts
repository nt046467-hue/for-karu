"use client";

import { useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";
import { AUDIO } from "@/lib/timeline";
import { useProposal } from "./state";

/**
 * Audio controller hook — singleton pattern.
 *
 * Module-level refs ensure only ONE Howl instance ever exists for background
 * and chime, no matter how many components call useAudioController().
 * This prevents double-audio when e.g. RingScene and Experience both call it.
 *
 * Browsers block audio autoplay until a user gesture. The Gate screen tap
 * counts as that gesture, so we lazily instantiate on first start() call.
 *
 * If audio files are missing (404), Howler fails silently — silence > broken.
 */

// Module-level singletons — shared across all hook instances
let _bgHowl: Howl | null = null;
let _chimeHowl: Howl | null = null;
let _bgStarted = false;

export function useAudioController() {
  const audioStarted = useProposal((s) => s.audioStarted);
  const audioEnabled = useProposal((s) => s.audioEnabled);

  // Lazily load + play background track when user passes the gate.
  // When audioStarted resets to false (user goes back to gate), stop and clean up.
  useEffect(() => {
    if (!audioStarted) {
      // Reset happened — stop existing audio and clear singleton so it can restart
      if (_bgHowl) { _bgHowl.stop(); _bgHowl.unload(); _bgHowl = null; }
      if (_chimeHowl) { _chimeHowl.unload(); _chimeHowl = null; }
      _bgStarted = false;
      return;
    }
    if (_bgStarted) return; // already started — don't create a second instance
    _bgStarted = true;

    _bgHowl = new Howl({
      src: [AUDIO.background],
      loop: true,
      volume: 0.0,
      html5: true, // stream-friendly on mobile
      onloaderror: () => {
        _bgHowl = null;
      },
      onplayerror: () => {
        // Some browsers need a second user gesture; ignore
      },
    });
    _bgHowl.play();
    _bgHowl.fade(0, 0.45, 2500);

    _chimeHowl = new Howl({
      src: [AUDIO.chime],
      volume: 0.6,
      html5: true,
      onloaderror: () => {
        _chimeHowl = null;
      },
    });
  }, [audioStarted]);

  // Mute / unmute in response to UI toggle
  useEffect(() => {
    const bg = _bgHowl;
    if (!bg) return;
    if (audioEnabled) {
      bg.fade(bg.volume(), 0.45, 400);
    } else {
      bg.fade(bg.volume(), 0, 400);
    }
  }, [audioEnabled]);

  const playChime = useCallback(() => {
    const bg = _bgHowl;
    const audioEnabled = useProposal.getState().audioEnabled;
    if (!audioEnabled) return;

    // Fade background completely out before chime starts
    if (bg) {
      const originalVol = bg.volume();
      bg.fade(originalVol, 0, 600); // smooth 0.6s fade out

      // Create a fresh chime each time (prevents overlap issues)
      const chime = new Howl({
        src: [AUDIO.chime],
        volume: 0,
        html5: true,
        onloaderror: () => {
          // Chime missing — just restore background
          if (bg) bg.fade(0, originalVol, 800);
        },
        onend: () => {
          // Chime finished — fade background back in smoothly
          if (bg && useProposal.getState().audioEnabled) {
            bg.fade(bg.volume(), originalVol, 1800);
          }
        },
      });

      // Start chime after background has faded
      setTimeout(() => {
        if (!useProposal.getState().audioEnabled) {
          // User muted during fade — just restore bg silently
          return;
        }
        chime.volume(0);
        chime.play();
        chime.fade(0, 0.75, 300); // fade chime in
      }, 500);

    } else {
      // No background — play chime directly
      if (_chimeHowl) {
        _chimeHowl.stop();
        _chimeHowl.play();
      }
    }
  }, []);

  return { playChime };
}
