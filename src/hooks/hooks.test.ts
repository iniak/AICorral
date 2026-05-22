import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../api/tauri', () => ({
  api: {
    listCatalog:     vi.fn().mockResolvedValue([{ id: 'claude-code', name: 'Claude Code' }]),
    detectInstalled: vi.fn().mockResolvedValue([{ id: 'claude-code', installed: true, currentVersion: '1.0.45' }]),
    checkLatest:     vi.fn().mockResolvedValue({ 'claude-code': '1.0.45' }),
    doctor:          vi.fn().mockResolvedValue([{ name: 'Node', status: 'ok', detail: '/usr/local/bin/node' }]),
    onProgress:      vi.fn().mockResolvedValue(() => {}),
  },
}));

import { useCatalog }   from './useCatalog';
import { useInstalled } from './useInstalled';
import { useLatest }    from './useLatest';
import { useDoctor }    from './useDoctor';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => vi.clearAllMocks());

describe('useCatalog', () => {
  it('returns catalog entries', async () => {
    const { result } = renderHook(() => useCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe('claude-code');
  });
});

describe('useLatest', () => {
  it('is disabled when ids is empty', () => {
    const { result } = renderHook(() => useLatest([]), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});
