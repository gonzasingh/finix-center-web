import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, User, Mail, ShieldCheck, Users } from 'lucide-react';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import Particles from '../components/common/Particles';
import { Spinner } from '../components/dashboard/ui';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../lib/env';
import { waLink } from '../config/business';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  // El acceso de colaboradores (panel de ejemplo) existe solo en el modo demo. En producción ingresan únicamente los socios.
  const [mode, setMode] = useState('socio');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  // Si la sesión venció, la pantalla de ingreso avisa el motivo (lo deja guardado el proveedor de datos).
  const [error, setError] = useState(() => { try { return sessionStorage.getItem('finix_login_notice') || ''; } catch { return ''; } });
  const [busy, setBusy] = useState(false);

  useEffect(() => { try { sessionStorage.removeItem('finix_login_notice'); } catch { /* noop */ } }, []); // el aviso se muestra una sola vez
  useEffect(() => { if (user) nav(user.role === 'colaborador' ? '/panel' : '/portal', { replace: true }); }, [user, nav]);
  const switchMode = (k) => { setMode(k); setError(''); setIdentifier(''); setPassword(''); };

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!identifier.trim() || !password) return setError('Completá todos los campos');
    setBusy(true);
    try { await login(mode, identifier, password); }
    catch (err) { setError(err.message || 'No pudimos iniciar sesión'); setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="aurora" /><Particles count={55} />
        <Link to="/" className="relative flex w-fit items-center gap-2 text-sm text-gold-200/80 hover:text-gold-200"><ArrowLeft className="h-4 w-4" />Volver al sitio</Link>
        <div className="relative text-center"><Logo className="mx-auto h-52 drop-shadow-[0_10px_50px_rgba(226,191,96,.4)]" />
          <h2 className="mx-auto mt-8 max-w-sm text-3xl font-bold leading-tight text-white">Tu crédito, <span className="text-gold-grad">siempre a mano</span></h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light text-gold-100/70">Consultá saldos, cuotas y solicitudes{DEMO ? '. Si sos parte del equipo, gestioná socios y créditos con registro de cada acción.' : ' cuando quieras, desde tu celular o tu computadora.'}</p></div>
        <p className="relative text-xs text-gold-100/50">Conexión cifrada · FINIX Center</p>
      </aside>

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="mb-6 flex items-center justify-between lg:justify-end">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted lg:hidden"><ArrowLeft className="h-4 w-4" />Inicio</Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10">
          <Logo className="mx-auto mb-6 h-24 lg:hidden" />
          <h1 className="text-center text-3xl font-bold">Ingresar</h1>
          <p className="mt-2 text-center text-sm text-muted">{DEMO ? 'Elegí cómo querés acceder' : 'Accedé a tu cuenta de socio'}</p>

          {DEMO && (
            <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl border border-line/20 bg-surface/60 p-1.5" role="tablist">
              {[['socio', 'Soy socio', Users], ['colaborador', 'Soy colaborador', ShieldCheck]].map(([k, l, Icon]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => switchMode(k)} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${mode === k ? 'bg-gold-grad text-ink shadow-gold' : 'text-muted hover:text-fg'}`}><Icon className="h-4 w-4" />{l}</button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className={`card space-y-5 p-6 ${DEMO ? 'mt-5' : 'mt-7'}`} noValidate>
            <div>
              <h2 className="text-center text-xl font-bold">{mode === 'socio' ? 'Mi cuenta' : 'Acceso al sistema'}</h2>
              <p className="mt-1 text-center text-sm text-muted">{mode === 'socio' ? 'Aquí podrás consultar tus créditos, pagos y estado de cuenta.' : 'Gestión de socios, créditos y solicitudes del equipo FINIX.'}</p>
            </div>
            <div>
              <label htmlFor="id" className="label">{mode === 'socio' ? 'Documento' : 'Email'}</label>
              <div className="relative">{mode === 'socio' ? <User className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-muted" /> : <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-muted" />}
                <input id="id" className="input pl-11" inputMode={mode === 'socio' ? 'numeric' : 'email'} autoComplete={mode === 'socio' ? 'username' : 'email'} placeholder={mode === 'socio' ? 'Ingresá tu DNI' : 'nombre@finixcenter.com'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></div>
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
            <p className="text-center text-xs text-muted">{mode === 'socio' ? 'Ingresá con el documento y la contraseña que registraste.' : 'Acceso exclusivo para colaboradores autorizados.'}</p>
          </form>
        </div>
      </main>
    </div>
  );
}
