/**
 * Generate 5 procedural placeholder photo textures for the memory stream.
 * Each is a soft gradient with a subtle texture overlay so the planes look
 * intentional, not broken — until the user drops in their real photos.
 *
 * Output: /public/photos/photo-{1..5}.webp
 *
 * The user can replace these files with their own photos at any time
 * (just keep the same filenames).
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const OUT_DIR = "/home/z/my-project/public/photos";

// 5 warm gradient palettes — each evokes a memory mood
const PALETTES: { name: string; stops: [string, string, string] }[] = [
  { name: "first-trip",   stops: ["#3a2a4a", "#6b4a6a", "#d4a89a"] }, // dusk
  { name: "rainy-day",    stops: ["#2a3a4a", "#4a6a8a", "#9ab8d4"] }, // rainy blue
  { name: "laugh",        stops: ["#4a3a2a", "#8a6a4a", "#e4c49a"] }, // warm amber
  { name: "slow-morning", stops: ["#2a3a3a", "#5a7a6a", "#c4d4b4"] }, // morning sage
  { name: "ordinary",     stops: ["#3a2a3a", "#6a4a5a", "#d4a4b4"] }, // rose dusk
];

async function generateOne(index: number, palette: typeof PALETTES[number]) {
  const W = 900;
  const H = 630;

  // Build an SVG with a linear gradient + subtle noise (feTurbulence)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.stops[0]}" />
          <stop offset="50%" stop-color="${palette.stops[1]}" />
          <stop offset="100%" stop-color="${palette.stops[2]}" />
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${index * 7}" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
        <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
          <stop offset="60%" stop-color="rgba(0,0,0,0)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.6)" />
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)" />
      <rect width="${W}" height="${H}" filter="url(#noise)" opacity="0.6" />
      <rect width="${W}" height="${H}" fill="url(#vignette)" />
    </svg>
  `;

  const outPath = path.join(OUT_DIR, `photo-${index}.webp`);
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(outPath);
  console.log(`  ✓ ${outPath}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Generating placeholder photos...");
  for (let i = 0; i < PALETTES.length; i++) {
    await generateOne(i + 1, PALETTES[i]);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
