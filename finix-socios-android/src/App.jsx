import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';
import Login from './pages/Login';

const Portal = lazy(() => import('./pages/portal/Portal'));

const Loading = () => <div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8" /></div>;

function Protected({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/ingresar" replace />;
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
          <Route path="/ingresar" element={<Login />} />
          <Route path="/portal" element={<Protected><Portal /></Protected>} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
