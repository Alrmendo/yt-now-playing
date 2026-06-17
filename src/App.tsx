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

  // Manual window dragging — driven by the main process so it tracks the
  // cursor 1:1 on scaled displays (native -webkit-app-region drag desyncs there).
  useEffect(() => {
    if (!window.electronAPI?.startDrag) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest(".no-drag")) return;
      if (!target.closest(".drag")) return;
      window.electronAPI?.startDrag();
    };
    const handleMouseUp = () => window.electronAPI?.stopDrag();

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
    };
  }, []);

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
