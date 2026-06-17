/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Settings, Monitor } from "lucide-react";

import { WidgetSettings } from "./types";
import { THEME_PRESETS, getThemeClasses } from "./mockData";
import { useNowPlaying } from "./hooks/useNowPlaying";

import CompactPlayer from "./components/CompactPlayer";
import FullCardPlayer from "./components/FullCardPlayer";
import SlimBarPlayer from "./components/SlimBarPlayer";
import IdleState from "./components/IdleState";
import SettingsPanel from "./components/SettingsPanel";

const LOCAL_STORAGE_KEY_SETTINGS = "yt_now_playing_settings";

const DEFAULT_SETTINGS: WidgetSettings = {
  layout: "full",
  themeId: "yt-red",
  showProgress: true,
  showTimeLabels: true,
};

export default function App() {
  const { currentSong, connectionStatus } = useNowPlaying();

  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const updateSettingsHandler = (newFields: Partial<WidgetSettings>) => {
    setSettings((prev) => ({ ...prev, ...newFields }));
  };

  const activeTheme = THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];
  const t = getThemeClasses(activeTheme.accent);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-purple-500/30 selection:text-white"
      id="app-root-container"
    >
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl text-white shadow-md ${t.bg}`}>
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">YT Now Playing</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">Desktop Widget</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Connection status indicator */}
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              <span
                className={`text-[11px] font-mono hidden sm:inline ${
                  connectionStatus === "connected" ? "text-green-400" : "text-amber-400"
                }`}
              >
                {connectionStatus === "connected" ? "Connected" : "Reconnecting..."}
              </span>
            </div>

            {/* Settings gear */}
            <button
              id="btn-open-settings"
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl border transition-all hover:text-white ${
                isSettingsOpen
                  ? `${t.border} ${t.bgLight} ${t.text}`
                  : "bg-slate-900/65 border-slate-800 text-slate-450 hover:bg-slate-800"
              }`}
              title="Open Widget Configurations"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        {currentSong ? (
          <>
            {settings.layout === "compact" && (
              <CompactPlayer data={currentSong} theme={activeTheme} settings={settings} />
            )}
            {settings.layout === "full" && (
              <FullCardPlayer data={currentSong} theme={activeTheme} settings={settings} />
            )}
            {settings.layout === "slim" && (
              <SlimBarPlayer data={currentSong} theme={activeTheme} settings={settings} />
            )}
          </>
        ) : (
          <IdleState layout={settings.layout} theme={activeTheme} />
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onUpdateSettings={updateSettingsHandler}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900/70 py-6 text-center select-none text-[11px] font-mono text-slate-500 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>YT Now Playing © 2026</p>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setIsSettingsOpen(true); }}
            className="hover:text-slate-300"
          >
            Preferences
          </a>
        </div>
      </footer>
    </div>
  );
}
