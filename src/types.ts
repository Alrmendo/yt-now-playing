/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NowPlaying {
  title: string;
  channel: string;
  thumbnail: string; // URL
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number; // seconds
  videoId: string;
}

export type LayoutPreset = "compact" | "full" | "slim";

export interface ThemePreset {
  id: string;
  name: string;
  accent: string;       // prefix for tailwind classes (e.g. "red" for red-500, etc.)
  colorHex: string;     // color hex value for preview dots
  bgGradient: string;   // gradient background for active state decoration
}

export interface WidgetSettings {
  layout: LayoutPreset;
  themeId: string;
  showProgress: boolean;
  showTimeLabels: boolean;
  alwaysOnTopSimulated: boolean; // widget status display decoration
  useMockInteractivity: boolean; // allow users to play/pause and scrub within the widget
}
