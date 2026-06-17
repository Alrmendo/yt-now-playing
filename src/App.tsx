/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";

import { WidgetSettings } from "./types";
import { THEME_PRESETS } from "./mockData";
import { useNowPlaying } from "./hooks/useNowPlaying";

import CompactPlayer  from "./components/CompactPlayer";
import FullCardPlayer from "./components/FullCardPlayer";
import SlimBarPlayer  from "./components/SlimBarPlayer";
import IdleState      from "./components/IdleState";
import SettingsView   from "./components/SettingsView";

const LOCAL_STORAGE_KEY_SETTINGS = "yt_now_playing_settings";

const DEFAULT_SETTINGS: WidgetSettings = {
  layout: "full",
  themeId: "yt-red",
  showProgress: true,
  showTimeLabels: true,
};

const isSettingsPage =
  new URLSearchParams(window.location.search).get("page") === "settings";

export default function App() {
  const { currentSong } = useNowPlaying();

  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Sync from the other window via storage events
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_SETTINGS && e.newValue) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch (_) {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const activeTheme = THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];

  // Dynamic taskbar icon — only meaningful in the player window
  useEffect(() => {
    if (!window.electronAPI?.setTaskbarIcon || isSettingsPage) return;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = activeTheme.colorHex;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, 32, 32, 7);
    else ctx.rect(0, 0, 32, 32);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(10, 24);
    ctx.lineTo(25, 16);
    ctx.closePath();
    ctx.fill();

    window.electronAPI.setTaskbarIcon(canvas.toDataURL("image/png"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.themeId]);

  const updateSettings = (fields: Partial<WidgetSettings>) =>
    setSettings((prev) => ({ ...prev, ...fields }));

  // ── Settings window ────────────────────────────────────────────────────────
  if (isSettingsPage) {
    return (
      <div className="h-screen flex items-center justify-center overflow-hidden">
        <SettingsView
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => window.electronAPI?.closeWindow()}
        />
      </div>
    );
  }

  // ── Player window ──────────────────────────────────────────────────────────
  const openSettings = () => window.electronAPI?.openSettingsWindow();

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      {currentSong ? (
        <>
          {settings.layout === "compact" && (
            <CompactPlayer
              data={currentSong}
              theme={activeTheme}
              settings={settings}
              onOpenSettings={openSettings}
            />
          )}
          {settings.layout === "full" && (
            <FullCardPlayer
              data={currentSong}
              theme={activeTheme}
              settings={settings}
              onOpenSettings={openSettings}
            />
          )}
          {settings.layout === "slim" && (
            <SlimBarPlayer
              data={currentSong}
              theme={activeTheme}
              settings={settings}
              onOpenSettings={openSettings}
            />
          )}
        </>
      ) : (
        <IdleState
          layout={settings.layout}
          theme={activeTheme}
          onOpenSettings={openSettings}
        />
      )}
    </div>
  );
}
