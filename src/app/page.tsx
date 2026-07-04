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
  // Force reset to gate on every page load — prevents HMR stale state
  const reset = useProposal((s) => s.reset);
  useEffect(() => {
    reset();
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
