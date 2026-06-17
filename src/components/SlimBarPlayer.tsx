/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Play, Pause, Youtube, Disc } from "lucide-react";
import { NowPlaying, ThemePreset, WidgetSettings } from "../types";
import { getThemeClasses, formatTime } from "../mockData";

interface SlimBarPlayerProps {
  data: NowPlaying;
  theme: ThemePreset;
  settings: WidgetSettings;
  onTogglePlay?: () => void;
  onSeek?: (value: number) => void;
}

export default function SlimBarPlayer({
  data,
  theme,
  settings,
  onTogglePlay,
  onSeek,
}: SlimBarPlayerProps) {
  const t = getThemeClasses(theme.accent);

  // Calculate percentage
  const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;

  return (
    <div
      id="widget-player-slim"
      className="relative w-full max-w-[420px] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg overflow-hidden font-sans group transition-all duration-300 hover:border-slate-700 hover:shadow-2xl"
    >
      <div className="flex items-center justify-between p-2.5 pl-3 pr-3.5 space-x-3.5">
        
        {/* Left Section: Thumbnail and Meta Info inline */}
        <div className="flex items-center min-w-0 flex-1 space-x-3">
          {/* Thumb */}
          <div className="relative flex-shrink-0">
            <img
              id="slim-thumb"
              src={data.thumbnail}
              alt={data.title}
              className={`w-9 h-9 object-cover rounded-lg border border-slate-800 transition-transform ${data.isPlaying ? "animate-pulse" : ""}`}
              referrerPolicy="no-referrer"
            />
            {data.isPlaying && (
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-900 animate-ping" />
            )}
          </div>

          {/* Title and Channel INLINE */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <Youtube className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-[8px] font-mono tracking-widest text-slate-450 uppercase">Streaming Now</span>
            </div>

            <div className="flex items-baseline space-x-2 truncate">
              <h3 
                id="slim-title"
                className="text-xs font-bold text-slate-100 truncate hover:text-white transition-colors"
                title={data.title}
              >
                {data.title}
              </h3>
              <span className="text-slate-600 text-xs flex-shrink-0 select-none">•</span>
              <p 
                id="slim-channel"
                className="text-[11px] text-slate-400 truncate flex-shrink-0"
              >
                {data.channel}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive play/pause and tiny timestamp indicator */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {settings.showTimeLabels && (
            <span id="slim-time-display" className="text-[10px] font-mono text-slate-500 whitespace-nowrap hidden sm:inline select-none">
              {formatTime(data.currentTime)}
            </span>
          )}

          {settings.useMockInteractivity && (
            <button
              id="slim-play-btn"
              onClick={onTogglePlay}
              className={`p-1.5 rounded-full transition-all border ${t.bgLight} ${t.border} ${t.text} hover:bg-opacity-20 active:scale-95`}
              aria-label={data.isPlaying ? "Pause" : "Play"}
            >
              {data.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Line running cleanly at the absolute dynamic BOTTOM edge */}
      {settings.showProgress && (
        <div 
          className="relative w-full h-[3px] bg-slate-950/40 cursor-pointer overflow-hidden group-hover:h-[4px] transition-all" 
          onClick={(e) => {
            if (!onSeek) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            onSeek(ratio * data.duration);
          }}
        >
          <div
            id="slim-progress-bar"
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${t.bg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
