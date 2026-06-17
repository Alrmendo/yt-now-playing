/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, 
  Tv, 
  Layout, 
  HelpCircle, 
  Info, 
  Laptop, 
  Sliders, 
  Monitor, 
  Sparkles,
  Youtube,
  Radio,
  ExternalLink
} from "lucide-react";

import { NowPlaying, WidgetSettings, LayoutPreset } from "./types";
import { MOCK_SONGS, THEME_PRESETS, getThemeClasses } from "./mockData";

import CompactPlayer from "./components/CompactPlayer";
import FullCardPlayer from "./components/FullCardPlayer";
import SlimBarPlayer from "./components/SlimBarPlayer";
import IdleState from "./components/IdleState";
import SettingsPanel from "./components/SettingsPanel";
import PlaylistSimulator from "./components/PlaylistSimulator";

const LOCAL_STORAGE_KEY_SETTINGS = "yt_now_playing_settings";
const LOCAL_STORAGE_KEY_CURRENT_SONG = "yt_now_playing_active_song";

const DEFAULT_SETTINGS: WidgetSettings = {
  layout: "full",
  themeId: "yt-red",
  showProgress: true,
  showTimeLabels: true,
  alwaysOnTopSimulated: true,
  useMockInteractivity: true
};

export default function App() {
  // 1. Load configuration from localStorage
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  // 2. Playback state
  const [songsList, setSongsList] = useState<NowPlaying[]>(() => MOCK_SONGS);
  const [currentSong, setCurrentSong] = useState<NowPlaying | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_SONG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return MOCK_SONGS[0];
  });

  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPureView, setIsPureView] = useState<boolean>(false); // presentation vs simulator layout
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync settings of widget to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Sync active song of widget to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_SONG, JSON.stringify(currentSong));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_SONG);
    }
  }, [currentSong]);

  // 3. Simulated Clock effect advancing currentTime
  useEffect(() => {
    if (!currentSong || !currentSong.isPlaying) return;

    const tick = setInterval(() => {
      setCurrentSong((prev) => {
        if (!prev || !prev.isPlaying) return prev;
        
        let nextTime = prev.currentTime + timeMultiplier;
        let isPlaying = prev.isPlaying;

        if (nextTime >= prev.duration) {
          nextTime = 0; // loop back to start
          // Trigger a short toast notification indicating loop
          showToast(`Looped: "${prev.title}"`);
        }

        return { ...prev, currentTime: nextTime };
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [currentSong?.isPlaying, currentSong?.videoId, timeMultiplier]);

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 4. State Handlers
  const handleTogglePlay = () => {
    if (!currentSong) return;
    setCurrentSong((prev) => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  };

  const handleSeek = (newTime: number) => {
    if (!currentSong) return;
    const boundedTime = Math.max(0, Math.min(currentSong.duration, Math.round(newTime)));
    setCurrentSong((prev) => prev ? { ...prev, currentTime: boundedTime } : null);
  };

  const handlePrevSong = () => {
    if (songsList.length === 0) return;
    const currentIndex = currentSong 
      ? songsList.findIndex((s) => s.videoId === currentSong.videoId) 
      : 0;
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = songsList.length - 1;

    const selected = songsList[prevIndex];
    // Persist current play state
    setCurrentSong({
      ...selected,
      isPlaying: currentSong ? currentSong.isPlaying : true,
      currentTime: 0
    });
    showToast(`Loaded: ${selected.channel}`);
  };

  const handleNextSong = () => {
    if (songsList.length === 0) return;
    const currentIndex = currentSong 
      ? songsList.findIndex((s) => s.videoId === currentSong.videoId) 
      : 0;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= songsList.length) nextIndex = 0;

    const selected = songsList[nextIndex];
    // Persist current play state
    setCurrentSong({
      ...selected,
      isPlaying: currentSong ? currentSong.isPlaying : true,
      currentTime: 0
    });
    showToast(`Loaded: ${selected.channel}`);
  };

  const handleSelectSong = (song: NowPlaying | null) => {
    if (song === null) {
      setCurrentSong(null);
      showToast("Entered standby (No audio state)");
    } else {
      setCurrentSong({ ...song, isPlaying: true, currentTime: 0 });
      showToast(`Now Playing: ${song.channel}`);
    }
  };

  const handleAddCustomSong = (newSong: NowPlaying) => {
    setSongsList((prev) => [newSong, ...prev]);
    setCurrentSong(newSong);
    showToast(`Custom song injected!`);
  };

  const handleResetPlaylist = () => {
    setSongsList(MOCK_SONGS);
    setCurrentSong(MOCK_SONGS[0]);
    setTimeMultiplier(1);
    setSettings(DEFAULT_SETTINGS);
    showToast("Simulation restarted to defaults!");
  };

  const updateSettingsHandler = (newFields: Partial<WidgetSettings>) => {
    setSettings((prev) => ({ ...prev, ...newFields }));
  };

  // Extract selected theme
  const activeTheme = THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];
  const t = getThemeClasses(activeTheme.accent);

  // Widget preview dimension guides
  const getLayoutDimensions = (preset: LayoutPreset) => {
    switch (preset) {
      case "slim":
        return "420px max-width";
      case "compact":
        return "280px x 80px";
      case "full":
      default:
        return "320px x 340px";
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-purple-500/30 selection:text-white"
      id="app-root-container"
    >
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo element */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl text-white shadow-md bg-gradient-to-tr ${activeTheme.bgGradient.replace("from-", "from-").replace("via-", "to-")} ${t.bg}`}>
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-bold font-display tracking-tight text-white leading-none">YT Now Playing</h1>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  WIDGET SANDBOX
                </span>
              </div>
              <p className="text-[10px] text-slate-550 mt-0.5">Desktop Widget Audio Overlay Mockup</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Viewport display switcher toggle */}
            <button
              id="btn-toggle-view"
              onClick={() => setIsPureView(!isPureView)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isPureView 
                  ? "bg-slate-800 text-white border-slate-700" 
                  : "bg-slate-900/60 hover:bg-slate-850 text-slate-350 border-slate-800 hover:border-slate-750"
              }`}
              title="Toggle standalone view vs dashboard workspace"
            >
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>{isPureView ? "Sandbox Workspace" : "Isolated Widget Mode"}</span>
            </button>

            {/* Config Cog */}
            <button
              id="btn-open-settings"
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl border transition-all hover:bg-slate-850 hover:text-white ${
                isSettingsOpen 
                  ? `${t.border} ${t.bgLight} ${t.text}` 
                  : "bg-slate-900/65 border-slate-800 text-slate-450"
              }`}
              title="Open Widget Configurations"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
        
        {/* Dynamic toast tracker box */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="toast-popup"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-20 z-50 bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl px-4 py-2.5 rounded-2xl flex items-center space-x-2.5 text-xs select-none"
            >
              <Sparkles className={`w-3.5 h-3.5 ${t.text}`} />
              <span className="font-semibold">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-full flex flex-col items-center justify-center">
          
          <AnimatePresence mode="wait">
            {!isPureView ? (
              // View A: The high-fidelity developer Sandbox Workspace with floating simulation guidelines
              <motion.div
                key="sandbox-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start lg:justify-center"
              >
                {/* Left Side: Virtual Desktop Widget Stage */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
                  
                  {/* Stage description header */}
                  <div className="w-full flex justify-between items-center text-xs text-slate-400 px-2 font-mono">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide">
                      <Laptop className="w-3.5 h-3.5 text-purple-400" />
                      Virtual Widget Overlay Canvas
                    </span>
                    <span className="text-slate-500">
                      preset: <strong className="text-slate-350">{settings.layout}</strong> ({getLayoutDimensions(settings.layout)})
                    </span>
                  </div>

                  {/* Desktop Simulator Container */}
                  <div className="w-full aspect-[4/3] max-w-xl bg-slate-900/15 border border-slate-800/80 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-inner min-h-[360px] relative group/stage">
                    
                    {/* Background mock grid design representing a desktop computer */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
                    
                    {/* High-quality screen wallpaper reflection overlay */}
                    <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />
                    
                    {/* Elegant layout presentation area with fluid transition */}
                    <motion.div
                      layout
                      className="relative z-10 flex items-center justify-center w-full"
                    >
                      {currentSong ? (
                        <>
                          {/* Compact mini-player layout option */}
                          {settings.layout === "compact" && (
                            <CompactPlayer
                              data={currentSong}
                              theme={activeTheme}
                              settings={settings}
                              onTogglePlay={handleTogglePlay}
                              onSeek={handleSeek}
                            />
                          )}

                          {/* Full card premium window player layout option */}
                          {settings.layout === "full" && (
                            <FullCardPlayer
                              data={currentSong}
                              theme={activeTheme}
                              settings={settings}
                              onTogglePlay={handleTogglePlay}
                              onPrev={handlePrevSong}
                              onNext={handleNextSong}
                              onSeek={handleSeek}
                            />
                          )}

                          {/* Slim horizontal strip layout option */}
                          {settings.layout === "slim" && (
                            <SlimBarPlayer
                              data={currentSong}
                              theme={activeTheme}
                              settings={settings}
                              onTogglePlay={handleTogglePlay}
                              onSeek={handleSeek}
                            />
                          )}
                        </>
                      ) : (
                        <IdleState
                          layout={settings.layout}
                          theme={activeTheme}
                          onSelectDefault={() => handleSelectSong(songsList[0])}
                        />
                      )}
                    </motion.div>

                    {/* Guidelines and specs overlay showing on hover */}
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[9px] font-mono text-slate-500 opacity-60 group-hover/stage:opacity-100 transition-opacity select-none">
                      <span>FPS: 60/60</span>
                      <span>BUFFERING MOCK SOCKET: TRUE</span>
                      <span>ACTIVE PRESET: {settings.layout.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Sandbox Hinting Box */}
                  <div className="text-xs text-slate-400 max-w-md text-center leading-relaxed">
                    Use the panel on the right side to change active YouTube media or fast-forward simulation time to watch how progress bars react and loop automatically.
                  </div>
                </div>

                {/* Right Side: Tab States / Playlist Control Panel */}
                <div className="lg:col-span-5 flex justify-center">
                  <PlaylistSimulator
                    currentSong={currentSong}
                    songsList={songsList}
                    onSelectSong={handleSelectSong}
                    onAddCustomSong={handleAddCustomSong}
                    onResetPlaylist={handleResetPlaylist}
                    timeMultiplier={timeMultiplier}
                    onSetMultiplier={setTimeMultiplier}
                    isPlaying={currentSong ? currentSong.isPlaying : false}
                    onTogglePlay={handleTogglePlay}
                  />
                </div>
              </motion.div>
            ) : (
              // View B: Pure standalone display (perfect for showcasing the widget alone without clutter)
              <motion.div
                key="isolated-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col items-center justify-center py-12 space-y-6"
              >
                <div className="text-center font-mono text-[10px] tracking-widest text-slate-500 uppercase select-none">
                  Isolated Preview Mode • Focus View
                </div>

                <div className="relative p-12 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800/80 flex items-center justify-center min-h-[380px] w-full max-w-lg">
                  {currentSong ? (
                    <>
                      {settings.layout === "compact" && (
                        <CompactPlayer
                          data={currentSong}
                          theme={activeTheme}
                          settings={settings}
                          onTogglePlay={handleTogglePlay}
                          onSeek={handleSeek}
                        />
                      )}

                      {settings.layout === "full" && (
                        <FullCardPlayer
                          data={currentSong}
                          theme={activeTheme}
                          settings={settings}
                          onTogglePlay={handleTogglePlay}
                          onPrev={handlePrevSong}
                          onNext={handleNextSong}
                          onSeek={handleSeek}
                        />
                      )}

                      {settings.layout === "slim" && (
                        <SlimBarPlayer
                          data={currentSong}
                          theme={activeTheme}
                          settings={settings}
                          onTogglePlay={handleTogglePlay}
                          onSeek={handleSeek}
                        />
                      )}
                    </>
                  ) : (
                    <IdleState
                      layout={settings.layout}
                      theme={activeTheme}
                      onSelectDefault={() => handleSelectSong(songsList[0])}
                    />
                  )}
                </div>

                <button
                  id="btn-return-workspace"
                  onClick={() => setIsPureView(false)}
                  className="px-4 py-2 bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-350 rounded-xl hover:text-white hover:border-slate-700 transition"
                >
                  Return to Sandbox Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* 3. Settings Config panel overlay */}
      <SettingsPanel
        settings={settings}
        onUpdateSettings={updateSettingsHandler}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 4. Elegant Minimal Footer */}
      <footer className="border-t border-slate-900/70 py-6 text-center select-none text-[11px] font-mono text-slate-500 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>YT Now Playing © 2026 • Interactive UX Prototype</p>
          <div className="flex gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSettingsOpen(true); }} className="hover:text-slate-300">Preferences</a>
            <span>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); handleResetPlaylist(); }} className="hover:text-slate-300">Reset System</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
