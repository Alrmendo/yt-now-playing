/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Play, 
  Pause, 
  Plus, 
  Radio, 
  RotateCcw, 
  Square, 
  Trash2, 
  Tv, 
  Volume2, 
  Timer,
  Info,
  ExternalLink,
  Youtube
} from "lucide-react";
import { NowPlaying, ThemePreset } from "../types";
import { MOCK_SONGS, getThemeClasses } from "../mockData";

interface PlaylistSimulatorProps {
  currentSong: NowPlaying | null;
  songsList: NowPlaying[];
  onSelectSong: (song: NowPlaying | null) => void;
  onAddCustomSong: (song: NowPlaying) => void;
  onResetPlaylist: () => void;
  timeMultiplier: number;
  onSetMultiplier: (mult: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function PlaylistSimulator({
  currentSong,
  songsList,
  onSelectSong,
  onAddCustomSong,
  onResetPlaylist,
  timeMultiplier,
  onSetMultiplier,
  isPlaying,
  onTogglePlay,
}: PlaylistSimulatorProps) {
  // States for custom song form
  const [customTitle, setCustomTitle] = React.useState("");
  const [customChannel, setCustomChannel] = React.useState("");
  const [customDuration, setCustomDuration] = React.useState("180"); // 3 mins default
  const [showAddForm, setShowAddForm] = React.useState(false);

  // Submit custom song
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customChannel) return;

    const durationInt = parseInt(customDuration, 10) || 180;
    const newSong: NowPlaying = {
      videoId: `custom-${Date.now()}`,
      title: customTitle,
      channel: customChannel,
      thumbnail: `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80`, // nice dynamic audio theme
      isPlaying: true,
      currentTime: 0,
      duration: durationInt,
    };

    onAddCustomSong(newSong);
    setCustomTitle("");
    setCustomChannel("");
    setCustomDuration("180");
    setShowAddForm(false);
  };

  return (
    <div 
      id="sandbox-dashboard-controller"
      className="bg-slate-900/45 p-6 rounded-3xl border border-slate-800/80 shadow-lg space-y-6 text-sans max-w-lg w-full"
    >
      {/* Simulation Controls Dashboard Heading */}
      <div className="flex justify-between items-center select-none border-b border-slate-800/60 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="bg-red-500/10 p-2 rounded-xl text-red-500 border border-red-500/15">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">YouTube Tab Simulator</h2>
            <p className="text-[10px] text-slate-400">Emulate YouTube browser state & trigger widget updates</p>
          </div>
        </div>
        
        {/* Reset */}
        <button
          id="btn-global-reset"
          onClick={onResetPlaylist}
          className="text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 p-2 rounded-xl border border-slate-700/40 transition-all active:scale-95 text-xs flex items-center space-x-1"
          title="Restore factory default simulation tracks"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset list</span>
        </button>
      </div>

      {/* Speed dial and Status Injector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
        {/* Playback Simulation multipliers */}
        <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              Clock Multiplier
            </span>
            <span id="label-active-mult" className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              {timeMultiplier}x
            </span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {[1, 5, 15, 35].map((multiplier) => (
              <button
                id={`btn-speed-${multiplier}`}
                key={multiplier}
                onClick={() => onSetMultiplier(multiplier)}
                className={`flex-1 py-1 text-[10px] font-mono rounded-lg transition-all ${
                  timeMultiplier === multiplier
                    ? "bg-sky-500 text-slate-950 font-bold border-sky-400"
                    : "bg-slate-800 text-slate-350 hover:bg-slate-750 border border-slate-700/60"
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>
        </div>

        {/* Global Standby Trigger */}
        <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              State Interrupter
            </span>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Simulate closing the active browser tab or cutting playback feeds.
            </p>
          </div>
          <button
            id="btn-standby-idle"
            onClick={() => onSelectSong(null)}
            className={`w-full py-1.5 mt-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              currentSong === null
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/20"
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
            <span>{currentSong === null ? "Currently Idle (Standby)" : "Inject Idle Standby"}</span>
          </button>
        </div>
      </div>

      {/* Playlist Tracks List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>Select Active Tab</span>
          </h3>
          
          <button
            id="toggle-add-form"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate custom url</span>
          </button>
        </div>

        {/* Custom Song Form */}
        {showAddForm && (
          <form 
            id="custom-stream-form"
            onSubmit={handleAddSubmit} 
            className="p-3.5 bg-slate-950/40 rounded-2xl border border-purple-500/20 space-y-3 animate-fade-in"
          >
            <h4 className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">Custom YouTube Metadata</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id="input-custom-title"
                type="text"
                placeholder="Video Title (e.g. Lofi Synthchill)"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-850 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                id="input-custom-channel"
                type="text"
                placeholder="Channel Name"
                required
                value={customChannel}
                onChange={(e) => setCustomChannel(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-850 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label htmlFor="input-custom-duration" className="text-[9px] text-slate-400 font-mono">Duration (seconds)</label>
                <input
                  id="input-custom-duration"
                  type="number"
                  min="5"
                  max="43200"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-850 rounded-lg p-1.5 text-slate-150 focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  id="btn-cancel-custom"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-custom"
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-md hover:shadow-purple-500/10 active:scale-95 transition-all"
                >
                  Inject Live
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tracks List */}
        <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {songsList.map((song) => {
            const isCurrentlySelected = currentSong?.videoId === song.videoId;
            return (
              <div
                id={`song-row-${song.videoId}`}
                key={song.videoId}
                onClick={() => onSelectSong(song)}
                className={`flex items-center text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrentlySelected 
                    ? "border-red-500/40 bg-red-500/5 hover:bg-red-500/10 shadow-sm" 
                    : "border-slate-800/80 bg-slate-850/20 hover:border-slate-700/80 hover:bg-slate-800/30"
                }`}
              >
                {/* Thumb preview card */}
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-9 h-9 rounded object-cover border border-slate-800 mr-3 flex-shrink-0"
                />
                
                {/* Details */}
                <div className="min-w-0 flex-1 pr-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">YT VIDEO</span>
                    {isCurrentlySelected && song.isPlaying && (
                      <span className="flex space-x-0.5 items-end h-2 pb-0.5">
                        <span className="w-0.5 h-1.5 bg-red-400 animate-bounce" />
                        <span className="w-0.5 h-2 bg-red-400 animate-bounce" style={{animationDelay: "0.15s"}} />
                        <span className="w-0.5 h-1 bg-red-400 animate-bounce" style={{animationDelay: "0.3s"}} />
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-semibold text-slate-200 truncate leading-snug mt-0.5">
                    {song.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {song.channel}
                  </p>
                </div>

                {/* Simulated status indicator */}
                <div className="text-right flex-shrink-0 select-none">
                  {isCurrentlySelected ? (
                    <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">
                      Syncing
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 hover:text-white transition-colors">
                      Demo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational info box */}
      <div className="bg-slate-950/20 p-3.5 rounded-2xl border border-slate-800/80 select-none">
        <div className="flex space-x-3">
          <Info className="w-4.5 h-4.5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-normal space-y-1">
            <span className="font-bold text-slate-200 block">Desktop Widget Behavior:</span>
            <p>
              In a full production scenario, this widget queries active chrome tabs, extracting YouTube playing metadata via a light extension. This sandbox emulates those incoming sockets perfectly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
