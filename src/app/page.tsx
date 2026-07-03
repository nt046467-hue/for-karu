"use client";

import dynamic from "next/dynamic";

// Dynamically import the Experience so it only renders on the client
// (R3F + WebGL can't run during SSR). Loading fallback renders a black
// screen so there's never a white flash during initial hydration.
const Experience = dynamic(
  () => import("@/components/proposal/Experience").then((m) => m.Experience),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000000",
        }}
      />
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
