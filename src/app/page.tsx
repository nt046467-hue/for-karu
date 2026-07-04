"use client";

import dynamic from "next/dynamic";
import { useProposal } from "@/components/proposal/state";
import { useEffect } from "react";

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
  // Force reset to gate and set up privacy blockers on mount
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

    // 3. Disable common inspection and saving keys
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
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
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
    </main>
  );
}
