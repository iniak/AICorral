import { useMemo, useState } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useInstalled } from '../hooks/useInstalled';
import { useLatest } from '../hooks/useLatest';
import { useInstallMutation } from '../hooks/useInstallMutation';
import { usePlatform } from '../hooks/usePlatform';
import ListRow from '../components/ListRow';
import { api } from '../api/tauri';
import type { Route } from '../App';
import type { CliView, ProgressEvent } from '../types';

interface Props {
  setRoute: (r: Route) => void;
  pushToast: (msg: string) => void;
}

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
    return {
      ...entry,
      installed: state?.installed ?? false,
      currentVersion: state?.currentVersion ?? null,
      latestVersion: latest[entry.id] ?? null,
      binaryPath: state?.binaryPath ?? null,
      installedAt: state?.installedAt ?? null,
      availableOnOs: currentOs ? entry.sources.some(s => s.os.includes(currentOs)) : false,
    };
  });
}

export default function Dashboard({ setRoute, pushToast }: Props) {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const { data: catalog } = useCatalog();
  const { data: installed } = useInstalled();
  const { data: currentOs } = usePlatform();
  const ids = useMemo(() => (catalog ?? []).map(e => e.id), [catalog]);
  const { data: latest = {} } = useLatest(ids);

  const views = useMemo(
    () => buildCliViews(catalog, installed, latest, currentOs ?? ''),
    [catalog, installed, latest, currentOs],
  );
  const installedViews = useMemo(() => views.filter(v => v.installed), [views]);
  const updates = useMemo(
    () => installedViews.filter(v => v.latestVersion && v.currentVersion !== v.latestVersion),
    [installedViews],
  );

  const shown = installedViews.filter(cli => {
    const term = search.trim().toLowerCase();
    return !term ||
      cli.name.toLowerCase().includes(term) ||
      cli.vendor.toLowerCase().includes(term) ||
      cli.tags.some(t => t.includes(term));
  });

  const mutation = useInstallMutation((_event: ProgressEvent) => {});

  const onAction = (op: 'install' | 'upgrade' | 'uninstall' | 'launch', cli: CliView) => {
    if (op === 'launch') { api.launch(cli.id); return; }
    mutation.mutate({ op, id: cli.id }, {
      onSuccess: () => pushToast(`${op === 'install' ? 'Installed' : op === 'upgrade' ? 'Upgraded' : 'Removed'} ${cli.name}`),
      onError: (err) => pushToast(`Error: ${err.message}`),
    });
  };

  const toggleChecked = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="stat-grid">
        <div className="stat">
          <div className="label">Installed</div>
          <div className="value">{installedViews.length}</div>
          <div className="change">of {catalog?.length ?? 0} available</div>
        </div>
        <div className="stat">
          <div className="label">Updates</div>
          <div className="value">{updates.length}</div>
          <div className={`change${updates.length ? ' warn' : ''}`}>
            {updates.length ? `${updates.length} pending` : 'all up to date'}
          </div>
        </div>
        <div className="stat">
          <div className="label">Catalog</div>
          <div className="value">{catalog?.length ?? 0}</div>
          <div className="change">CLIs available</div>
        </div>
      </div>

      <section className="dashboard-manager">
        <div className="section-head">
          <div>
            <h2>Installed CLIs</h2>
            <p>Launch, update, or remove installed tools directly from the dashboard.</p>
          </div>
          <div className="dashboard-manager-actions">
            <input
              className="dashboard-search"
              placeholder="Search installed..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn sm" onClick={() => setRoute('discover')}>Discover more</button>
          </div>
        </div>

        <div className="list dashboard-list">
          {shown.length === 0 && (
            <div className="empty">
              <p>{installedViews.length === 0 ? 'No CLIs installed yet.' : 'No installed CLIs match your search.'}</p>
              {installedViews.length === 0 && (
                <button className="btn primary" onClick={() => setRoute('discover')}>Discover CLIs</button>
              )}
            </div>
          )}
          {shown.map(cli => (
            <ListRow
              key={cli.id}
              cli={cli}
              selected={false}
              checked={checked.has(cli.id)}
              onCheck={toggleChecked}
              onSelect={() => {}}
              onAction={onAction}
              busy={mutation.isPending && mutation.variables?.id === cli.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
