'use strict';
const { app, BrowserWindow, ipcMain, nativeImage, screen, Tray, Menu } = require('electron');
const { WebSocketServer } = require('ws');
const path = require('path');

const WS_PORT   = 6969;
const isDev     = !app.isPackaged;
const ICON_PATH = path.join(__dirname, '../assets/icon.png');

let mainWindow     = null;
let settingsWindow = null;
let wss            = null;
let tray           = null;
let isQuitting     = false;

// ── Main player window ────────────────────────────────────────────────────────

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:       380,
    height:      580,
    minWidth:    280,
    minHeight:   120,
    frame:       false,
    transparent: true,
    alwaysOnTop: true,
    maximizable: false,
    fullscreenable: false,
    title: 'YT Now Playing',
    icon: ICON_PATH,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  isDev
    ? mainWindow.loadURL('http://localhost:3000/')
    : mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    settingsWindow?.close();
  });
}

// ── System tray ───────────────────────────────────────────────────────────────

function createTray() {
  const icon = nativeImage.createFromPath(ICON_PATH).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('YT Now Playing');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (!mainWindow) { createMainWindow(); return; }
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow) { createMainWindow(); return; }
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// ── Settings window ───────────────────────────────────────────────────────────

function openSettingsWindow() {
  // If already open, just focus it
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const GAP = 12;
  const SW  = 360;
  const SH  = 560;

  // Position next to the main player window
  let winX, winY;
  if (mainWindow) {
    const [mx, my]   = mainWindow.getPosition();
    const [mw, mh]   = mainWindow.getSize();
    const display    = screen.getDisplayMatching({ x: mx, y: my, width: mw, height: mh });
    const { x: sx, y: sy, width: sdw, height: sdh } = display.workArea;

    // Prefer right side; fall back to left if it would clip the screen
    winX = (mx + mw + GAP + SW <= sx + sdw)
      ? mx + mw + GAP
      : mx - SW - GAP;

    // Align top edge with main window, clamped to work area
    winY = Math.max(sy, Math.min(my, sy + sdh - SH));
  }

  settingsWindow = new BrowserWindow({
    width:     SW,
    height:    SH,
    ...(winX !== undefined && { x: winX, y: winY }),
    resizable: false,
    frame:     false,
    transparent: true,
    alwaysOnTop: true,
    title: 'YT Now Playing — Settings',
    icon: ICON_PATH,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  isDev
    ? settingsWindow.loadURL('http://localhost:3000/?page=settings')
    : settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
        query: { page: 'settings' },
      });

  settingsWindow.on('closed', () => { settingsWindow = null; });
}

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.on('settings:open', openSettingsWindow);

// Close whichever window sent this message
ipcMain.on('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

// ── Manual window dragging ──────────────────────────────────────────────────────
// Native -webkit-app-region drag desyncs from the cursor on scaled (>100% DPI)
// displays, capping how far the window can travel. Driving the move from
// screen.getCursorScreenPoint() keeps it 1:1 with the cursor regardless of scale.

let dragInterval = null;
let dragOffset   = null;

ipcMain.on('window:drag-start', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const cursor       = screen.getCursorScreenPoint();
  const [winX, winY] = win.getPosition();
  dragOffset = { x: cursor.x - winX, y: cursor.y - winY };

  if (dragInterval) clearInterval(dragInterval);
  dragInterval = setInterval(() => {
    if (!dragOffset || win.isDestroyed()) return;
    const point = screen.getCursorScreenPoint();
    win.setPosition(point.x - dragOffset.x, point.y - dragOffset.y);
  }, 16);
});

ipcMain.on('window:drag-stop', () => {
  if (dragInterval) {
    clearInterval(dragInterval);
    dragInterval = null;
  }
  dragOffset = null;
});

// ── WebSocket server ──────────────────────────────────────────────────────────

function startWebSocketServer() {
  wss = new WebSocketServer({ port: WS_PORT });

  wss.on('listening', () => console.log(`[WS] listening on ws://localhost:${WS_PORT}`));

  wss.on('connection', (socket, req) => {
    const ip = req.socket.remoteAddress ?? 'unknown';
    console.log(`[WS] connected: ${ip} (total: ${wss.clients.size})`);

    socket.on('message', (raw) => {
      const text = raw.toString();
      console.log(`[WS] ${ip}: ${text.slice(0, 120)}`);
      for (const client of wss.clients) {
        if (client !== socket && client.readyState === 1) client.send(text);
      }
    });

    socket.on('close', ()    => console.log(`[WS] disconnected: ${ip} (total: ${wss.clients.size})`));
    socket.on('error', (err) => console.error(`[WS] error: ${err.message}`));
  });

  wss.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE'
      ? `[WS] port ${WS_PORT} already in use`
      : `[WS] ${err.message}`);
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  startWebSocketServer();
  createMainWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Window close hides to tray instead of quitting; nothing to do here.
});

app.on('before-quit', () => {
  isQuitting = true;
  wss?.close();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
