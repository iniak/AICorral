import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import { ToastZone } from './components/Toast';
import Dashboard from './screens/Dashboard';
import Discover from './screens/Discover';
import Doctor from './screens/Doctor';
import Settings from './screens/Settings';

export type Route = 'dashboard' | 'discover' | 'doctor' | 'settings';

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
  const [toasts, setToasts] = useState<Array<{ id: string; text: string }>>([]);

  const pushToast = useCallback((text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <main className="main">
        <MainHeader route={route} />
        <div className="main-body">
          {route === 'dashboard' && <Dashboard setRoute={setRoute} pushToast={pushToast} />}
          {route === 'discover'  && <Discover pushToast={pushToast} />}
          {route === 'doctor'    && <Doctor />}
          {route === 'settings'  && <Settings />}
        </div>
      </main>
      <ToastZone toasts={toasts} />
    </div>
  );
}
