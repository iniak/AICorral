import { useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { useInstalled } from '../hooks/useInstalled';
import { useLatest } from '../hooks/useLatest';
import CliIcon from '../components/CliIcon';
import type { Route } from '../App';

interface Props {
  selected: string | null;
  setSelected: (id: string | null) => void;
  setRoute: (r: Route) => void;
  pushToast: (msg: string) => void;
}

export default function Dashboard({ setSelected, setRoute }: Props) {
  const { data: catalog } = useCatalog();
  const { data: installed } = useInstalled();
  const ids = catalog?.map(e => e.id) ?? [];
  const { data: latest = {} } = useLatest(ids);

  const instMap = useMemo(() => Object.fromEntries((installed ?? []).map(s => [s.id, s])), [installed]);
  const installedEntries = useMemo(() => (catalog ?? []).filter(e => instMap[e.id]?.installed), [catalog, instMap]);
  const updates = useMemo(() => installedEntries.filter(e => latest[e.id] && instMap[e.id]?.currentVersion !== latest[e.id]), [installedEntries, latest, instMap]);

  return (
    <div style={{ overflowY: 'auto' }}>
      <div className="stat-grid">
        <div className="stat">
          <div className="label">Installed</div>
          <div className="value">{installedEntries.length}</div>
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

      {updates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-head">
            <h2>Updates available</h2>
            <button className="btn sm" onClick={() => setRoute('installed')}>View all</button>
          </div>
          <div className="list">
            {updates.slice(0, 3).map(e => (
              <div key={e.id} className="list-row" style={{ gridTemplateColumns: '32px 1fr auto', cursor: 'pointer' }}
                onClick={() => { setRoute('installed'); setSelected(e.id); }}>
                <CliIcon id={e.id} mono={e.mono} hue={e.hue} size="sm" />
                <div>
                  <div className="name">{e.name}</div>
                  <div className="desc" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{instMap[e.id]?.currentVersion} → {latest[e.id]}</div>
                </div>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--warn-soft)', color: 'var(--warn)' }}>Update</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {installedEntries.length > 0 && (
        <div>
          <div className="section-head"><h2>Recently detected</h2></div>
          <div className="list">
            {installedEntries.slice(0, 3).map(e => (
              <div key={e.id} className="list-row" style={{ gridTemplateColumns: '32px 1fr auto', cursor: 'pointer' }}
                onClick={() => { setRoute('installed'); setSelected(e.id); }}>
                <CliIcon id={e.id} mono={e.mono} hue={e.hue} size="sm" />
                <div>
                  <div className="name">{e.name}</div>
                  <div className="desc" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{instMap[e.id]?.currentVersion ?? 'unknown version'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {installedEntries.length === 0 && (
        <div className="empty">
          <p>No CLIs installed yet.</p>
          <button className="btn primary" onClick={() => setRoute('discover')}>Discover CLIs</button>
        </div>
      )}
    </div>
  );
}
