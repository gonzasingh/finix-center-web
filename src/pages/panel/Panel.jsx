import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, FileCheck2, ScrollText, LogOut, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services';
import { USE_FIREBASE } from '../../lib/env';
import { initials } from '../../lib/format';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import { Skeleton, ErrorBox } from '../../components/dashboard/ui';
import Overview from './Overview';
import ClientsSection from './ClientsSection';
import CreditsSection from './CreditsSection';
import RequestsSection from './RequestsSection';
import AuditSection from './AuditSection';

const SECTIONS = [['resumen', LayoutDashboard, 'Resumen'], ['socios', Users, 'Socios'], ['creditos', Wallet, 'Créditos'], ['solicitudes', FileCheck2, 'Solicitudes'], ['auditoria', ScrollText, 'Auditoría']];

export default function Panel() {
  const { user, logout } = useAuth();
  const toast = useToast().push;
  const nav = useNavigate();
  const [section, setSection] = useState('resumen');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [clients, credits, requests, audit] = await Promise.all([api.listClients(), api.listCredits(), api.listRequests(), api.listAudit()]);
      setData({ clients, credits, requests, audit }); setError('');
    } catch (e) { setError('No pudimos cargar los datos. Verificá tu conexión y permisos.'); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const pending = useMemo(() => data?.requests.filter((r) => !['aprobada', 'rechazada'].includes(r.estado)).length ?? 0, [data]);
  const ctx = { ...data, actor: user, refresh, toast, go: setSection };
  const doLogout = async () => { await logout(); nav('/ingresar', { replace: true }); };
  const reset = async () => { await api.resetDemo(); await refresh(); toast('Datos de demostración restablecidos'); };

  const body = () => {
    if (error) return <ErrorBox text={error} />;
    if (!data) return <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-80" /></div>;
    return { resumen: <Overview {...ctx} />, socios: <ClientsSection {...ctx} />, creditos: <CreditsSection {...ctx} />, solicitudes: <RequestsSection {...ctx} />, auditoria: <AuditSection {...ctx} /> }[section];
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-line/15 bg-surface/50 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5">
        <Logo className="mx-auto mb-2 h-24" />
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[.2em] text-gold-300">Panel de gestión</p>
        <nav className="flex-1 space-y-1" aria-label="Panel">
          {SECTIONS.map(([k, Icon, l]) => <button key={k} onClick={() => setSection(k)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${section === k ? 'bg-gold-grad text-ink shadow-gold' : 'text-muted hover:bg-line/10 hover:text-fg'}`}><Icon className="h-[18px] w-[18px]" />{l}{k === 'solicitudes' && pending > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${section === k ? 'bg-ink/20' : 'bg-gold-400/20 text-gold-300'}`}>{pending}</span>}</button>)}
        </nav>
        {!USE_FIREBASE && <button onClick={reset} className="btn-ghost btn-sm mb-3 justify-start"><RotateCcw className="h-4 w-4" />Restablecer demo</button>}
        <div className="card-flat flex items-center gap-3 p-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-grad text-sm font-bold text-ink">{initials(user.displayName)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.displayName}</p><p className="truncate text-[11px] text-muted">Colaborador</p></div><ThemeToggle className="!h-9 !w-9" /></div>
        <button onClick={doLogout} className="btn-ghost mt-2 justify-start text-rose-400"><LogOut className="h-4 w-4" />Cerrar sesión</button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line/15 bg-base/85 backdrop-blur-2xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-2"><Logo className="h-12" /><div className="flex items-center gap-2"><ThemeToggle /><button onClick={doLogout} aria-label="Cerrar sesión" className="flex h-10 w-10 items-center justify-center rounded-full border border-line/30 text-rose-400"><LogOut className="h-[18px] w-[18px]" /></button></div></div>
          <nav className="flex gap-1.5 overflow-x-auto px-3 pb-2" aria-label="Panel">{SECTIONS.map(([k, Icon, l]) => <button key={k} onClick={() => setSection(k)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ${section === k ? 'bg-gold-grad text-ink' : 'bg-line/10 text-muted'}`}><Icon className="h-4 w-4" />{l}</button>)}</nav>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8 sm:py-8">{body()}</main>
      </div>
    </div>
  );
}
