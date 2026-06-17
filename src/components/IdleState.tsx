/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Youtube, Radio, Settings } from "lucide-react";
import { LayoutPreset, ThemePreset } from "../types";
import { getThemeClasses } from "../mockData";

interface IdleStateProps {
  layout: LayoutPreset;
  theme: ThemePreset;
  onOpenSettings?: () => void;
}

export default function IdleState({ layout, theme, onOpenSettings }: IdleStateProps) {
  const t = getThemeClasses(theme.accent);

  if (layout === "slim") {
    return (
      <div
        id="widget-idle-slim"
        className="drag w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-xs text-slate-300 font-sans shadow-lg"
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700">
            <Youtube className="w-4 h-4 text-slate-500 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-200">No playback active</div>
            <p className="text-[10px] text-slate-400">Waiting for YouTube media...</p>
          </div>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="no-drag ml-3 p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/60 transition-all flex-shrink-0"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div
        id="widget-idle-compact"
        className="drag relative w-[280px] p-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 shadow-xl flex flex-col items-center justify-center text-center font-sans space-y-3"
      >
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="no-drag absolute top-2 right-2 p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/60 transition-all"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}
        <div className="relative group">
          <div className={`absolute -inset-1 rounded-full opacity-35 blur-sm group-hover:opacity-50 ${t.bg}`} />
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700">
            <Youtube className="w-6 h-6 text-slate-400" />
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">No YouTube Media</h4>
          <p className="text-xs text-slate-400 leading-relaxed px-2">Play a video to sync status</p>
        </div>
      </div>
    );
  }

  // Full layout
  return (
    <div
      id="widget-idle-full"
      className="drag w-[320px] p-5 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-between text-center font-sans h-[340px]"
    >
      {/* Top bar */}
      <div className="w-full flex justify-between items-center text-[10px] text-slate-500 tracking-wider uppercase font-mono px-1">
        <span className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-slate-400" />
          Offline
        </span>
        <div className="flex items-center gap-2">
          <span>YT widget</span>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="no-drag p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/60 transition-all"
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-800/80 shadow-inner group">
          <div className="absolute inset-0 rounded-2xl bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Youtube className="w-10 h-10 text-slate-500 group-hover:text-red-500 transition-colors duration-300" />
        </div>
        <div className="space-y-1 max-w-[200px]">
          <h3 className="text-sm font-bold text-slate-100">Awaiting Stream...</h3>
          <p className="text-xs text-slate-400">
            The widget remains on standby until a YouTube tab starts playing.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 font-mono">
        Ready for browser connection
      </div>
    </div>
  );
}
