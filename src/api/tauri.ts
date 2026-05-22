import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  CatalogEntry, InstalledState, LatestVersions,
  DoctorCheck, Settings, ProgressEvent
} from '../types';

export const api = {
  listCatalog: () =>
    invoke<CatalogEntry[]>('list_catalog'),

  detectInstalled: () =>
    invoke<InstalledState[]>('detect_installed'),

  checkLatest: (ids: string[]) =>
    invoke<LatestVersions>('check_latest', { ids }),

  install: (id: string) =>
    invoke<void>('install_cli', { id }),

  upgrade: (id: string) =>
    invoke<void>('upgrade_cli', { id }),

  uninstall: (id: string) =>
    invoke<void>('uninstall_cli', { id }),

  launch: (id: string) =>
    invoke<void>('launch_cli', { id }),

  doctor: () =>
    invoke<DoctorCheck[]>('run_doctor'),

  getSettings: () =>
    invoke<Settings>('get_settings'),

  setSettings: (settings: Settings) =>
    invoke<void>('set_settings', { settings }),

  onProgress: (cb: (event: ProgressEvent) => void): Promise<UnlistenFn> =>
    listen<ProgressEvent>('op-progress', (e) => cb(e.payload)),
};
