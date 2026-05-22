import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../api/tauri', () => ({
  api: {
    listCatalog: vi.fn().mockResolvedValue([
      { id: 'claude-code', name: 'Claude Code', mono: 'CC', hue: 28, vendor: 'Anthropic',
        description: 'test', tags: ['agent'], launchCmd: 'claude', runtime: 'Node ≥ 18',
        sources: [{ manager: 'npm', package: '@anthropic-ai/claude-code', os: ['windows','macos','linux'] }] }
    ]),
    detectInstalled: vi.fn().mockResolvedValue([
      { id: 'claude-code', installed: true, currentVersion: '1.0.42', binaryPath: '/usr/local/bin/claude', installedAt: null }
    ]),
    checkLatest:  vi.fn().mockResolvedValue({ 'claude-code': '1.0.45' }),
    onProgress:   vi.fn().mockResolvedValue(() => {}),
  },
}));

import Installed from './Installed';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('Installed', () => {
  it('renders CLI name after data loads', async () => {
    render(<Installed selected={null} setSelected={vi.fn()} pushToast={vi.fn()} />, { wrapper });
    expect(await screen.findByText('Claude Code')).toBeInTheDocument();
  });
});
