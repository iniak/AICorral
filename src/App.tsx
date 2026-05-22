import { useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import { ToastZone } from './components/Toast';
import Dashboard from './screens/Dashboard';
import Installed from './screens/Installed';
import Discover from './screens/Discover';
import Doctor from './screens/Doctor';
import Settings from './screens/Settings';

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
    <div className={`app${selected ? ' with-drawer' : ''}`}>
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
      <ToastZone toasts={toasts} />
    </div>
  );
}
