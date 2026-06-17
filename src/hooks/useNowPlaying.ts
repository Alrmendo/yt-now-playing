/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { NowPlaying } from "../types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useNowPlaying(): { currentSong: NowPlaying | null; connectionStatus: ConnectionStatus } {
  const [currentSong, setCurrentSong] = useState<NowPlaying | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    function connect() {
      if (!active) return;
      setConnectionStatus("connecting");

      const ws = new WebSocket("ws://localhost:6969");
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) { ws.close(); return; }
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === "now_playing") {
            setCurrentSong({
              title: msg.title,
              channel: msg.channel,
              thumbnail: msg.thumbnail,
              isPlaying: msg.isPlaying,
              currentTime: msg.currentTime,
              duration: msg.duration,
              videoId: msg.videoId,
            });
          } else if (msg.type === "no_playback") {
            setCurrentSong(null);
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!active) return;
        setConnectionStatus("disconnected");
        setCurrentSong(null);
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      active = false;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      const ws = wsRef.current;
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
        wsRef.current = null;
      }
    };
  }, []);

  return { currentSong, connectionStatus };
}
