/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Layout, Palette, Eye, Check } from "lucide-react";
import { LayoutPreset, WidgetSettings } from "../types";
import { THEME_PRESETS, getThemeClasses } from "../mockData";

interface SettingsViewProps {
  settings: WidgetSettings;
  onUpdateSettings: (fields: Partial<WidgetSettings>) => void;
  onClose: () => void;
}

export default function SettingsView({ settings, onUpdateSettings, onClose }: SettingsViewProps) {
  const currentTheme = THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];
  const t = getThemeClasses(currentTheme.accent);

  const layouts: { id: LayoutPreset; label: string; desc: string; icon: string }[] = [
    { id: "compact", label: "Compact",   desc: "Minimal — thumbnail + title",      icon: "▢" },
    { id: "full",    label: "Full Card", desc: "Artwork + progress + time labels",  icon: "⏹" },
    { id: "slim",    label: "Slim Bar",  desc: "Single-line horizontal strip",      icon: "▭" },
  ];

  return (
    <div className="drag w-[320px] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">

      {/* Header — draggable, with close button */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-800/60">
        <span className="text-xs font-bold text-white tracking-wide">Widget Settings</span>
        <button
          onClick={onClose}
          className="no-drag flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
          title="Close settings"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="no-drag px-5 py-4 space-y-5 overflow-y-auto max-h-[460px]">

        {/* Layout preset */}
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layout className="w-3 h-3" />
            Layout
          </h3>
          <div className="space-y-1.5">
            {layouts.map((lay) => {
              const isActive = settings.layout === lay.id;
              return (
                <button
                  key={lay.id}
                  onClick={() => onUpdateSettings({ layout: lay.id })}
                  className={`w-full flex items-center text-left px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? `${t.border} ${t.bgLight}`
                      : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <span className="text-lg font-mono text-slate-500 mr-3 w-5 flex-shrink-0">{lay.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                        {lay.label}
                      </span>
                      {isActive && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.bg}`} />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{lay.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Palette className="w-3 h-3" />
            Accent Color
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {THEME_PRESETS.map((them) => {
              const isSelected = settings.themeId === them.id;
              return (
                <button
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
                    className="w-5 h-5 rounded-full border border-white/10"
                    style={{ backgroundColor: them.colorHex }}
                  />
                  <span className="text-[8px] text-slate-400 mt-1 truncate max-w-full px-0.5">
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

        {/* Display toggles */}
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            Display
          </h3>
          <div className="space-y-1 bg-slate-800/30 rounded-xl border border-slate-800/80 divide-y divide-slate-800/60">
            {[
              { key: "showProgress"   as const, label: "Progress bar", desc: "Show playback progress" },
              { key: "showTimeLabels" as const, label: "Time labels",  desc: "Show current / total time" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-500">{desc}</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ [key]: !settings[key] })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0 ${settings[key] ? t.bg : "bg-slate-700"}`}
                  aria-pressed={settings[key]}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-800/60">
        <p className="text-[9px] font-mono text-slate-600 text-center">YT Now Playing v0.4.0</p>
      </div>
    </div>
  );
}
