'use strict';
// Background service worker — YT Now Playing
// Tracks state of ALL YouTube tabs and forwards only the best playing tab to Electron.
//
// Selection logic:
//   1. Among tabs with isPlaying: true, pick the one updated most recently.
//   2. If no tab is playing → send { type: "no_playback" }.
//
// This runs as a singleton (one WS connection, one source of truth for the widget).

const WS_URL          = 'ws://localhost:6969';
const RECONNECT_DELAY = 3000; // ms
const KEEPALIVE_MIN   = 0.4;  // alarm every ~25 s to prevent SW termination

let ws             = null;
let reconnectTimer = null;
let lastSent       = null; // resent immediately on (re)connect

// Map<tabId: number, { msg: object, lastUpdate: number }>
const tabStates = new Map();

// ── WebSocket ─────────────────────────────────────────────────────────────────

function sendRaw(text) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(text);
    return true;
  }
  return false;
}

function connect() {
  clearTimeout(reconnectTimer);
  try {
    ws = new WebSocket(WS_URL);
  } catch (err) {
    console.warn('[BG] WebSocket construction failed:', err.message);
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    console.log('[BG] WebSocket connected to', WS_URL);
    if (lastSent) sendRaw(lastSent); // push latest known state on reconnect
  };

  ws.onclose = () => {
    console.log('[BG] WebSocket closed — reconnecting in', RECONNECT_DELAY, 'ms');
    scheduleReconnect();
  };

  ws.onerror = () => {
    // onclose always follows onerror, so reconnect is handled there
  };
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
}

// ── Tab selection & broadcast ─────────────────────────────────────────────────

function broadcast() {
  // Pick the playing tab updated most recently (tiebreaker per PLAN.md)
  let bestMsg    = null;
  let bestUpdate = -1;

  for (const { msg, lastUpdate } of tabStates.values()) {
    if (msg.type !== 'now_playing' || !msg.isPlaying) continue;
    if (lastUpdate > bestUpdate) {
      bestUpdate = lastUpdate;
      bestMsg    = msg;
    }
  }

  const text = bestMsg
    ? JSON.stringify(bestMsg)
    : JSON.stringify({ type: 'no_playback' });

  lastSent = text;
  sendRaw(text);
}

// ── Messages from content scripts ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (tabId === undefined) return false;

  if (msg.type === 'now_playing') {
    tabStates.set(tabId, { msg, lastUpdate: Date.now() });
  } else if (msg.type === 'no_playback') {
    tabStates.delete(tabId);
  }

  const status = msg.isPlaying !== undefined
    ? ` isPlaying=${msg.isPlaying}`
    : '';
  console.log(`[BG] tab ${tabId}: ${msg.type}${status} | tracking ${tabStates.size} tab(s)`);

  broadcast();
  return false;
});

// ── Tab closed ────────────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  if (!tabStates.has(tabId)) return;
  console.log(`[BG] tab ${tabId} closed — removed from tracking`);
  tabStates.delete(tabId);
  broadcast();
});

// ── Keep service worker alive ─────────────────────────────────────────────────

chrome.alarms.create('keepAlive', { periodInMinutes: KEEPALIVE_MIN });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'keepAlive') return;
  if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
    console.log('[BG] keepAlive: reconnecting');
    connect();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

connect();
console.log('[BG] service worker started (multi-tab mode)');
