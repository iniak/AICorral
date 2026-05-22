import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListRow from './ListRow';
import type { CliView } from '../types';

const cli: CliView = {
  id: 'claude-code', name: 'Claude Code', vendor: 'Anthropic',
  mono: 'CC', hue: 28, description: 'test', tags: ['agent'],
  launchCmd: 'claude', runtime: 'Node >= 18',
  sources: [{ manager: 'npm', package: '@anthropic-ai/claude-code', os: ['windows','macos','linux'] }],
  installed: true, currentVersion: '1.0.42', latestVersion: '1.0.45',
  binaryPath: '/usr/local/bin/claude', installedAt: '2026-04-12', availableOnOs: true,
};

describe('ListRow', () => {
  it('shows update pill when behind latest', () => {
    render(<ListRow cli={cli} selected={false} checked={false}
      onCheck={vi.fn()} onSelect={vi.fn()} onAction={vi.fn()} busy={false} />);
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('calls onAction launch when Launch clicked', () => {
    const onAction = vi.fn();
    render(<ListRow cli={cli} selected={false} checked={false}
      onCheck={vi.fn()} onSelect={vi.fn()} onAction={onAction} busy={false} />);
    fireEvent.click(screen.getByText('Launch'));
    expect(onAction).toHaveBeenCalledWith('launch', cli);
  });
});
