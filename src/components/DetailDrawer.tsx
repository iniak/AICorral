import { useState } from 'react';
import Monogram from './Monogram';
import InstallProgress from './InstallProgress';
import type { CliView } from '../types';

interface Props {
  cli: CliView;
  busy: boolean;
  lines: string[];
  progressDone: boolean;
  progressSuccess: boolean;
  onClose: () => void;
  onAction: (op: 'install' | 'upgrade' | 'uninstall' | 'launch', cli: CliView) => void;
}

type Tab = 'overview' | 'versions';

export default function DetailDrawer({ cli, busy, lines, progressDone, progressSuccess, onClose, onAction }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const updateAvailable = cli.installed && cli.currentVersion && cli.latestVersion && cli.currentVersion !== cli.latestVersion;

  return (
    <aside className="drawer">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Monogram mono={cli.mono} hue={cli.hue} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{cli.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{cli.vendor}</div>
          </div>
        </div>
        <button className="btn sm" onClick={onClose}>✕</button>
      </div>

      <div className="dtabs">
        {(['overview', 'versions'] as Tab[]).map(t => (
          <button key={t} className={`dtab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
        {lines.length > 0 && (
          <InstallProgress mode={busy ? 'install' : 'install'} lines={lines} done={progressDone} success={progressSuccess} />
        )}

        {tab === 'overview' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 0 }}>{cli.description}</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><span style={{ color: 'var(--ink-3)' }}>Runtime: </span>{cli.runtime}</div>
              <div><span style={{ color: 'var(--ink-3)' }}>Command: </span><code style={{ fontFamily: 'var(--font-mono)' }}>{cli.launchCmd}</code></div>
              {cli.binaryPath && <div><span style={{ color: 'var(--ink-3)' }}>Path: </span><code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{cli.binaryPath}</code></div>}
              {cli.installedAt && <div><span style={{ color: 'var(--ink-3)' }}>Installed: </span>{cli.installedAt}</div>}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cli.installed ? (
                <>
                  <button className="btn sm primary" onClick={() => onAction('launch', cli)}>Launch</button>
                  {updateAvailable && <button className="btn sm" onClick={() => onAction('upgrade', cli)}>Upgrade to {cli.latestVersion}</button>}
                  <button className="btn sm danger" onClick={() => onAction('uninstall', cli)}>Uninstall</button>
                </>
              ) : cli.availableOnOs ? (
                <button className="btn sm primary" onClick={() => onAction('install', cli)}>Install</button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Not available on this OS</span>
              )}
            </div>
          </div>
        )}

        {tab === 'versions' && (
          <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cli.currentVersion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{cli.currentVersion}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--ok-soft)', color: 'var(--ok)', fontSize: 10 }}>installed</span>
              </div>
            )}
            {cli.latestVersion && cli.latestVersion !== cli.currentVersion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{cli.latestVersion}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10 }}>latest</span>
              </div>
            )}
            {!cli.currentVersion && !cli.latestVersion && (
              <div style={{ color: 'var(--ink-3)' }}>No version information available.</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
