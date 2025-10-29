import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './global';
import { restoreSession } from './global/authSlice';

const APP_MODE = import.meta.env.VITE_APP_MODE as 'store' | 'dashboard';

// const App = lazy(() => import(`./${APP_MODE}/App`));
const apps = {
  store: () => import('./store/App'),
  dashboard: () => import('./dashboard/App'),
};

const App = lazy(apps[APP_MODE]);

// const App = lazy(() => import(`./store/App`))
// const App = lazy(() => import(`./dashboard/App`))
function AppWrapper() {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      try {
        await store.dispatch(restoreSession()).unwrap();
      } catch {
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    const { token, user } = store.getState().auth;
    if (token && user && APP_MODE === 'dashboard' && user.role !== 'Admin') {
      window.location.href = '/store';
    }
  }, [sessionReady]);

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/60">Preparando tu sesion...</p>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                {APP_MODE === 'store'
                  ? 'Cargando tienda...'
                  : 'Cargando dashboard...'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {APP_MODE === 'store'
                  ? '🌽 La Cazuela Chapina'
                  : '📊 Panel de Administración'}
              </p>
            </div>
          </div>
        }
      >
        <AppWrapper />
      </Suspense>
    </Provider>
  </StrictMode>
);
