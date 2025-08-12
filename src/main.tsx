import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from "react-redux"
import { store } from './global'
import { restoreSession } from './global/authSlice'

const APP_MODE = import.meta.env.VITE_APP_MODE as 'store' | 'dashboard'

const App = lazy(() => import(`./${APP_MODE}/App`))

function AppWrapper() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(restoreSession());
    }
  }, []);

  useEffect(() => {
    const token = store.getState().auth.token;
    const user = store.getState().auth.user;
    
    if (token && user) {
      if (APP_MODE === 'dashboard' && user.role !== 'Admin') {
        window.location.href = '/store';
        return;
      }
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              {APP_MODE === 'store' ? 'Cargando tienda...' : 'Cargando dashboard...'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {APP_MODE === 'store' ? '🌽 La Cazuela Chapina' : '📊 Panel de Administración'}
            </p>
          </div>
        </div>
      }>
        <AppWrapper />
      </Suspense>
    </Provider>
  </StrictMode>,
)
