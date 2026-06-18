/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Youtube, Settings, Volume2, VolumeX } from "lucide-react";
import { NowPlaying, ThemePreset, WidgetSettings } from "../types";
import { getThemeClasses, formatTime } from "../mockData";

interface FullCardPlayerProps {
  data: NowPlaying;
  theme: ThemePreset;
  settings: WidgetSettings;
  onOpenSettings?: () => void;
}

export default function FullCardPlayer({ data, theme, settings, onOpenSettings }: FullCardPlayerProps) {
  const t = getThemeClasses(theme.accent);
  const [isLiked, setIsLiked] = React.useState(false);
  const [volume, setVolume] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const lastVolumeRef = React.useRef(100);

  const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;
  const isMuted = volume === 0;

  const postToPlayer = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  };

  // Recomputed only when the video changes, so ticking currentTime doesn't reload the embed.
  const embedSrc = React.useMemo(
    () =>
      `https://www.youtube.com/embed/${data.videoId}?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&start=${Math.floor(data.currentTime)}`,
    [data.videoId]
  );

  // Reset to muted whenever the embed (re)loads — matches the mute=1 it was built with.
  React.useEffect(() => setVolume(0), [embedSrc]);

  // Mirror play/pause state into the embed via postMessage instead of reloading it.
  React.useEffect(() => {
    postToPlayer(data.isPlaying ? "playVideo" : "pauseVideo");
  }, [data.isPlaying]);

  const handleVolumeChange = (next: number) => {
    setVolume(next);
    if (next > 0) lastVolumeRef.current = next;
    postToPlayer(next === 0 ? "mute" : "unMute");
    postToPlayer("setVolume", [next]);
  };

  const toggleMute = () => handleVolumeChange(isMuted ? lastVolumeRef.current : 0);

  return (
    <div
      id="widget-player-full"
      className="drag relative w-[320px] p-5 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col justify-between transition-all hover:border-slate-700 duration-300"
    >
      {/* Background radial atmosphere glow */}
      <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${theme.bgGradient} opacity-30 pointer-events-none`} />

      {/* Status row — gear lives here */}
      <div className="relative z-10 flex justify-between items-center text-[10px] tracking-wider uppercase font-mono text-slate-400 mb-4 px-1 select-none">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${data.isPlaying ? `${t.bg} animate-ping` : "bg-slate-600"}`} />
          {data.isPlaying ? "NOW PLAYING" : "PAUSED"}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center space-x-1.5 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
            <Youtube className="w-3 h-3 text-red-500" />
            <span className="text-[9px]">YT WIDGET</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="no-drag p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Artwork — muted, controls-less video embed instead of a static thumbnail */}
      <div className="relative aspect-square w-full mb-4 rounded-2xl overflow-hidden shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)]">
        <iframe
          id="full-video"
          ref={iframeRef}
          src={embedSrc}
          title={data.title}
          className="w-full h-full pointer-events-none"
          style={{ border: 0 }}
          allow="autoplay; encrypted-media"
        />
        <div className="no-drag group absolute bottom-2 right-2">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 h-0 opacity-0 pointer-events-none group-hover:h-20 group-hover:opacity-100 group-hover:pointer-events-auto overflow-hidden transition-all duration-200 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full w-7 py-2">
            <input
              id="full-volume-slider"
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              style={{ WebkitAppearance: "slider-vertical", width: 4, height: 64 }}
              className="accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <button
            id="full-mute-btn"
            onClick={toggleMute}
            className="relative p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-slate-200 hover:text-white transition-all"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
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
            <p id="full-channel" className="text-xs text-slate-400 truncate mt-1 hover:text-slate-200 transition-colors">
              {data.channel}
            </p>
          </div>
          <button
            id="full-like-btn"
            onClick={() => setIsLiked(!isLiked)}
            className={`no-drag p-1.5 rounded-full transition-all flex-shrink-0 ${isLiked ? "text-red-500 scale-110" : "text-slate-500 hover:text-slate-350 hover:bg-slate-800/40"}`}
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
            <div id="full-progress-bar" className="w-full h-1 bg-slate-800 rounded-lg overflow-hidden">
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
