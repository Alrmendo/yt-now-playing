/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Disc, Youtube, Settings } from "lucide-react";
import { NowPlaying, ThemePreset, WidgetSettings } from "../types";
import { getThemeClasses } from "../mockData";

interface CompactPlayerProps {
  data: NowPlaying;
  theme: ThemePreset;
  settings: WidgetSettings;
  onOpenSettings?: () => void;
}

export default function CompactPlayer({ data, theme, settings, onOpenSettings }: CompactPlayerProps) {
  const t = getThemeClasses(theme.accent);
  const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;

  return (
    <div
      id="widget-player-compact"
      className="drag relative w-[280px] bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden font-sans transition-all hover:shadow-2xl hover:border-slate-700/80"
    >
      {/* Decorative ambient glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-15 ${t.bg}`} />

      {/* Gear button — top-right corner */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="no-drag absolute top-2 right-2 z-10 p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/60 transition-all"
          title="Settings"
        >
          <Settings className="w-3 h-3" />
        </button>
      )}

      <div className="p-3.5 flex items-center space-x-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <img
            id="compact-thumb"
            src={data.thumbnail}
            alt={data.title}
            className="w-12 h-12 object-cover rounded-lg border border-slate-800 shadow-sm"
            referrerPolicy="no-referrer"
          />
          {data.isPlaying && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center p-0.5 animate-spin shadow-md ${t.bg}`}>
              <Disc className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center space-x-1 mb-0.5">
            <Youtube className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">YouTube</span>
          </div>
          <h3
            id="compact-title"
            className="text-xs font-bold text-slate-100 truncate tracking-tight leading-snug"
            title={data.title}
          >
            {data.title}
          </h3>
          <p id="compact-channel" className="text-[11px] text-slate-400 truncate mt-0.5">
            {data.channel}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {settings.showProgress && (
        <div className="relative w-full h-1 bg-slate-950/40">
          <div
            id="compact-progress-indicator"
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${t.bg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
