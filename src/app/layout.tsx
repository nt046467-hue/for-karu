import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// NOTE: We intentionally do NOT use next/font/google here.
// next/font fetches fonts at BUILD time — in sandboxed AI-builder
// preview environments (restricted network egress), that fetch gets
// blocked and can fail the whole build, leaving the page unstyled.
// Loading via a <link> tag instead fetches fonts at RUNTIME in the
// browser, so the build never depends on network access.

export const metadata: Metadata = {
  title: "For Karu — With All My Love",
  description: "A little something I made just for you, my love.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // prevent accidental zoom during the experience
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Great+Vibes&family=Dancing+Script:wght@400;600;700&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-black text-foreground"
        style={{ background: "#000000", overflow: "hidden" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
