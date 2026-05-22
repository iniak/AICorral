import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/tauri';
import type { Settings } from '../types';

export default function SettingsScreen() {
  const qc = useQueryClient();
  const { data: saved } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const [form, setForm] = useState<Settings>({ npmRegistry: 'https://registry.npmjs.org', pipIndexUrl: 'https://pypi.org/simple', httpProxy: '' });

  useEffect(() => { if (saved) setForm(saved); }, [saved]);

  const mutation = useMutation({
    mutationFn: api.setSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  const field = (key: keyof Settings, label: string, desc: string) => (
    <div className="settings-row" key={key}>
      <div className="body">
        <div className="title">{label}</div>
        <div className="desc">{desc}</div>
      </div>
      <input className="input-text"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div style={{ overflowY: 'auto' }}>
      <div className="settings-section">
        <h2>Network &amp; Registries</h2>
        {field('npmRegistry', 'npm registry', 'Registry used for npm-distributed CLI installs.')}
        {field('pipIndexUrl', 'pip index URL', 'Index URL for Python-distributed CLIs (Aider).')}
        {field('httpProxy', 'HTTP/HTTPS proxy', 'Proxy for all downloads. Leave empty for direct connection.')}
      </div>
      <div className="settings-section">
        <h2>About</h2>
        <div className="settings-row">
          <div className="body">
            <div className="title">AICorral 0.1.0</div>
            <div className="desc">AI coding CLI manager · Tauri 2 + React</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, padding: '0 0 24px' }}>
        <button className="btn primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
