/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemePreset } from "./types";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "yt-red",
    name: "YouTube Crimson",
    accent: "red",
    colorHex: "#EF4444",
    bgGradient: "from-red-500/20 via-red-950/10 to-transparent",
  },
  {
    id: "neon-cyber",
    name: "Neon Cyberpunk",
    accent: "fuchsia",
    colorHex: "#D946EF",
    bgGradient: "from-fuchsia-500/20 via-slate-950/20 to-transparent",
  },
  {
    id: "emerald-sea",
    name: "Forest Emerald",
    accent: "emerald",
    colorHex: "#10B981",
    bgGradient: "from-emerald-500/20 via-emerald-950/10 to-transparent",
  },
  {
    id: "cosmic-blue",
    name: "Cosmic Azure",
    accent: "sky",
    colorHex: "#0EA5E9",
    bgGradient: "from-sky-500/20 via-sky-950/10 to-transparent",
  },
  {
    id: "amber-sunset",
    name: "Amber Sunset",
    accent: "amber",
    colorHex: "#F59E0B",
    bgGradient: "from-amber-500/20 via-amber-950/10 to-transparent",
  }
];

/**
 * Quick helper to format seconds to time string (e.g. 1:42 or 2:05:12)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedSecs = secs < 10 ? `0${secs}` : secs;

  if (hrs > 0) {
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${mins}:${formattedSecs}`;
}

/**
 * Returns dynamic tailwind components based on accent color to avoid purge-safety issues.
 * This function cleanly returns pre-mapped, specific className attributes for each accent color.
 */
export function getThemeClasses(accent: string) {
  switch (accent) {
    case "red":
      return {
        text: "text-red-400",
        bg: "bg-red-500",
        border: "border-red-500/30",
        activeBorder: "border-red-500",
        ring: "ring-red-400",
        bgLight: "bg-red-500/10",
        trackBg: "bg-red-950/40",
        rangeThumb: "accent-red-500",
        badge: "bg-red-500/15 text-red-300 border-red-500/25",
        textMuted: "text-red-200/60",
      };
    case "fuchsia":
      return {
        text: "text-fuchsia-400",
        bg: "bg-fuchsia-500",
        border: "border-fuchsia-500/30",
        activeBorder: "border-fuchsia-500",
        ring: "ring-fuchsia-400",
        bgLight: "bg-fuchsia-500/10",
        trackBg: "bg-fuchsia-950/40",
        rangeThumb: "accent-fuchsia-500",
        badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
        textMuted: "text-fuchsia-200/60",
      };
    case "emerald":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500",
        border: "border-emerald-500/30",
        activeBorder: "border-emerald-500",
        ring: "ring-emerald-400",
        bgLight: "bg-emerald-500/10",
        trackBg: "bg-emerald-950/40",
        rangeThumb: "accent-emerald-500",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        textMuted: "text-emerald-200/60",
      };
    case "sky":
      return {
        text: "text-sky-400",
        bg: "bg-sky-500",
        border: "border-sky-500/30",
        activeBorder: "border-sky-500",
        ring: "ring-sky-400",
        bgLight: "bg-sky-500/10",
        trackBg: "bg-sky-950/40",
        rangeThumb: "accent-sky-500",
        badge: "bg-sky-500/15 text-sky-300 border-sky-500/25",
        textMuted: "text-sky-200/60",
      };
    case "amber":
    default:
      return {
        text: "text-amber-400",
        bg: "bg-amber-500",
        border: "border-amber-500/30",
        activeBorder: "border-amber-500",
        ring: "ring-amber-400",
        bgLight: "bg-amber-500/10",
        trackBg: "bg-amber-950/40",
        rangeThumb: "accent-amber-500",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        textMuted: "text-amber-200/60",
      };
  }
}
