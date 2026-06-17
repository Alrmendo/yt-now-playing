/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Play, Pause, SkipForward, SkipBack, Heart, Music, Youtube, HelpCircle } from "lucide-react";
import { NowPlaying, ThemePreset, WidgetSettings } from "../types";
import { getThemeClasses, formatTime } from "../mockData";

interface FullCardPlayerProps {
  data: NowPlaying;
  theme: ThemePreset;
  settings: WidgetSettings;
  onTogglePlay?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSeek?: (value: number) => void;
}

export default function FullCardPlayer({
  data,
  theme,
  settings,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
}: FullCardPlayerProps) {
  const t = getThemeClasses(theme.accent);
  const [isLiked, setIsLiked] = React.useState(false);

  // Time calculations
  const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSeek) {
      onSeek(parseFloat(e.target.value));
    }
  };

  return (
    <div
      id="widget-player-full"
      className="relative w-[320px] p-5 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-2xl hover:scale-[1.01] duration-300"
    >
      {/* Background radial atmosphere glow based on selected song's accent */}
      <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${theme.bgGradient} opacity-30 pointer-events-none`} />

      {/* Top Header Row representing actual widget controls */}
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

      {/* Prominent High-res Artwork with premium shadow */}
      <div className="relative aspect-square w-full mb-4 rounded-2xl overflow-hidden group shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)]">
        <img
          id="full-thumb"
          src={data.thumbnail}
          alt={data.title}
          className={`w-full h-full object-cover transition-all duration-700 ${data.isPlaying ? "scale-105" : "scale-100 filter brightness-90"}`}
          referrerPolicy="no-referrer"
        />
        
        {/* Playback Overlay Hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-[10px] text-slate-300 font-mono flex items-center">
            <Music className="w-3 h-3 mr-1 animate-bounce" /> Click player to control
          </p>
        </div>
      </div>

      {/* Main Info Display */}
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
            <p 
              id="full-channel"
              className="text-xs text-slate-450 truncate mt-1 hover:text-slate-200 transition-colors"
            >
              {data.channel}
            </p>
          </div>
          
          {/* Decorative Favorite button */}
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

      {/* Interactive Range Scrubber with precise labels */}
      {(settings.showProgress || settings.showTimeLabels) && (
        <div className="relative z-10 w-full mb-4 px-0.5 space-y-1.5">
          {settings.showProgress && (
            <div className="relative flex items-center group/scrubber">
              <input
                id="full-scrub-input"
                type="range"
                min="0"
                max={data.duration || 100}
                value={data.currentTime}
                onChange={handleScrubChange}
                className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none ${t.rangeThumb} transition-all duration-150 relative z-20`}
                style={{
                  background: `linear-gradient(to right, ${theme.colorHex} 0%, ${theme.colorHex} ${progressPercent}%, #1E293B ${progressPercent}%, #1E293B 100%)`
                }}
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

      {/* Classic Media Controls Panel */}
      <div className="relative z-10 flex justify-center items-center space-x-5 mb-1 select-none">
        <button
          id="full-prev-btn"
          onClick={onPrev}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-850/60 rounded-full transition-all active:scale-90"
          aria-label="Previous track"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        <button
          id="full-play-btn"
          onClick={onTogglePlay}
          className={`p-3.5 rounded-full text-white shadow-lg transition-all active:scale-95 duration-200 ${t.bg} hover:brightness-110 hover:shadow-2xl`}
          aria-label={data.isPlaying ? "Pause" : "Play"}
        >
          {data.isPlaying ? (
            <Pause className="w-5 h-5 text-white stroke-[2.5px]" />
          ) : (
            <Play className="w-5 h-5 text-white fill-current translate-x-0.5 stroke-[2.5px]" />
          )}
        </button>

        <button
          id="full-next-btn"
          onClick={onNext}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-850/60 rounded-full transition-all active:scale-90"
          aria-label="Next track"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
