import type { ReactNode } from 'react';
import type { Route } from '../App';

const icons = {
  home:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  compass:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  doctor:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  settings:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

interface Props { route: Route; setRoute: (r: Route) => void; }

export default function Sidebar({ route, setRoute }: Props) {
  const nav: Array<{ id: Route; label: string; icon: ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.home },
    { id: 'discover',  label: 'Discover',   icon: icons.compass },
  ];
  const tools: Array<{ id: Route; label: string; icon: ReactNode }> = [
    { id: 'doctor',   label: 'Doctor',   icon: icons.doctor },
    { id: 'settings', label: 'Settings', icon: icons.settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">AICorral</div>
      <div className="nav-section">Workspace</div>
      {nav.map(item => (
        <button key={item.id} className={`nav-item${route === item.id ? ' active' : ''}`} onClick={() => setRoute(item.id)}>
          <span className="ico">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
      <div className="nav-section">Tools</div>
      {tools.map(item => (
        <button key={item.id} className={`nav-item${route === item.id ? ' active' : ''}`} onClick={() => setRoute(item.id)}>
          <span className="ico">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
