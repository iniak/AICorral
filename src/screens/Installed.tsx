import { useState, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useInstalled } from '../hooks/useInstalled';
import { useLatest } from '../hooks/useLatest';
import { useInstallMutation } from '../hooks/useInstallMutation';
import { usePlatform } from '../hooks/usePlatform';
import ListRow from '../components/ListRow';
import { api } from '../api/tauri';
import type { CliView, ProgressEvent } from '../types';

function buildCliViews(
  catalog: ReturnType<typeof useCatalog>['data'],
  installed: ReturnType<typeof useInstalled>['data'],
  latest: Record<string, string>,
  currentOs: string,
): CliView[] {
  if (!catalog) return [];
  const instMap = Object.fromEntries((installed ?? []).map(s => [s.id, s]));
  return catalog.map(entry => {
    const state = instMap[entry.id];
    const availableOnOs = entry.sources.some(s => s.os.includes(currentOs));
    return {
      ...entry,
      installed: state?.installed ?? false,
      currentVersion: state?.currentVersion ?? null,
      latestVersion: latest[entry.id] ?? null,
      binaryPath: state?.binaryPath ?? null,
      installedAt: state?.installedAt ?? null,
      availableOnOs,
    };
  });
}

interface Props {
  selected: string | null;
  setSelected: (id: string | null) => void;
  pushToast: (msg: string) => void;
}

export default function Installed({ selected, setSelected, pushToast }: Props) {
  const [tab, setTab]     = useState<'installed' | 'available'>('installed');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, { lines: string[]; done: boolean; success: boolean }>>({});

  const { data: catalog } = useCatalog();
  const { data: installed } = useInstalled();
  const { data: currentOs } = usePlatform();
  const ids = catalog?.map(e => e.id) ?? [];
  const { data: latest = {} } = useLatest(ids);

  const views = useMemo(
    () => buildCliViews(catalog, installed, latest, currentOs ?? ''),
    [catalog, installed, latest, currentOs]
  );

  const mutation = useInstallMutation((event: ProgressEvent) => {
    setProgressMap(prev => {
      const existing = prev[event.id] ?? { lines: [], done: false, success: false };
      if (event.phase === 'done') {
        window.setTimeout(() => {
          setProgressMap(current => {
            const next = { ...current };
            delete next[event.id];
            return next;
          });
        }, 1200);
        return { ...prev, [event.id]: { ...existing, done: true, success: true } };
      }
      if (event.phase === 'error') return { ...prev, [event.id]: { ...existing, done: true, success: false } };
      return { ...prev, [event.id]: { ...existing, lines: [...existing.lines, event.line] } };
    });
  });

  const onAction = (op: 'install' | 'upgrade' | 'uninstall' | 'launch', cli: CliView) => {
    if (op === 'launch') { api.launch(cli.id); return; }
    setProgressMap(prev => ({ ...prev, [cli.id]: { lines: [], done: false, success: false } }));
    mutation.mutate({ op, id: cli.id }, {
      onSuccess: () => pushToast(`${op === 'install' ? 'Installed' : op === 'upgrade' ? 'Upgraded' : 'Removed'} ${cli.name}`),
      onError: (err) => pushToast(`Error: ${err.message}`),
    });
  };

  const shown = views
    .filter(c => tab === 'installed' ? c.installed : !c.installed)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.includes(search.toLowerCase())));

  const installedCount = views.filter(v => v.installed).length;
  const availableCount = views.filter(v => !v.installed).length;

  // progressMap is kept for future DetailDrawer integration
  void progressMap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`btn sm${tab === 'installed' ? ' primary' : ''}`} onClick={() => setTab('installed')}>
            Installed ({installedCount})
          </button>
          <button className={`btn sm${tab === 'available' ? ' primary' : ''}`} onClick={() => setTab('available')}>
            Available ({availableCount})
          </button>
        </div>
        <input style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', width: 200 }}
          placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="list" style={{ flex: 1, overflowY: 'auto' }}>
        {shown.length === 0 && <div className="empty"><p>No CLIs to show.</p></div>}
        {shown.map(cli => (
          <ListRow key={cli.id} cli={cli}
            selected={selected === cli.id}
            checked={checked.has(cli.id)}
            onCheck={(id) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
            onSelect={setSelected}
            onAction={onAction}
            busy={mutation.isPending && mutation.variables?.id === cli.id} />
        ))}
      </div>
    </div>
  );
}
