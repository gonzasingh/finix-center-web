import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/dashboard/ui';
import Landing from './pages/Landing';
import Login from './pages/Login';

const Portal = lazy(() => import('./pages/portal/Portal'));
const Panel = lazy(() => import('./pages/panel/Panel'));

const Loading = () => <div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8" /></div>;

function Protected({ role, children }) {
  const { loading, user } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'colaborador' ? '/panel' : '/portal'} replace />;
  return children;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ingresar" element={<Login />} />
          <Route path="/portal" element={<Protected role="socio"><Portal /></Protected>} />
          <Route path="/panel" element={<Protected role="colaborador"><Panel /></Protected>} />
          <Route path="*" element={<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center"><h1 className="text-6xl font-bold text-gold-grad">404</h1><p className="text-muted">No encontramos esa página.</p><Link to="/" className="btn-gold">Volver al inicio</Link></div>} />
        </Routes>
      </Suspense>
    </>
  );
}
