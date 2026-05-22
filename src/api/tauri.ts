import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  CatalogEntry, InstalledState, LatestVersions,
  DoctorCheck, Settings, ProgressEvent
} from '../types';

// Tauri rejects invoke() with a plain string. Wrap it in a real Error so
// err.message works in onError handlers throughout the app.
function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  return invoke<T>(cmd, args).catch(e => {
    throw e instanceof Error ? e : new Error(String(e));
  });
}

export const api = {
  listCatalog: () =>
    tauriInvoke<CatalogEntry[]>('list_catalog'),

  detectInstalled: () =>
    tauriInvoke<InstalledState[]>('detect_installed'),

  checkLatest: (ids: string[]) =>
    tauriInvoke<LatestVersions>('check_latest', { ids }),

  install: (id: string) =>
    tauriInvoke<void>('install_cli', { id }),

  upgrade: (id: string) =>
    tauriInvoke<void>('upgrade_cli', { id }),

  uninstall: (id: string) =>
    tauriInvoke<void>('uninstall_cli', { id }),

  launch: (id: string) =>
    tauriInvoke<void>('launch_cli', { id }),

  doctor: () =>
    tauriInvoke<DoctorCheck[]>('run_doctor'),

  getSettings: () =>
    tauriInvoke<Settings>('get_settings'),

  setSettings: (settings: Settings) =>
    tauriInvoke<void>('set_settings', { settings }),

  onProgress: (cb: (event: ProgressEvent) => void): Promise<UnlistenFn> =>
    listen<ProgressEvent>('op-progress', (e) => cb(e.payload)),
};
