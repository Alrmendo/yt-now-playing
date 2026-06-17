/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { 
  X, 
  Layout, 
  Palette, 
  Eye, 
  EyeOff, 
  Tv, 
  Sliders, 
  Check, 
  Layers, 
  Zap,
  MousePointerClick
} from "lucide-react";
import { LayoutPreset, ThemePreset, WidgetSettings } from "../types";
import { THEME_PRESETS, getThemeClasses } from "../mockData";

interface SettingsPanelProps {
  settings: WidgetSettings;
  onUpdateSettings: (settings: Partial<WidgetSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const currentTheme = THEME_PRESETS.find(t => t.id === settings.themeId) || THEME_PRESETS[0];
  const t = getThemeClasses(currentTheme.accent);

  const layouts: { id: LayoutPreset; label: string; desc: string; icon: string }[] = [
    {
      id: "compact",
      label: "Compact Mini-Player",
      desc: "Minimal footer footprint, perfect for small screens",
      icon: "▢",
    },
    {
      id: "full",
      label: "Full Display Card",
      desc: "Detailed information & tactile media controller",
      icon: "⏹",
    },
    {
      id: "slim",
      label: "Slim Horizontal Strip",
      desc: "Inline bar ideal for notification trays",
      icon: "▭",
    }
  ];

  return (
    <div 
      id="settings-overlay-backdrop"
      className="fixed inset-0 bg-slate-950/75 z-50 flex justify-end animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="settings-container-panel"
        className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative select-none animate-slide-in text-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Body */}
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className={`w-4 h-4 ${t.text}`} />
              <h2 className="text-base font-bold text-white tracking-tight">Widget Preferences</h2>
            </div>
            <button
              id="settings-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Layout className="w-3.5 h-3.5" />
              <span>Layout Preset</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {layouts.map((lay) => {
                const isActive = settings.layout === lay.id;
                return (
                  <button
                    id={`layout-preset-${lay.id}`}
                    key={lay.id}
                    onClick={() => onUpdateSettings({ layout: lay.id })}
                    className={`flex items-start text-left p-3 rounded-xl border transition-all duration-200 ${
                      isActive 
                        ? `${t.border} ${t.bgLight} bg-opacity-40` 
                        : "border-slate-800 bg-slate-850/40 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <span className="text-xl mr-3 text-slate-500 font-mono mt-0.5">{lay.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                          {lay.label}
                        </span>
                        {isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${t.bg}`} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lay.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Theme selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Accent Color Theme</span>
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {THEME_PRESETS.map((them) => {
                const isSelected = settings.themeId === them.id;
                return (
                  <button
                    id={`theme-btn-${them.id}`}
                    key={them.id}
                    onClick={() => onUpdateSettings({ themeId: them.id })}
                    className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? "border-white bg-slate-800 scale-105 shadow-md" 
                        : "border-slate-800 bg-slate-850 hover:border-slate-700"
                    }`}
                    title={them.name}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shadow-inner border border-white/10" 
                      style={{ backgroundColor: them.colorHex }}
                    />
                    <span className="text-[8px] text-slate-400 mt-1.5 truncate max-w-full px-1">
                      {them.name.split(" ")[1] || them.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-white text-slate-900 rounded-full p-0.5 scale-75">
                        <Check className="w-2.5 h-2.5 stroke-[3px]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Display Toggles</span>
            </h3>

            <div className="space-y-2 bg-slate-850/30 p-3 rounded-xl border border-slate-800/80">
              {/* Show Progress */}
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <label htmlFor="settings-progress-toggle" className="text-xs font-semibold text-slate-200">Show Progress Indicator</label>
                  <p className="text-[10px] text-slate-400">Render dynamic progress track line</p>
                </div>
                <button
                  id="settings-progress-toggle"
                  onClick={() => onUpdateSettings({ showProgress: !settings.showProgress })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                    settings.showProgress ? t.bg : "bg-slate-700"
                  }`}
                  aria-pressed={settings.showProgress}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    settings.showProgress ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Show Time Labels */}
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/60">
                <div>
                  <label htmlFor="settings-timelabels-toggle" className="text-xs font-semibold text-slate-200">Show Time Labels</label>
                  <p className="text-[10px] text-slate-400">Display current/total duration</p>
                </div>
                <button
                  id="settings-timelabels-toggle"
                  onClick={() => onUpdateSettings({ showTimeLabels: !settings.showTimeLabels })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                    settings.showTimeLabels ? t.bg : "bg-slate-700"
                  }`}
                  aria-pressed={settings.showTimeLabels}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    settings.showTimeLabels ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Interactivity Toggle */}
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/60">
                <div>
                  <label htmlFor="settings-interactivity-toggle" className="text-xs font-semibold text-slate-200">Enforce Interactivity</label>
                  <p className="text-[10px] text-slate-400">Allows clicking play/pause inside widget</p>
                </div>
                <button
                  id="settings-interactivity-toggle"
                  onClick={() => onUpdateSettings({ useMockInteractivity: !settings.useMockInteractivity })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                    settings.useMockInteractivity ? t.bg : "bg-slate-700"
                  }`}
                  aria-pressed={settings.useMockInteractivity}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    settings.useMockInteractivity ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Quick Hints Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-auto">
          <div className="flex items-start space-x-2 text-[10px] text-slate-400 select-none">
            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p>Presets and styling persist automatic reloads via integrated local storage client-state.</p>
          </div>
          <div className="text-[9px] font-mono text-center text-slate-500">
            YT Now Playing v1.1.2 • Active Sandbox
          </div>
        </div>
      </div>
    </div>
  );
}
