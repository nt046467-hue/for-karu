"use client";

import dynamic from "next/dynamic";
import { useProposal } from "@/components/proposal/state";
import { useEffect, useState } from "react";

// Dynamically import so WebGL only loads on client
const Experience = dynamic(
  () => import("@/components/proposal/Experience").then((m) => m.Experience),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: "fixed", inset: 0, background: "#000000" }} />
    ),
  }
);

const Overlay = dynamic(
  () => import("@/components/proposal/Overlay").then((m) => m.Overlay),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function Home() {
  const [isScreenBlocked, setIsScreenBlocked] = useState(false);
  const reset = useProposal((s) => s.reset);

  useEffect(() => {
    reset();

    // 1. Prevent right-click/long-press context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent image/canvas dragging
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 3. Disable common inspection and saving keys + detect screenshot attempts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return;
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return;
      }
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        setIsScreenBlocked(true);
        clearClipboard();
        setTimeout(() => setIsScreenBlocked(false), 2500);
      }
      // Windows Key / Command Key (Meta) -> held down during screenshots
      if (e.key === "Meta" || e.key === "OS" || e.keyCode === 91 || e.keyCode === 92) {
        setIsScreenBlocked(true);
        clearClipboard();
        setTimeout(() => setIsScreenBlocked(false), 2000);
      }
    };

    // 4. Overwrite clipboard to destroy printscreen image cache
    const clearClipboard = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("🔒 Private Memory — For Karu & Nabin Only ♡").catch(() => {});
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44 || e.key === "Meta" || e.key === "OS") {
        setIsScreenBlocked(true);
        clearClipboard();
        setTimeout(() => setIsScreenBlocked(false), 2000);
      }
    };

    // 5. Blur / tab-change events -> instantly hide the screen and clear clipboard
    const handleBlur = () => {
      setIsScreenBlocked(true);
      clearClipboard();
    };

    const handleFocus = () => {
      // Small delay on refocus to make sure screenshot tool is closed
      setTimeout(() => {
        setIsScreenBlocked(false);
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlocked(true);
        clearClipboard();
      }
    };

    // 6. Block copy clipboard commands
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "🔒 Private Memory — For Karu & Nabin Only ♡");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
        overflow: "hidden",
      }}
    >
      <Experience />
      <Overlay />

      {/* Romantic Privacy Overlay */}
      {isScreenBlocked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(10, 8, 15, 0.96)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            color: "#fff4e0",
            textAlign: "center",
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "3.5rem", animation: "heartBeat 1.5s ease-in-out infinite" }}>
            🔒
          </div>
          <h2
            style={{
              fontFamily: "'Great Vibes', 'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 3.2rem)",
              color: "#fff4e0",
              margin: 0,
              textShadow: "0 0 20px rgba(232,130,154,0.6)",
            }}
          >
            Privacy Active, My Love
          </h2>
          <p
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "#d4a8b8",
              fontStyle: "italic",
              margin: 0,
              maxWidth: "400px",
              lineHeight: 1.5,
            }}
          >
            To keep our memories just between us, screenshots and recording are locked. 😉
          </p>
        </div>
      )}
    </main>
  );
}
