"use client";

import { useEffect, useState, useRef } from "react";
import { useProposal } from "./state";
import { useAudioController } from "./useAudio";
import { COPY, PHOTOS } from "@/lib/timeline";

/**
 * Overlay — all 2D UI text and buttons layered on top of the 3D canvas.
 */

export function Overlay() {
  const phase = useProposal((s) => s.phase);
  const start = useProposal((s) => s.start);
  const setPhase = useProposal((s) => s.setPhase);
  const reset = useProposal((s) => s.reset);
  const { playChime } = useAudioController();

  // Always start from gate on fresh page load
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Persistent 2D layer — full screen, centered, all inline styles */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {phase === "gate" && (
          <GateScreen
            onOpen={() => {
              start();
            }}
          />
        )}
        {phase === "intro" && <IntroText />}
        {phase === "turn" && <TurnText />}
        {phase === "ring-idle" && (
          <RingIdlePrompt
            onTap={() => {
              setPhase("ring-open");
            }}
          />
        )}
        {phase === "proposal" && (
          <ProposalUI onYes={() => setPhase("answered")} />
        )}
        {phase === "answered" && <AnsweredScreen />}
      </div>

      {/* Memories overlay — full-screen polaroid carousel */}
      {phase === "memories" && <MemoriesOverlay />}

      {/* Mute toggle — visible from intro onwards */}
      {phase !== "gate" && <MuteToggle />}
    </>
  );
}

// ---------- Scene 0: Gate ----------

function GateScreen({ onOpen }: { onOpen: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        pointerEvents: "auto",
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        boxSizing: "border-box",
        zIndex: 100,
        background:
          "radial-gradient(ellipse at 50% 60%, #1a0d1a 0%, #0a080f 50%, #000000 100%)",
      }}
    >
      {/* Floating rose petal decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[...Array(16)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${5 + i * 5.8}%`,
              top: `${8 + (i % 5) * 18}%`,
              fontSize:
                i % 3 === 0 ? "1.4rem" : i % 3 === 1 ? "0.9rem" : "1.1rem",
              opacity: 0.1 + (i % 5) * 0.05,
              animation: `floatPetal ${4 + (i % 5) * 0.6}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 3}s`,
              color: i % 2 === 0 ? "#e8829a" : "#f9d4c8",
              userSelect: "none",
            }}
          >
            {i % 4 === 0 ? "✿" : i % 4 === 1 ? "❀" : i % 4 === 2 ? "♡" : "❋"}
          </span>
        ))}
      </div>

      {/* Big glowing heart */}
      <div
        style={{
          marginBottom: "1.5rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1)" : "scale(0.4)",
          transition:
            "opacity 1.2s ease-out, transform 1.2s cubic-bezier(0.34,1.56,0.64,1)",
          transitionDelay: "0.2s",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 54 54"
          fill="none"
          style={{
            filter:
              "drop-shadow(0 0 24px rgba(232,130,154,0.9)) drop-shadow(0 0 50px rgba(232,130,154,0.4))",
            animation: "heartBeat 2s ease-in-out infinite",
          }}
        >
          <defs>
            <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f9d4c8" />
              <stop offset="50%" stopColor="#e8829a" />
              <stop offset="100%" stopColor="#c2506e" />
            </linearGradient>
          </defs>
          <path
            d="M27 46s-18-11-18-23a11 11 0 0 1 18-8.5A11 11 0 0 1 45 23c0 12-18 23-18 23z"
            fill="url(#hg)"
          />
          <path
            d="M22 18c-2.5 1-4.5 3.5-5 6"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title: For Karu */}
      <div
        style={{
          marginBottom: "0.5rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1.4s ease-out, transform 1.4s ease-out",
          transitionDelay: "0.5s",
        }}
      >
        <h1
          style={{
            fontFamily: "'Great Vibes', 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
            color: "#fff4e0",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            margin: 0,
            textShadow:
              "0 0 40px rgba(244,228,193,0.7), 0 0 80px rgba(232,130,154,0.35), 0 3px 6px rgba(0,0,0,0.9)",
          }}
        >
          {COPY.gate.title}
        </h1>
      </div>

      {/* Divider */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease-out",
          transitionDelay: "0.9s",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "260px",
          margin: "0.8rem 0",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(232,130,154,0.5))",
          }}
        />
        <span style={{ color: "#e8829a", fontSize: "1.2rem", opacity: 0.9 }}>
          ♡
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(to left, transparent, rgba(232,130,154,0.5))",
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginBottom: "2.5rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
          transitionDelay: "1.1s",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.1rem, 3.5vw, 1.5rem)",
            color: "#d4a8b8",
            fontStyle: "italic",
            letterSpacing: "0.06em",
            margin: 0,
            textShadow: "0 0 30px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.7)",
          }}
        >
          {COPY.gate.subtitle}
        </p>
      </div>

      {/* Big centered romantic button */}
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? "scale(1) translateY(0)"
            : "scale(0.8) translateY(20px)",
          transition:
            "opacity 1.4s ease-out, transform 1.4s cubic-bezier(0.34,1.56,0.64,1)",
          transitionDelay: "1.5s",
        }}
      >
        <button
          onClick={onOpen}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            padding: "1.2rem 5rem",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            fontStyle: "italic",
            letterSpacing: "0.15em",
            color: hovered ? "#2a0a14" : "#fff4e0",
            background: hovered
              ? "linear-gradient(135deg, #f9d4c8 0%, #e8829a 50%, #c2506e 100%)"
              : "linear-gradient(135deg, rgba(232,130,154,0.22) 0%, rgba(194,80,110,0.15) 100%)",
            border: hovered
              ? "1px solid rgba(255,255,255,0.4)"
              : "1px solid rgba(232,130,154,0.5)",
            borderRadius: "9999px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            boxShadow: hovered
              ? "0 0 60px rgba(232,130,154,0.7), 0 0 120px rgba(232,130,154,0.3)"
              : "0 0 35px rgba(232,130,154,0.2)",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>♡</span>
          <span>{COPY.gate.button}</span>
          <span style={{ fontSize: "1.3rem" }}>♡</span>
        </button>
      </div>

      {/* Sound hint */}
      <div
        style={{
          marginTop: "1.8rem",
          opacity: mounted ? 0.45 : 0,
          transition: "opacity 1.4s ease-out",
          transitionDelay: "2s",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            color: "#8a7060",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          🎵 Best with sound on
        </p>
      </div>
    </div>
  );
}

// ---------- Scene 2: Memories — Polaroid photo carousel ----------

function MemoriesOverlay() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);
  const photos = PHOTOS as unknown as { src: string; caption: string }[];

  useEffect(() => {
    // Fade in the first photo
    const t0 = setTimeout(() => setVisible(true), 300);
    const t1 = setTimeout(() => setCaptionVisible(true), 1200);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  useEffect(() => {
    if (current >= photos.length - 1) return;
    const interval = setTimeout(() => {
      // Start leaving animation
      setLeaving(true);
      setCaptionVisible(false);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setLeaving(false);
        setVisible(false);
        setTimeout(() => setVisible(true), 80);
        setTimeout(() => setCaptionVisible(true), 900);
      }, 700);
    }, 3200);
    return () => clearTimeout(interval);
  }, [current, photos.length]);

  const photo = photos[current];
  // Slight random tilt per photo for polaroid realism
  const tiltAngles = [-2.5, 1.8, -1.2, 2.8, -0.8];
  const tilt = tiltAngles[current % tiltAngles.length];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 15,
        pointerEvents: "none",
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          display: "flex",
          gap: "8px",
          zIndex: 20,
        }}
      >
        {photos.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              borderRadius: "9999px",
              background:
                i === current
                  ? "linear-gradient(90deg, #f9d4c8, #e8829a)"
                  : "rgba(232,130,154,0.3)",
              transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow:
                i === current ? "0 0 10px rgba(232,130,154,0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* Polaroid card */}
      <div
        style={{
          position: "relative",
          opacity: visible ? 1 : 0,
          transform: leaving
            ? `rotate(${tilt + 8}deg) translateY(-30px) scale(0.88)`
            : visible
              ? `rotate(${tilt}deg) translateY(0px) scale(1)`
              : `rotate(${tilt - 6}deg) translateY(40px) scale(0.92)`,
          transition: leaving
            ? "all 0.65s cubic-bezier(0.4,0,0.2,1)"
            : "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          // Polaroid white frame
          background: "#fffdf8",
          padding: "12px 12px 52px 12px",
          borderRadius: "4px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.7), 0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(0,0,0,0.06)",
          maxWidth: "min(340px, 80vw)",
          width: "100%",
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            overflow: "hidden",
            borderRadius: "2px",
            background: "#1a1014",
            position: "relative",
          }}
        >
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.caption}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "2px",
              pointerEvents: "none",
              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
          {/* Subtle inner vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.25) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Privacy Watermark Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "16px",
              boxSizing: "border-box",
              pointerEvents: "none",
              userSelect: "none",
              opacity: 0.18,
              fontFamily: "Georgia, serif",
              color: "#ffffff",
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", transform: "rotate(-8deg)" }}>
              <span>For Karu ♡</span>
              <span>Only For Karu ♡</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", fontSize: "11px", transform: "rotate(-8deg)", fontWeight: "bold" }}>
              <span>Private Memory 🔒</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", transform: "rotate(-8deg)" }}>
              <span>Only For Karu ♡</span>
              <span>For Karu ♡</span>
            </div>
          </div>
        </div>

        {/* Caption inside polaroid white strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
          }}
        >
          <p
            style={{
              fontFamily:
                "'Dancing Script', 'Caveat', 'Segoe Script', Georgia, serif",
              fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)",
              color: "#3a2020",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.3,
              opacity: captionVisible ? 1 : 0,
              transform: captionVisible ? "translateY(0)" : "translateY(6px)",
              transition: "all 0.8s ease-out",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {photo.caption}
          </p>
        </div>
      </div>

      {/* Photo counter */}
      <div
        style={{
          marginTop: "2rem",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "0.8rem",
          color: "rgba(244,228,193,0.5)",
          letterSpacing: "0.2em",
          fontStyle: "italic",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease-out 0.5s",
        }}
      >
        {current + 1} of {photos.length}
      </div>
    </div>
  );
}

// ---------- Scene 1: Intro text ----------

function IntroText() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = COPY.intro.lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 1500 + i * 4500),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.5rem",
        textAlign: "center",
        maxWidth: "680px",
        width: "100%",
      }}
    >
      {COPY.intro.lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(1.2rem, 3.5vw, 2rem)",
            color: "#f4e4c1",
            fontStyle: "italic",
            textShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)",
            lineHeight: 1.5,
            margin: 0,
            opacity: i < visibleLines ? 1 : 0,
            transition: "opacity 2.5s ease-out",
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
      setTimeout(() => setVisibleLines(i + 1), 800 + i * 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        padding: "1.5rem",
        textAlign: "center",
        maxWidth: "680px",
        width: "100%",
      }}
    >
      {COPY.turn.lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily:
              i === 1
                ? "'Great Vibes', Cormorant Garamond, Georgia, serif"
                : "Cormorant Garamond, Georgia, serif",
            fontSize:
              i === 1
                ? "clamp(2.5rem, 8vw, 5rem)"
                : "clamp(1rem, 2.5vw, 1.4rem)",
            color: i === 1 ? "#fff4e0" : "#a89a85",
            fontStyle: i === 1 ? "normal" : "italic",
            textShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)",
            letterSpacing: i === 1 ? "0.04em" : "0.02em",
            margin: 0,
            opacity: i < visibleLines ? 1 : 0,
            transition: "opacity 3s ease-out",
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
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        textAlign: "center",
        width: "100%",
        maxWidth: "480px",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontFamily: "'Great Vibes', 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2rem, 6vw, 3.2rem)",
          color: "#fff4e0",
          letterSpacing: "0.04em",
          margin: 0,
          textShadow:
            "0 0 30px rgba(232,130,154,0.6), 0 0 60px rgba(0,0,0,0.9)",
          lineHeight: 1.2,
        }}
      >
        {COPY.ring.openPrompt}
      </p>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
          color: "#d4a8b8",
          fontStyle: "italic",
          letterSpacing: "0.12em",
          margin: "0 0 0.5rem 0",
          opacity: 0.85,
        }}
      >
        Tap to open the box ♡
      </p>

      <button
        onClick={onTap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open the box"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "120px",
          height: "120px",
          position: "relative",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: hovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,130,154,0.3) 0%, transparent 70%)",
            filter: "blur(5px)",
            animation: "heartBeat 1.8s ease-in-out infinite",
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.3s ease",
          }}
        />
        <svg
          width="90"
          height="90"
          viewBox="0 0 54 54"
          fill="none"
          style={{
            filter: hovered
              ? "drop-shadow(0 0 25px rgba(232,130,154,0.95)) drop-shadow(0 0 50px rgba(232,130,154,0.5))"
              : "drop-shadow(0 0 15px rgba(232,130,154,0.7)) drop-shadow(0 0 30px rgba(232,130,154,0.2))",
            transition: "filter 0.3s ease",
            animation: "heartBeat 1.8s ease-in-out infinite",
          }}
        >
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f9d4c8" />
              <stop offset="50%" stopColor="#e8829a" />
              <stop offset="100%" stopColor="#c2506e" />
            </linearGradient>
          </defs>
          <path
            d="M27 46s-18-11-18-23a11 11 0 0 1 18-8.5A11 11 0 0 1 45 23c0 12-18 23-18 23z"
            fill="url(#heartGrad)"
          />
          <path
            d="M22 18c-2.5 1-4.5 3.5-5 6"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ---------- Scene 5: Proposal ----------

function ProposalUI({ onYes }: { onYes: () => void }) {
  const yesPulseRef = useRef<HTMLButtonElement>(null);
  const [thinkPos, setThinkPos] = useState({ x: 0, y: 0 });
  const [thinkOpacity, setThinkOpacity] = useState(0.5);
  const [thinkClicks, setThinkClicks] = useState(0);
  const [thinkGone, setThinkGone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const scale = 1 + Math.sin(t * 2) * 0.04;
      if (yesPulseRef.current) {
        yesPulseRef.current.style.transform = `scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dodge = () => {
    if (thinkGone) return;
    const next = thinkClicks + 1;
    setThinkClicks(next);
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 160;
    setThinkPos({ x, y });
    setThinkOpacity(Math.max(0.15, 0.5 - next * 0.2));
    if (next >= 2) {
      setTimeout(() => {
        setThinkOpacity(0);
        setTimeout(() => setThinkGone(true), 400);
      }, 250);
    }
  };

  return (
    <div
      style={{
        pointerEvents: "auto",
        position: "absolute",
        bottom: "8vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        padding: "0 1.5rem",
        width: "100%",
      }}
    >
      <h2
        style={{
          fontFamily: "'Great Vibes', Cormorant Garamond, Georgia, serif",
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          color: "#fff4e0",
          textShadow:
            "0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(232,130,154,0.35)",
          letterSpacing: "0.03em",
          lineHeight: 1.3,
          margin: 0,
          textAlign: "center",
        }}
      >
        {COPY.ring.proposal}
      </h2>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        <button
          ref={yesPulseRef}
          onClick={onYes}
          style={{
            background:
              "linear-gradient(135deg, #f9d4c8 0%, #e8829a 50%, #c2506e 100%)",
            color: "#2a0a14",
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.5rem",
            padding: "1rem 3.5rem",
            borderRadius: "9999px",
            boxShadow:
              "0 0 40px rgba(232,130,154,0.6), 0 0 80px rgba(232,130,154,0.25)",
            border: "1px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 60px rgba(232,130,154,0.9), 0 0 120px rgba(232,130,154,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 40px rgba(232,130,154,0.6), 0 0 80px rgba(232,130,154,0.25)";
          }}
        >
          {COPY.ring.yesLabel}
        </button>

        {!thinkGone && (
          <button
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
              border: "1px solid rgba(168,154,133,0.3)",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              cursor: "default",
              transition:
                "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
              pointerEvents: thinkClicks >= 2 ? "none" : "auto",
            }}
          >
            {COPY.ring.thinkLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Scene 6: Answered — Grand Finale ----------

function AnsweredScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3800),
      setTimeout(() => setStep(4), 5600),
      setTimeout(() => setStep(5), 7200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0",
        padding: "2rem",
        textAlign: "center",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      {/* Floating hearts */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: -1,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${5 + i * 4.7}%`,
              top: "-10%",
              fontSize: `${0.8 + (i % 4) * 0.4}rem`,
              color:
                i % 3 === 0 ? "#e8829a" : i % 3 === 1 ? "#f9d4c8" : "#c2506e",
              animation: `rainHeart ${3 + (i % 5) * 0.8}s ease-in infinite`,
              animationDelay: `${(i * 0.35) % 4}s`,
              opacity: 0.7,
              userSelect: "none",
            }}
          >
            {i % 2 === 0 ? "♡" : "❤"}
          </span>
        ))}
      </div>

      {/* Big beating heart */}
      <div
        style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? "scale(1)" : "scale(0)",
          transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            animation: "heartBeat 1.2s ease-in-out infinite",
            filter: "drop-shadow(0 0 30px rgba(232,130,154,0.9))",
            lineHeight: 1,
          }}
        >
          ♥
        </div>
      </div>

      {/* She said Yes! */}
      <div
        style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s ease-out",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "'Great Vibes', Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(2.4rem, 8vw, 4.5rem)",
            color: "#fff4e0",
            textShadow:
              "0 0 30px rgba(232,130,154,0.8), 0 0 60px rgba(232,130,154,0.4)",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Aapne yes kaha yahooo
        </h2>
      </div>

      {/* Divider */}
      <div
        style={{
          opacity: step >= 2 ? 1 : 0,
          transition: "opacity 1s ease-out",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "260px",
          margin: "0.8rem 0",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(232,130,154,0.6))",
          }}
        />
        <span style={{ color: "#e8829a", fontSize: "0.8rem" }}>♡</span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background:
              "linear-gradient(to left, transparent, rgba(232,130,154,0.6))",
          }}
        />
      </div>

      {/* Final line */}
      <div
        style={{
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? "translateY(0)" : "translateY(20px)",
          transition: "all 1.2s ease-out",
          marginBottom: "1.2rem",
        }}
      >
        <p
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
            color: "#f4e4c1",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {COPY.ring.finalLine}
        </p>
      </div>

      {/* Love message cards */}
      {[
        {
          emoji: "🌹",
          text: "Every day with you is a gift I never want to stop unwrapping.",
        },
        { emoji: "✨", text: "You are my home, my adventure, my forever." },
        {
          emoji: "💍",
          text: "Today, tomorrow, and every day after — it's always you.",
        },
      ].map((msg, i) => (
        <div
          key={i}
          style={{
            opacity: step >= i + 3 ? 1 : 0,
            transform:
              step >= i + 3
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.95)",
            transition: "all 1s ease-out",
            marginBottom: "0.7rem",
            padding: "0.75rem 1.4rem",
            background:
              "linear-gradient(135deg, rgba(232,130,154,0.08) 0%, rgba(194,80,110,0.06) 100%)",
            border: "1px solid rgba(232,130,154,0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(4px)",
            maxWidth: "420px",
            width: "100%",
          }}
        >
          <p
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
              color: "#d4a8b8",
              fontStyle: "italic",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>{msg.emoji}</span>
            {msg.text}
          </p>
        </div>
      ))}

      {/* Bottom sparkle row */}
      <div
        style={{
          opacity: step >= 5 ? 1 : 0,
          transition: "opacity 1.5s ease-out",
          marginTop: "1rem",
          fontSize: "1.2rem",
          letterSpacing: "0.5rem",
          color: "#e8829a",
          filter: "drop-shadow(0 0 8px rgba(232,130,154,0.6))",
          animation: step >= 5 ? "floatPetal 3s ease-in-out infinite" : "none",
        }}
      >
        ♡ ❀ ♡ ❀ ♡
      </div>
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
      style={{
        pointerEvents: "auto",
        position: "fixed",
        right: "1rem",
        top: "1rem",
        zIndex: 20,
        display: "flex",
        height: "40px",
        width: "40px",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "1px solid rgba(232,130,154,0.25)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 0 14px rgba(232,130,154,0.1)",
        cursor: "pointer",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(232,130,154,0.7)";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(232,130,154,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(232,130,154,0.25)";
        e.currentTarget.style.boxShadow = "0 0 14px rgba(232,130,154,0.1)";
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e8829a"
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
