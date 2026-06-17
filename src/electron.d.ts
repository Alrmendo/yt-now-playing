export {};

declare global {
  interface Window {
    electronAPI?: {
      openSettingsWindow(): void;
      closeWindow(): void;
      startDrag(): void;
      stopDrag(): void;
    };
  }
}
