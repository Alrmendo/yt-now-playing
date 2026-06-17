export {};

declare global {
  interface Window {
    electronAPI?: {
      openSettingsWindow(): void;
      closeWindow(): void;
      setTaskbarIcon(dataURL: string): void;
    };
  }
}
