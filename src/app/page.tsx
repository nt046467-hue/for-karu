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
  const reset = useProposal((s) => s.reset);

  useEffect(() => {
    reset();

    // Prevent right-click / long-press context menu (keeps experience immersive)
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Prevent image/canvas drag-off
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    // Block common devtools shortcuts — keeps experience clean on a shared phone
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ["I","J","C","i","j","c"].includes(e.key)) {
        e.preventDefault(); return;
      }
      if (e.ctrlKey && ["U","u","S","s"].includes(e.key)) {
        e.preventDefault(); return;
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
