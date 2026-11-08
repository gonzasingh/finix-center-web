import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, User, Mail, ShieldCheck, Users, Info } from 'lucide-react';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import Particles from '../components/common/Particles';
import { Spinner } from '../components/dashboard/ui';
import { useAuth } from '../context/AuthContext';
import { USE_FIREBASE } from '../lib/env';
import { DEMO_SOCIO_DNI, DEMO_SOCIO_PASSWORD, DEMO_STAFF } from '../services/demoData';
import { waLink } from '../config/business';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('socio');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav(user.role === 'colaborador' ? '/panel' : '/portal', { replace: true }); }, [user, nav]);
  useEffect(() => { setError(''); setIdentifier(''); setPassword(''); }, [mode]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!identifier.trim() || !password) return setError('Completá todos los campos');
    setBusy(true);
    try { await login(mode, identifier, password); }
    catch (err) { setError(err.message || 'No pudimos iniciar sesión'); setBusy(false); }
  };
  const fillDemo = () => mode === 'socio' ? (setIdentifier(DEMO_SOCIO_DNI), setPassword(DEMO_SOCIO_PASSWORD)) : (setIdentifier(DEMO_STAFF[0].email), setPassword(DEMO_STAFF[0].password));

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="aurora" /><Particles count={55} />
        <Link to="/" className="relative flex w-fit items-center gap-2 text-sm text-gold-200/80 hover:text-gold-200"><ArrowLeft className="h-4 w-4" />Volver al sitio</Link>
        <div className="relative text-center"><Logo className="mx-auto h-52 drop-shadow-[0_10px_50px_rgba(226,191,96,.4)]" />
          <h2 className="mx-auto mt-8 max-w-sm text-3xl font-bold leading-tight text-white">Tu crédito, <span className="text-gold-grad">siempre a mano</span></h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light text-gold-100/70">Consultá saldos, cuotas y solicitudes. Si sos parte del equipo, gestioná socios y créditos con registro de cada acción.</p></div>
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
          <p className="mt-2 text-center text-sm text-muted">Elegí cómo querés acceder</p>

          <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl border border-line/20 bg-surface/60 p-1.5" role="tablist">
            {[['socio', 'Soy socio', Users], ['colaborador', 'Soy colaborador', ShieldCheck]].map(([k, l, Icon]) => (
              <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${mode === k ? 'bg-gold-grad text-ink shadow-gold' : 'text-muted hover:text-fg'}`}><Icon className="h-4 w-4" />{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="card mt-5 space-y-5 p-6" noValidate>
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

          {!USE_FIREBASE && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line/25 bg-line/5 p-4 text-xs text-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <div className="flex-1"><b className="text-fg">Modo demo.</b> {mode === 'socio' ? <>DNI <code className="text-gold-300">{DEMO_SOCIO_DNI}</code> · clave <code className="text-gold-300">{DEMO_SOCIO_PASSWORD}</code></> : <>{DEMO_STAFF[0].email} · clave <code className="text-gold-300">{DEMO_STAFF[0].password}</code></>}
                <button type="button" onClick={fillDemo} className="ml-2 font-semibold text-gold-300 underline underline-offset-4">Autocompletar</button></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
