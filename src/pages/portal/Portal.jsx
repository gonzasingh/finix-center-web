import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home, Wallet, MessageSquareText, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import { Skeleton, ErrorBox } from '../../components/dashboard/ui';
import { HomeView, CreditsView, StatementView, SimulatorView, RequestsView, RequestDetailView, NoticesView, ProfileView, RequirementsView, BranchesView, SupportView, AboutView, buildNotices } from './views';

const NAV = [['home', Home, 'Inicio'], ['creditos', Wallet, 'Créditos'], ['solicitudes', MessageSquareText, 'Solicitudes'], ['avisos', Bell, 'Avisos'], ['perfil', User, 'Perfil']];
const GROUP = { estado: 'creditos', solicitud: 'solicitudes', simulador: 'solicitudes' };

export default function Portal() {
  const { user, logout } = useAuth();
  const toast = useToast().push;
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [stack, setStack] = useState([{ view: 'home' }]);
  const [read, setRead] = useState(new Set());
  const cur = stack[stack.length - 1];

  const load = useCallback(() => api.getSocioOverview(user).then(setData).catch(() => setError('No pudimos cargar tu información. Intentá nuevamente.')), [user]);
  useEffect(() => { load(); }, [load]);

  const go = (view, param) => { setStack((s) => [...s, { view, param }]); window.scrollTo({ top: 0 }); };
  const tab = (view) => { setStack([{ view }]); window.scrollTo({ top: 0 }); };
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : [{ view: 'home' }]));

  const notices = useMemo(() => (data ? buildNotices(data) : []), [data]);
  const unread = notices.filter((n) => n.unread && !read.has(n.id)).length;
  const active = GROUP[cur.view] || cur.view;

  const submitRequest = async (payload) => {
    try { await api.createRequest(user, payload); toast('¡Solicitud enviada! Podés seguirla en “Mis solicitudes”.'); await load(); setStack([{ view: 'home' }, { view: 'solicitudes' }]); }
    catch { toast('No pudimos enviar la solicitud. Intentá de nuevo.', 'error'); }
  };
  const doLogout = async () => { await logout(); nav('/ingresar', { replace: true }); };

  const render = () => {
    if (error) return <ErrorBox text={error} />;
    if (!data) return <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>;
    const p = { data, go, back, user };
    switch (cur.view) {
      case 'home': return <HomeView {...p} unread={unread} />;
      case 'creditos': return <CreditsView {...p} />;
      case 'estado': return <StatementView {...p} creditId={cur.param} />;
      case 'simulador': return <SimulatorView back={back} onSubmit={submitRequest} />;
      case 'solicitudes': return <RequestsView {...p} />;
      case 'solicitud': return <RequestDetailView {...p} id={cur.param} />;
      case 'avisos': return <NoticesView notices={notices} read={read} onRead={() => setRead(new Set(notices.map((n) => n.id)))} back={back} />;
      case 'perfil': return <ProfileView {...p} onLogout={doLogout} />;
      case 'requisitos': return <RequirementsView back={back} />;
      case 'sucursales': return <BranchesView back={back} />;
      case 'atencion': return <SupportView back={back} />;
      case 'nosotros': return <AboutView back={back} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-10">
      <header className="sticky top-0 z-40 border-b border-line/15 bg-base/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={() => tab('home')} aria-label="Inicio"><Logo className="h-12" /></button>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Portal">
            {NAV.map(([k, Icon, l]) => <button key={k} onClick={() => tab(k)} className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active === k ? 'bg-line/15 text-fg' : 'text-muted hover:text-fg'}`}><Icon className="h-4 w-4" />{l}{k === 'avisos' && unread > 0 && <span className="h-2 w-2 rounded-full bg-rose-500" />}</button>)}
          </nav>
          <div className="flex items-center gap-2"><span className="hidden text-sm text-muted sm:block">{user.displayName.split(' ')[0]}</span><ThemeToggle /></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{render()}</main>
      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-line/25 bg-base/85 p-1.5 shadow-glass backdrop-blur-2xl lg:hidden" aria-label="Portal">
        <ul className="grid grid-cols-5">{NAV.map(([k, Icon, l]) => <li key={k}><button onClick={() => tab(k)} className={`relative flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition ${active === k ? 'bg-gold-grad text-ink' : 'text-muted'}`}><Icon className="h-5 w-5" />{l}{k === 'avisos' && unread > 0 && <span className="absolute right-4 top-1.5 h-2 w-2 rounded-full bg-rose-500" />}</button></li>)}</ul>
      </nav>
    </div>
  );
}
