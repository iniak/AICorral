interface Props {
  mode: 'install' | 'upgrade' | 'uninstall';
  lines: string[];
  done: boolean;
  success: boolean;
}

export default function InstallProgress({ mode, lines, done, success }: Props) {
  const label = mode === 'install' ? 'Installing' : mode === 'upgrade' ? 'Upgrading' : 'Uninstalling';
  return (
    <div className="progress-card">
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{label}…</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-2)',
                    maxHeight: 140, overflowY: 'auto', lineHeight: 1.6 }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
        {!done && <div style={{ opacity: 0.5 }}>▋</div>}
      </div>
      <div className="progress-bar" style={{ marginTop: 10 }}>
        <i style={{
          display: 'block', height: '100%',
          width: done ? '100%' : '60%',
          background: done && !success ? 'var(--danger)' : 'var(--accent)',
          transition: done ? 'width .3s' : 'none',
          borderRadius: 4,
        }} />
      </div>
    </div>
  );
}
