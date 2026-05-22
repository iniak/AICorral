import { useQueryClient } from '@tanstack/react-query';
import { useDoctor } from '../hooks/useDoctor';

export default function Doctor() {
  const qc = useQueryClient();
  const { data: checks, isLoading } = useDoctor();

  const ok   = checks?.filter(c => c.status === 'ok').length ?? 0;
  const warn = checks?.filter(c => c.status === 'warn').length ?? 0;
  const fail = checks?.filter(c => c.status === 'fail').length ?? 0;

  const dotColor = (status: string) => {
    if (status === 'ok')   return 'var(--ok)';
    if (status === 'warn') return 'var(--warn)';
    if (status === 'fail') return 'var(--danger)';
    return 'var(--ink-4)';
  };

  return (
    <div style={{ overflowY: 'auto' }}>
      <div className="stat-grid">
        <div className="stat"><div className="label">Healthy</div><div className="value" style={{ color: 'var(--ok)' }}>{ok}</div><div className="change">passing checks</div></div>
        <div className="stat"><div className="label">Attention</div><div className="value" style={{ color: 'var(--warn)' }}>{warn}</div><div className={`change${warn ? ' warn' : ''}`}>{warn ? 'soft warnings' : 'none'}</div></div>
        <div className="stat"><div className="label">Failing</div><div className="value" style={{ color: fail ? 'var(--danger)' : 'var(--ink)' }}>{fail}</div><div className="change">{fail ? 'blocking issues' : 'no issues'}</div></div>
      </div>
      <div className="section-head">
        <h2>System checks</h2>
        <button className="btn sm" onClick={() => qc.invalidateQueries({ queryKey: ['doctor'] })}>↺ Re-run</button>
      </div>
      {isLoading && <div className="empty"><p>Running checks…</p></div>}
      <div className="list">
        {(checks ?? []).map((c, i) => (
          <div key={i} className="list-row" style={{ gridTemplateColumns: '14px 1fr' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor(c.status), display: 'inline-block', marginTop: 3, flexShrink: 0 }} />
            <div>
              <div className="name">{c.name}</div>
              <div className="desc" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
