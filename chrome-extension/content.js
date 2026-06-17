'use strict';
// YT Now Playing — content script (Phase 3)
// Reads YouTube DOM state and forwards it to the background service worker,
// which relays it via WebSocket to the Electron desktop widget.

let pollTimer     = null;
let titleObserver = null;
let attachedVideo = null;

// ── DOM helpers ───────────────────────────────────────────────────────────────

function getVideoId() {
  const url = new URL(location.href);
  if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
  return url.searchParams.get('v') || null;
}

function isAdPlaying() {
  return !!document.querySelector('.ad-showing');
}

function getTitle() {
  const selectors = [
    'ytd-watch-metadata h1 yt-formatted-string',
    '#title h1 yt-formatted-string',
    'h1.title yt-formatted-string',
    'ytd-reel-player-header-renderer h2 yt-formatted-string',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return document.title.replace(/\s*[-–]\s*YouTube\s*$/, '').trim() || null;
}

function getChannel() {
  const selectors = [
    'ytd-channel-name#channel-name a',
    '#channel-name a',
    'ytd-video-owner-renderer #channel-name a',
    'ytd-reel-player-header-renderer ytd-channel-name a',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return null;
}

// ── Messaging to background ───────────────────────────────────────────────────

function send(msg) {
  chrome.runtime.sendMessage(msg).catch(() => {
    // Background SW may be waking up — message dropped, next tick will retry
  });
}

function broadcastState(reason) {
  const video = document.querySelector('video');
  if (!video) return;
  if (isAdPlaying()) return;

  const videoId = getVideoId();
  if (!videoId) return;

  const msg = {
    type:        'now_playing',
    title:       getTitle(),
    channel:     getChannel(),
    thumbnail:   `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    isPlaying:   !video.paused && !video.ended,
    currentTime: parseFloat(video.currentTime.toFixed(1)),
    duration:    parseFloat(video.duration.toFixed(1)),
    videoId,
  };

  console.log(`[YT Now Playing] ${msg.isPlaying ? '▶' : '⏸'} ${reason} — ${msg.title?.slice(0, 60)}`);
  send(msg);
}

function broadcastNoPlayback(reason) {
  console.log('[YT Now Playing] no_playback —', reason);
  send({ type: 'no_playback' });
}

// ── Polling (currentTime updates every 1 s) ───────────────────────────────────

function startPolling() {
  if (pollTimer !== null) return;
  pollTimer = setInterval(() => broadcastState('tick'), 1000);
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

// ── Video event handlers ──────────────────────────────────────────────────────

function onPlay()   { broadcastState('play');   startPolling(); }
function onPause()  { broadcastState('pause');  stopPolling();  }
function onSeeked() { broadcastState('seeked');                 }
function onEnded()  { broadcastNoPlayback('video ended'); stopPolling(); }

function attachVideo(video) {
  if (attachedVideo === video) return;
  detachVideo();

  video.addEventListener('play',   onPlay);
  video.addEventListener('pause',  onPause);
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('ended',  onEnded);
  attachedVideo = video;

  console.log('[YT Now Playing] attached to <video>');

  if (!video.paused && !video.ended) {
    broadcastState('init (playing)');
    startPolling();
  } else {
    broadcastState('init (paused)');
  }
}

function detachVideo() {
  stopPolling();
  if (!attachedVideo) return;
  attachedVideo.removeEventListener('play',   onPlay);
  attachedVideo.removeEventListener('pause',  onPause);
  attachedVideo.removeEventListener('seeked', onSeeked);
  attachedVideo.removeEventListener('ended',  onEnded);
  attachedVideo = null;
}

// ── Title observer ────────────────────────────────────────────────────────────

function observeTitle() {
  if (titleObserver) titleObserver.disconnect();
  const el = document.querySelector('ytd-watch-metadata h1') ||
             document.querySelector('#title h1');
  if (!el) return;
  titleObserver = new MutationObserver(() => broadcastState('title changed'));
  titleObserver.observe(el, { childList: true, subtree: true, characterData: true });
}

// ── Init / SPA navigation ────────────────────────────────────────────────────

function init() {
  if (titleObserver) { titleObserver.disconnect(); titleObserver = null; }

  const videoId = getVideoId();
  if (!videoId) {
    detachVideo();
    broadcastNoPlayback('not a video page');
    return;
  }

  const video = document.querySelector('video');
  if (!video) {
    setTimeout(init, 500); // video element not in DOM yet — retry
    return;
  }

  attachVideo(video);
  observeTitle();
}

// YouTube fires this on every SPA navigation (clicking a video, back button, etc.)
document.addEventListener('yt-navigate-finish', () => {
  console.log('[YT Now Playing] navigate-finish — re-init');
  setTimeout(init, 800);
});

// Send no_playback when tab is closed or hidden (best-effort)
window.addEventListener('pagehide', () => broadcastNoPlayback('page hidden'));

// First load
setTimeout(init, 1500);
console.log('[YT Now Playing] content script loaded');
