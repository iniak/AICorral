import CliIcon from './CliIcon';
import type { CliView } from '../types';

interface Props {
  cli: CliView;
  selected: boolean;
  checked: boolean;
  onCheck: (id: string) => void;
  onSelect: (id: string) => void;
  onAction: (op: 'install' | 'upgrade' | 'uninstall' | 'launch', cli: CliView) => void;
  busy: boolean;
  showCheck?: boolean;
}

export default function ListRow({ cli, selected, checked, onCheck, onSelect, onAction, busy, showCheck = true }: Props) {
  const updateAvailable = cli.installed && cli.currentVersion && cli.latestVersion && cli.currentVersion !== cli.latestVersion;

  return (
    <div className={`list-row${selected ? ' selected' : ''}${showCheck ? '' : ' no-check'}`} onClick={() => onSelect(cli.id)}>
      {showCheck && <input type="checkbox" checked={checked} onClick={e => e.stopPropagation()} onChange={() => onCheck(cli.id)} />}
      <CliIcon id={cli.id} mono={cli.mono} hue={cli.hue} size="sm" />
      <div className="name">{cli.name}</div>
      <div className="desc" style={{ color: 'var(--ink-3)', fontSize: 12 }}>{cli.vendor}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {cli.currentVersion && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{cli.currentVersion}</span>}
        {updateAvailable && <span className="pill warn" style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--warn-soft)', color: 'var(--warn)' }}>Update</span>}
      </div>
      <div className="actions" onClick={e => e.stopPropagation()}>
        {busy ? (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>…</span>
        ) : cli.installed ? (
          <>
            <button className="btn sm" onClick={() => onAction('launch', cli)}>Launch</button>
            {updateAvailable && <button className="btn sm" onClick={() => onAction('upgrade', cli)}>Upgrade</button>}
            <button className="btn sm danger" onClick={() => onAction('uninstall', cli)}>Remove</button>
          </>
        ) : cli.availableOnOs ? (
          <button className="btn sm primary" onClick={() => onAction('install', cli)}>Install</button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Not available</span>
        )}
      </div>
    </div>
  );
}
