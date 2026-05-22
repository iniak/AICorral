import type { ReactNode } from 'react';

interface Props {
  title: string;
  desc?: string;
  footer: ReactNode;
  onClose: () => void;
  children?: ReactNode;
}

export default function Modal({ title, desc, footer, onClose, children }: Props) {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        <div className="modal-head">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
            {desc && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{desc}</div>}
          </div>
          <button className="btn sm" onClick={onClose}>✕</button>
        </div>
        {children && <div style={{ padding: '0 20px 16px' }}>{children}</div>}
        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
          {footer}
        </div>
      </div>
    </>
  );
}
