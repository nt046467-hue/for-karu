"use client";

/**
 * Mobile / capability detection for perf-safe rendering.
 * Called once on the client (after mount) — values are stable for the session.
 */
export function detectCapabilities() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isLowPerf: false,
      dprCap: 1.5 as [number, number],
      sparkleCount: 40,
      useTransmission: true,
      maxAnisotropy: 4,
    };
  }

  const ua = navigator.userAgent || "";
  const isMobile =
    /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    window.innerWidth < 768;

  // Coarse heuristic: low core count or small screen → low perf
  const cores = (navigator as any).hardwareConcurrency ?? 4;
  const isLowPerf = isMobile || cores <= 4;

  // Transmission is the most expensive material feature on mobile GPUs.
  // Disable on mobile to keep framerate stable during the ring reveal.
  const useTransmission = !isMobile;

  const dprCap: [number, number] = isMobile ? [1, 1.5] : [1, 2];
  const sparkleCount = isMobile ? 18 : 40;
  const maxAnisotropy = isMobile ? 4 : 8;

  return { isMobile, isLowPerf, dprCap, sparkleCount, useTransmission, maxAnisotropy };
}
