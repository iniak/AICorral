import { useState, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useInstalled } from '../hooks/useInstalled';
import { useInstallMutation } from '../hooks/useInstallMutation';
import { usePlatform } from '../hooks/usePlatform';
import CliIcon from '../components/CliIcon';
import { api } from '../api/tauri';
import type { CliView, ProgressEvent } from '../types';

const TAGS = ['All', 'agent', 'pair', 'mcp', 'open-source'] as const;

interface Props {
  selected: string | null;
  setSelected: (id: string | null) => void;
  pushToast: (msg: string) => void;
}

export default function Discover({ setSelected, pushToast }: Props) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: catalog } = useCatalog();
  const { data: installed } = useInstalled();
  const { data: currentOs } = usePlatform();

  const instMap = useMemo(() => Object.fromEntries((installed ?? []).map(s => [s.id, s])), [installed]);

  const mutation = useInstallMutation((_event: ProgressEvent) => {});

  const views: CliView[] = useMemo(() => (catalog ?? []).map(entry => {
    const state = instMap[entry.id];
    return {
      ...entry,
      installed: state?.installed ?? false,
      currentVersion: state?.currentVersion ?? null,
      latestVersion: null,
      binaryPath: state?.binaryPath ?? null,
      installedAt: state?.installedAt ?? null,
      availableOnOs: currentOs ? entry.sources.some(s => s.os.includes(currentOs)) : false,
    };
  }), [catalog, instMap, currentOs]);

  const shown = views
    .filter(c => filter === 'All' || c.tags.includes(filter))
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const onInstall = (cli: CliView) => {
    if (cli.installed) { api.launch(cli.id); return; }
    mutation.mutate({ op: 'install', id: cli.id }, {
      onSuccess: () => pushToast(`Installed ${cli.name}`),
      onError: (err) => pushToast(`Error: ${err.message}`),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 4 }}>
          {TAGS.map(t => (
            <button key={t} className={`btn sm${filter === t ? ' primary' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <input style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', width: 200 }}
          placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="discover-grid" style={{ overflowY: 'auto', flex: 1 }}>
        {shown.map(cli => (
          <div key={cli.id} className="discover-card" onClick={() => setSelected(cli.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CliIcon id={cli.id} mono={cli.mono} hue={cli.hue} size="md" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cli.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{cli.vendor}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.5 }}>{cli.description}</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {cli.tags.map(t => (
                <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--ink-3)', border: '1px solid var(--border)' }}>{t}</span>
              ))}
            </div>
            <button className={`btn sm discover-action${cli.installed ? '' : ' primary'}`}
              onClick={e => { e.stopPropagation(); onInstall(cli); }}
              disabled={!cli.availableOnOs || (mutation.isPending && mutation.variables?.id === cli.id)}>
              {!cli.availableOnOs ? 'Not available' : cli.installed ? 'Launch' : mutation.isPending && mutation.variables?.id === cli.id ? 'Installing…' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
