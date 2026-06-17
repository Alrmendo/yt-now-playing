# YT Now Playing

A floating desktop widget that shows what you're currently watching on YouTube — title, channel, artwork, and live playback progress.

Built with Electron + React. Communicates with a Chrome extension via a local WebSocket.

```
YouTube (Chrome)  →  Chrome Extension  →  WebSocket :6969  →  Desktop Widget
```

---

## For users — no coding needed

### Step 1 — Download the widget

Go to the [**Releases**](../../releases/latest) page and download **`YT.Now.Playing.exe`**.

No installation required. Just double-click to run.

---

### Step 2 — Install the Chrome extension

The `.exe` alone only shows the widget window. You also need the Chrome extension to send data from YouTube.

1. Download and extract this repository as a ZIP (**Code → Download ZIP**)
2. Open Chrome → go to `chrome://extensions`
3. Enable **Developer mode** (toggle, top-right corner)
4. Click **Load unpacked** → select the **`chrome-extension`** folder

> The extension only needs to be installed once. It works silently in the background.

---

### Step 3 — Use it

1. Run `YT.Now.Playing.exe`
2. Open YouTube in Chrome and play any video
3. The widget updates automatically

| Action | How |
|--------|-----|
| Move widget | Click and drag the card |
| Open settings | Click ⚙ on the card |
| Close settings | Click ✕ on the settings panel |

**Settings:** Layout (Full / Compact / Slim), Accent color, Progress bar, Time labels.

---

## Troubleshooting

**Widget shows "Waiting for YouTube…"**
→ Make sure the Chrome extension is loaded and enabled in `chrome://extensions`. Reload the YouTube tab.

**Widget doesn't appear after double-click**
→ Check if it's hidden behind other windows. It's always-on-top but starts at center screen.

**Port 6969 already in use**
→ Another instance is already running. Close it first (check Task Manager).

---

## For developers

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- Git

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/yt-now-playing.git
cd yt-now-playing
npm install
```

### Run in dev mode

```bash
npm run electron:dev
# or: double-click start.bat on Windows
```

### Build portable .exe

```bash
npm run electron:pack
# Output → release/YT Now Playing.exe
```

Upload the `.exe` to GitHub Releases so users can download it directly.

### Project structure

```
yt-now-playing/
├── electron/
│   ├── main.cjs          # Main process: BrowserWindow, WebSocket server, IPC
│   └── preload.cjs       # Context bridge (exposes electronAPI to renderer)
├── src/
│   ├── App.tsx            # Root — routes between player window and settings window
│   ├── hooks/
│   │   └── useNowPlaying.ts   # WebSocket client hook (auto-reconnect)
│   └── components/
│       ├── FullCardPlayer.tsx
│       ├── CompactPlayer.tsx
│       ├── SlimBarPlayer.tsx
│       ├── IdleState.tsx
│       └── SettingsView.tsx
├── chrome-extension/
│   ├── manifest.json
│   ├── content.js         # Reads YouTube DOM (title, channel, progress)
│   └── background.js      # WebSocket client + multi-tab management
└── start.bat              # Dev launcher for Windows
```
