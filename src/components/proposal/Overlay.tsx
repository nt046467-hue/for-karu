"use client";

import { useEffect, useState, useRef } from "react";
import { useProposal } from "./state";
import { useAudioController } from "./useAudio";
import { COPY } from "@/lib/timeline";
import { cn } from "@/lib/utils";

/**
 * Overlay — all 2D UI text and buttons layered on top of the 3D canvas.
 *
 * Per-scene:
 *   - gate: "For Karu" + Open button (triggers audio + main timeline)
 *   - intro: lines fade in one-by-one
 *   - memories: no overlay (captions are 3D HTML inside the scene)
 *   - turn: pivot text lines fade in
 *   - ring-idle: "Tap to open" prompt
 *   - ring-open / ring-reveal: no overlay (let the ring breathe)
 *   - proposal: "Karu, will you marry me?" + Yes button + playful "Let me think"
 *   - answered: "I love you. Forever starts now."
 *
 * Plus: persistent MuteToggle in the top-right (visible after gate).
 */

export function Overlay() {
  const phase = useProposal((s) => s.phase);
  const start = useProposal((s) => s.start);
  const setPhase = useProposal((s) => s.setPhase);
  const { playChime } = useAudioController();

  return (
    <>
      {/* Persistent 2D layer */}
      <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
        {phase === "gate" && <GateScreen onOpen={() => {
          start();
        }} />}

        {phase === "intro" && <IntroText />}

        {phase === "turn" && <TurnText />}

        {phase === "ring-idle" && <RingIdlePrompt onTap={() => {
          setPhase("ring-open");
        }} />}

        {phase === "proposal" && (
          <ProposalUI
            onYes={() => setPhase("answered")}
          />
        )}

        {phase === "answered" && <AnsweredScreen />}
      </div>

      {/* Mute toggle — visible from intro onwards */}
      {phase !== "gate" && <MuteToggle />}
    </>
  );
}

// ---------- Scene 0: Gate ----------

function GateScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-8 px-6 text-center">
      <h1
        className="animate-pulse text-4xl sm:text-5xl md:text-6xl"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#f4e4c1",
          letterSpacing: "0.02em",
          textShadow: "0 0 20px rgba(244, 228, 193, 0.3)",
        }}
      >
        {COPY.gate.title}
      </h1>
      <p
        className="text-base sm:text-lg"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#a89a85",
          fontStyle: "italic",
        }}
      >
        {COPY.gate.subtitle}
      </p>
      <button
        onClick={onOpen}
        className="group relative mt-4 px-10 py-3 text-sm uppercase tracking-[0.3em] transition-all duration-500 hover:tracking-[0.4em]"
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#f4e4c1",
          background: "transparent",
          border: "1px solid rgba(244, 228, 193, 0.4)",
          letterSpacing: "0.3em",
        }}
      >
        <span className="relative z-10">{COPY.gate.button}</span>
        <span
          className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "radial-gradient(ellipse at center, rgba(244, 228, 193, 0.15) 0%, transparent 70%)",
          }}
        />
      </button>
      <p
        className="mt-8 text-xs"
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#5a5040",
          letterSpacing: "0.1em",
        }}
      >
        Best with sound on · Tap to begin
      </p>
    </div>
  );
}

// ---------- Scene 1: Intro text ----------

function IntroText() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = COPY.intro.lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 1500 + i * 4500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex max-w-2xl flex-col items-center gap-6 px-6 text-center">
      {COPY.intro.lines.map((line, i) => (
        <p
          key={i}
          className={cn(
            "text-xl sm:text-2xl md:text-3xl transition-opacity duration-[2500ms]",
            i < visibleLines ? "opacity-100" : "opacity-0"
          )}
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            color: "#f4e4c1",
            fontStyle: "italic",
            textShadow: "0 0 12px rgba(0, 0, 0, 0.6)",
            lineHeight: 1.4,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

// ---------- Scene 3: Turn text ----------

function TurnText() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = COPY.turn.lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 800 + i * 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex max-w-2xl flex-col items-center gap-8 px-6 text-center">
      {COPY.turn.lines.map((line, i) => (
        <p
          key={i}
          className={cn(
            "transition-opacity duration-[3000ms]",
            i === 0 && "text-lg sm:text-xl md:text-2xl",
            i === 1 && "text-3xl sm:text-4xl md:text-5xl",
            i < visibleLines ? "opacity-100" : "opacity-0"
          )}
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            color: i === 1 ? "#fff4e0" : "#a89a85",
            fontStyle: i === 1 ? "normal" : "italic",
            textShadow: "0 0 16px rgba(0, 0, 0, 0.7)",
            letterSpacing: i === 1 ? "0.04em" : "0.02em",
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

// ---------- Scene 4: Ring idle prompt ----------

function RingIdlePrompt({ onTap }: { onTap: () => void }) {
  return (
    <div className="pointer-events-auto absolute bottom-[15vh] flex flex-col items-center gap-3">
      <p
        className="animate-pulse text-base sm:text-lg"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#f4e4c1",
          fontStyle: "italic",
          letterSpacing: "0.1em",
        }}
      >
        {COPY.ring.openPrompt}
      </p>
      <button
        onClick={onTap}
        aria-label="Open the box"
        className="pointer-events-auto h-16 w-16 rounded-full border border-[#f4e4c1]/40 transition-all duration-300 hover:scale-110 hover:border-[#f4e4c1]/80"
        style={{
          background: "radial-gradient(circle, rgba(244, 228, 193, 0.15) 0%, transparent 70%)",
        }}
      >
        <span
          className="text-2xl"
          style={{ color: "#f4e4c1", filter: "drop-shadow(0 0 8px rgba(244, 228, 193, 0.5))" }}
        >
          ✦
        </span>
      </button>
    </div>
  );
}

// ---------- Scene 5: Proposal ----------

function ProposalUI({ onYes }: { onYes: () => void }) {
  const [yesScale] = useState(1);
  const yesPulseRef = useRef<HTMLButtonElement>(null);
  const thinkRef = useRef<HTMLButtonElement>(null);
  const [thinkPos, setThinkPos] = useState({ x: 0, y: 0 });
  const [thinkOpacity, setThinkOpacity] = useState(0.5);
  const [thinkClicks, setThinkClicks] = useState(0);

  // Yes button gentle pulse loop
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const scale = 1 + Math.sin(t * 2) * 0.04; // 1 ↔ 1.04 loop
      if (yesPulseRef.current) {
        yesPulseRef.current.style.transform = `scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // "Let me think" — playful: dodges away on hover, fades after 3 attempts
  const dodge = () => {
    const next = thinkClicks + 1;
    setThinkClicks(next);
    const x = (Math.random() - 0.5) * 280;
    const y = (Math.random() - 0.5) * 140;
    setThinkPos({ x, y });
    setThinkOpacity(Math.max(0.1, 0.5 - next * 0.15));
    if (next >= 4) {
      setTimeout(() => setThinkOpacity(0), 300);
    }
  };

  return (
    <div className="pointer-events-auto absolute bottom-[10vh] flex w-full flex-col items-center gap-8 px-6">
      <h2
        key="proposal-line"
        className="animate-[fadeIn_2s_ease-out] text-center text-3xl sm:text-4xl md:text-5xl"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#fff4e0",
          fontStyle: "italic",
          textShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(244, 228, 193, 0.2)",
          letterSpacing: "0.03em",
          lineHeight: 1.3,
        }}
      >
        {COPY.ring.proposal}
      </h2>

      <div className="relative flex items-center justify-center gap-6">
        <button
          ref={yesPulseRef}
          onClick={onYes}
          style={{
            transform: `scale(${yesScale})`,
            background: "radial-gradient(ellipse at center, #f4e4c1 0%, #d4b886 100%)",
            color: "#2a0a14",
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.5rem",
            padding: "1rem 3.5rem",
            borderRadius: "9999px",
            boxShadow: "0 0 40px rgba(244, 228, 193, 0.5), 0 0 80px rgba(244, 228, 193, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 60px rgba(244, 228, 193, 0.8), 0 0 120px rgba(244, 228, 193, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 40px rgba(244, 228, 193, 0.5), 0 0 80px rgba(244, 228, 193, 0.2)";
          }}
        >
          {COPY.ring.yesLabel}
        </button>

        <button
          ref={thinkRef}
          onMouseEnter={dodge}
          onClick={dodge}
          style={{
            transform: `translate(${thinkPos.x}px, ${thinkPos.y}px)`,
            opacity: thinkOpacity,
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.85rem",
            color: "#a89a85",
            background: "transparent",
            border: "1px solid rgba(168, 154, 133, 0.3)",
            padding: "0.4rem 1rem",
            borderRadius: "9999px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
          }}
        >
          {COPY.ring.thinkLabel}
        </button>
      </div>
    </div>
  );
}

// ---------- Scene 5: Answered ----------

function AnsweredScreen() {
  return (
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      <h2
        className="animate-[fadeIn_2s_ease-out] text-3xl sm:text-4xl md:text-5xl"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#fff4e0",
          fontStyle: "italic",
          textShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 60px rgba(244, 228, 193, 0.4)",
          letterSpacing: "0.04em",
        }}
      >
        {COPY.ring.finalLine}
      </h2>
    </div>
  );
}

// ---------- Mute toggle ----------

function MuteToggle() {
  const audioEnabled = useProposal((s) => s.audioEnabled);
  const toggleAudio = useProposal((s) => s.toggleAudio);

  return (
    <button
      onClick={toggleAudio}
      aria-label={audioEnabled ? "Mute" : "Unmute"}
      className="pointer-events-auto fixed right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#f4e4c1]/20 bg-black/40 backdrop-blur-sm transition-all hover:border-[#f4e4c1]/60"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f4e4c1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {audioEnabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
    </button>
  );
}
