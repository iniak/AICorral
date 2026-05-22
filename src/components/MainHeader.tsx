import type { Route } from '../App';

const TITLES: Record<Route, { h1: string; sub: string }> = {
  dashboard: { h1: 'Dashboard',  sub: 'Overview of your AI coding CLIs' },
  installed: { h1: 'Installed',  sub: 'Manage installed CLIs' },
  discover:  { h1: 'Discover',   sub: 'Browse and install new CLIs' },
  doctor:    { h1: 'Doctor',     sub: 'System environment checks' },
  settings:  { h1: 'Settings',   sub: 'Configuration and preferences' },
};

interface Props { route: Route; }

export default function MainHeader({ route }: Props) {
  const { h1, sub } = TITLES[route];
  return (
    <div className="toolbar">
      <div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{h1}</h1>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{sub}</p>
      </div>
    </div>
  );
}
