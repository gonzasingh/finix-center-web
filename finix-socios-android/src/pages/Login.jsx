import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Info } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import Particles from '../components/Particles';
import { Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { DEMO, DEMO_SOCIO_DNI, DEMO_SOCIO_PASSWORD } from '../lib/env';
import { waLink } from '../config/business';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(() => { try { const m = sessionStorage.getItem('finix_login_notice') || ''; sessionStorage.removeItem('finix_login_notice'); return m; } catch { return ''; } });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav('/portal', { replace: true }); }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!identifier.trim() || !password) return setError('Completá todos los campos');
    setBusy(true);
    try { await login(identifier, password); }
    catch (err) { setError(err.message || 'No pudimos iniciar sesión'); setBusy(false); }
  };
  const fillDemo = () => { setIdentifier(DEMO_SOCIO_DNI); setPassword(DEMO_SOCIO_PASSWORD); };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="aurora" /><Particles count={55} />
        <span />
        <div className="relative text-center"><Logo className="mx-auto h-52 drop-shadow-[0_10px_50px_rgba(226,191,96,.4)]" />
          <h2 className="mx-auto mt-8 max-w-sm text-3xl font-bold leading-tight text-white">Tu crédito, <span className="text-gold-grad">siempre a mano</span></h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light text-gold-100/70">Consultá saldos, cuotas y solicitudes desde tu celular.</p></div>
        <p className="relative text-xs text-gold-100/50">Conexión cifrada · FINIX Center</p>
      </aside>

      <main className="safe-y relative flex flex-col px-5 sm:px-10">
        <div className="mb-6 flex items-center justify-end">
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10">
          <Logo className="mx-auto mb-6 h-24 lg:hidden" />
          <h1 className="text-center text-3xl font-bold">Ingresar</h1>
          <p className="mt-2 text-center text-sm text-muted">Accedé a tu cuenta de socio</p>

          <form onSubmit={submit} className="card mt-7 space-y-5 p-6" noValidate>
            <div>
              <h2 className="text-center text-xl font-bold">Mi cuenta</h2>
              <p className="mt-1 text-center text-sm text-muted">Aquí podrás consultar tus créditos, pagos y estado de cuenta.</p>
            </div>
            <div>
              <label htmlFor="id" className="label">Documento</label>
              <div className="relative"><User className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-muted" />
                <input id="id" className="input pl-11" inputMode="numeric" autoComplete="username" placeholder="Ingresá tu DNI" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></div>
            </div>
            <div>
              <label htmlFor="pw" className="label">Contraseña</label>
              <div className="relative"><Lock className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-muted" />
                <input id="pw" type={show ? 'text' : 'password'} className="input pl-11 pr-12" autoComplete="current-password" placeholder="Ingresá tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-3 text-muted hover:text-fg">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
              <a href={waLink('Hola FINIX Center, olvidé mi contraseña de acceso.')} target="_blank" rel="noreferrer" className="mt-3 block text-center text-sm font-medium text-gold-300 underline underline-offset-4">¿Olvidaste tu contraseña?</a>
            </div>
            {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">{error}</p>}
            <button className="btn-gold w-full py-3.5 text-base" disabled={busy}>{busy ? <Spinner className="h-5 w-5 !text-ink" /> : 'Ingresar'}</button>
            <p className="text-center text-xs text-muted">Ingresá con el documento y la contraseña que registraste.</p>
          </form>

          {DEMO && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line/25 bg-line/5 p-4 text-xs text-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <div className="flex-1"><b className="text-fg">Modo demo.</b> DNI <code className="text-gold-300">{DEMO_SOCIO_DNI}</code> · clave <code className="text-gold-300">{DEMO_SOCIO_PASSWORD}</code>
                <button type="button" onClick={fillDemo} className="ml-2 font-semibold text-gold-300 underline underline-offset-4">Autocompletar</button></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
