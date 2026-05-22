import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { api } from './tauri';

const mockInvoke = vi.mocked(invoke);
const mockListen = vi.mocked(listen);

beforeEach(() => vi.clearAllMocks());

describe('api.listCatalog', () => {
  it('calls invoke with list_catalog', async () => {
    mockInvoke.mockResolvedValue([]);
    await api.listCatalog();
    expect(mockInvoke).toHaveBeenCalledWith('list_catalog');
  });
});

describe('api.install', () => {
  it('calls invoke with install_cli and id', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await api.install('claude-code');
    expect(mockInvoke).toHaveBeenCalledWith('install_cli', { id: 'claude-code' });
  });
});

describe('api.onProgress', () => {
  it('calls listen with op-progress', async () => {
    mockListen.mockResolvedValue(() => {});
    await api.onProgress(() => {});
    expect(mockListen).toHaveBeenCalledWith('op-progress', expect.any(Function));
  });
});
