/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Youtube } from "lucide-react";
import { NowPlaying, ThemePreset, WidgetSettings } from "../types";
import { getThemeClasses, formatTime } from "../mockData";

interface FullCardPlayerProps {
  data: NowPlaying;
  theme: ThemePreset;
  settings: WidgetSettings;
}

export default function FullCardPlayer({ data, theme, settings }: FullCardPlayerProps) {
  const t = getThemeClasses(theme.accent);
  const [isLiked, setIsLiked] = React.useState(false);

  const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;

  return (
    <div
      id="widget-player-full"
      className="relative w-[320px] p-5 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-2xl hover:scale-[1.01] duration-300"
    >
      {/* Background radial atmosphere glow */}
      <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${theme.bgGradient} opacity-30 pointer-events-none`} />

      {/* Status row */}
      <div className="relative z-10 flex justify-between items-center text-[10px] tracking-wider uppercase font-mono text-slate-400 mb-4 px-1 select-none">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${data.isPlaying ? `${t.bg} animate-ping` : "bg-slate-600"}`} />
          {data.isPlaying ? "NOW PLAYING" : "PAUSED"}
        </span>
        <div className="flex items-center space-x-1.5 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
          <Youtube className="w-3 h-3 text-red-500" />
          <span className="text-[9px]">YT WIDGET</span>
        </div>
      </div>

      {/* Artwork */}
      <div className="relative aspect-square w-full mb-4 rounded-2xl overflow-hidden shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)]">
        <img
          id="full-thumb"
          src={data.thumbnail}
          alt={data.title}
          className={`w-full h-full object-cover transition-all duration-700 ${data.isPlaying ? "scale-105" : "scale-100 filter brightness-90"}`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Track info */}
      <div className="relative z-10 mb-4 px-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              id="full-title"
              className="text-sm font-bold text-slate-100 tracking-tight leading-snug break-words hover:text-white transition-colors line-clamp-2"
              title={data.title}
            >
              {data.title}
            </h3>
            <p id="full-channel" className="text-xs text-slate-450 truncate mt-1 hover:text-slate-200 transition-colors">
              {data.channel}
            </p>
          </div>
          <button
            id="full-like-btn"
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 rounded-full transition-all ${isLiked ? "text-red-500 scale-110" : "text-slate-500 hover:text-slate-350 hover:bg-slate-800/40"}`}
            aria-label="Like track"
          >
            <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Progress and time labels */}
      {(settings.showProgress || settings.showTimeLabels) && (
        <div className="relative z-10 w-full px-0.5 space-y-1.5">
          {settings.showProgress && (
            <div
              id="full-progress-bar"
              className="w-full h-1 bg-slate-800 rounded-lg overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${t.bg}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          {settings.showTimeLabels && (
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-0.5 select-none">
              <span id="full-current-time">{formatTime(data.currentTime)}</span>
              <span id="full-total-time">{formatTime(data.duration)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
