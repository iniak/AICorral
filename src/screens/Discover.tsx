import { useEffect, useState, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useInstalled } from '../hooks/useInstalled';
import { useInstallMutation } from '../hooks/useInstallMutation';
import { useLatest } from '../hooks/useLatest';
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
  const ids = useMemo(() => (catalog ?? []).map(c => c.id), [catalog]);
  const { data: latest = {} } = useLatest(ids);
  const { data: installed } = useInstalled();
  const { data: currentOs } = usePlatform();

  const instMap = useMemo(() => Object.fromEntries((installed ?? []).map(s => [s.id, s])), [installed]);
  useEffect(() => setSelected(null), [setSelected]);

  const mutation = useInstallMutation((_event: ProgressEvent) => {});

  const views: CliView[] = useMemo(() => (catalog ?? []).map(entry => {
    const state = instMap[entry.id];
    return {
      ...entry,
      installed: state?.installed ?? false,
      currentVersion: state?.currentVersion ?? null,
      latestVersion: latest[entry.id] ?? null,
      binaryPath: state?.binaryPath ?? null,
      installedAt: state?.installedAt ?? null,
      availableOnOs: currentOs ? entry.sources.some(s => s.os.includes(currentOs)) : false,
    };
  }), [catalog, instMap, latest, currentOs]);

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
          <div key={cli.id} className="discover-card">
            <div className="discover-card-head">
              <CliIcon id={cli.id} mono={cli.mono} hue={cli.hue} size="md" />
              <div className="discover-title-block">
                <div className="discover-title">{cli.name}</div>
                <div className="discover-vendor">{cli.vendor}</div>
              </div>
            </div>
            <p className="discover-desc">{cli.description}</p>

            <div className="discover-inline-panel">
              <section className="discover-inline-section">
                <div className="discover-section-label">Overview</div>
                <div className="discover-facts">
                  <div>
                    <span>Runtime</span>
                    <strong>{cli.runtime}</strong>
                  </div>
                  <div>
                    <span>Command</span>
                    <code>{cli.launchCmd}</code>
                  </div>
                </div>
              </section>

              <section className="discover-inline-section">
                <div className="discover-section-label">Versions</div>
                <div className="discover-version-list">
                  {cli.currentVersion && (
                    <div className="discover-version-row">
                      <code>{cli.currentVersion}</code>
                      <span className="mini-pill ok">installed</span>
                    </div>
                  )}
                  {cli.latestVersion && cli.latestVersion !== cli.currentVersion && (
                    <div className="discover-version-row">
                      <code>{cli.latestVersion}</code>
                      <span className="mini-pill accent">latest</span>
                    </div>
                  )}
                  {!cli.currentVersion && !cli.latestVersion && (
                    <div className="discover-muted">No version information available</div>
                  )}
                </div>
              </section>
            </div>

            <div className="discover-tags">
              {cli.tags.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <button className={`btn sm discover-action${cli.installed ? '' : ' primary'}`}
              onClick={() => onInstall(cli)}
              disabled={!cli.availableOnOs || (mutation.isPending && mutation.variables?.id === cli.id)}>
              {!cli.availableOnOs ? 'Not available' : cli.installed ? 'Launch' : mutation.isPending && mutation.variables?.id === cli.id ? 'Installing…' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
