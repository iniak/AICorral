import { useState, useCallback, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import DetailDrawer from './components/DetailDrawer';
import { ToastZone } from './components/Toast';
import Dashboard from './screens/Dashboard';
import Installed from './screens/Installed';
import Discover from './screens/Discover';
import Doctor from './screens/Doctor';
import Settings from './screens/Settings';
import { useCatalog } from './hooks/useCatalog';
import { useInstalled } from './hooks/useInstalled';
import { useLatest } from './hooks/useLatest';
import { useInstallMutation } from './hooks/useInstallMutation';
import { api } from './api/tauri';
import type { CliView, ProgressEvent } from './types';

export type Route = 'dashboard' | 'installed' | 'discover' | 'doctor' | 'settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}

function AppInner() {
  const [route, setRoute]   = useState<Route>('dashboard');
  const [selected, setSelected] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; text: string }>>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { lines: string[]; done: boolean; success: boolean }>>({});

  const { data: catalog } = useCatalog();
  const { data: installed } = useInstalled();
  const ids = catalog?.map(e => e.id) ?? [];
  const { data: latest = {} } = useLatest(ids);

  const views = useMemo<CliView[]>(() => {
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
        availableOnOs: entry.sources.some(s => s.os.includes('windows')),
      };
    });
  }, [catalog, installed, latest]);

  const selectedView = selected ? views.find(v => v.id === selected) ?? null : null;

  const mutation = useInstallMutation((event: ProgressEvent) => {
    setProgressMap(prev => {
      const existing = prev[event.id] ?? { lines: [], done: false, success: false };
      if (event.phase === 'done')  return { ...prev, [event.id]: { ...existing, done: true, success: true } };
      if (event.phase === 'error') return { ...prev, [event.id]: { ...existing, done: true, success: false } };
      return { ...prev, [event.id]: { ...existing, lines: [...existing.lines, event.line] } };
    });
  });

  const onAction = useCallback((op: 'install' | 'upgrade' | 'uninstall' | 'launch', cli: CliView) => {
    if (op === 'launch') { api.launch(cli.id); return; }
    setProgressMap(prev => ({ ...prev, [cli.id]: { lines: [], done: false, success: false } }));
    mutation.mutate({ op, id: cli.id });
  }, [mutation]);

  const pushToast = useCallback((text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const navigate = (r: Route) => { setRoute(r); setSelected(null); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app${selected && selectedView ? ' with-drawer' : ''}`}>
      <Sidebar route={route} setRoute={navigate} />
      <main className="main">
        <MainHeader route={route} />
        <div className="main-body">
          {route === 'dashboard' && <Dashboard selected={selected} setSelected={setSelected} setRoute={setRoute} pushToast={pushToast} />}
          {route === 'installed' && <Installed selected={selected} setSelected={setSelected} pushToast={pushToast} />}
          {route === 'discover'  && <Discover  selected={selected} setSelected={setSelected} pushToast={pushToast} />}
          {route === 'doctor'    && <Doctor />}
          {route === 'settings'  && <Settings />}
        </div>
      </main>
      {selected && selectedView && (
        <DetailDrawer
          cli={selectedView}
          busy={mutation.isPending && mutation.variables?.id === selected}
          lines={progressMap[selected]?.lines ?? []}
          progressDone={progressMap[selected]?.done ?? false}
          progressSuccess={progressMap[selected]?.success ?? false}
          onClose={() => setSelected(null)}
          onAction={onAction}
        />
      )}
      <ToastZone toasts={toasts} />
    </div>
  );
}
