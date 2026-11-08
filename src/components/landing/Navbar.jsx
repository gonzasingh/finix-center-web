import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, UserCircle2, MessageCircle } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import { BUSINESS, waLink } from '../../config/business';
import { scrollToId } from '../../lib/scroll';

const LINKS = [['simulador', 'Simulador'], ['beneficios', 'Beneficios'], ['como-funciona', 'Cómo funciona'], ['app', 'App socios'], ['nosotros', 'Nosotros'], ['cotizacion', 'Dólar']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const go = (id) => { setOpen(false); setTimeout(() => scrollToId(id), 60); };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <div className={`w-full max-w-6xl rounded-[28px] border transition-all duration-500 ${scrolled || open ? 'border-line/25 bg-base/75 shadow-glass backdrop-blur-2xl' : 'border-transparent bg-transparent'}`}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="FINIX Center - Inicio"><Logo className="h-14" /></button>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {LINKS.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="rounded-full px-3.5 py-2 text-[13px] font-medium text-muted transition hover:bg-line/10 hover:text-fg">{label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <a href={waLink()} target="_blank" rel="noreferrer" className="btn-outline btn-sm hidden md:inline-flex"><MessageCircle className="h-4 w-4" />WhatsApp</a>
            <Link to="/ingresar" className="btn-gold btn-sm"><UserCircle2 className="h-4 w-4" />Ingresar</Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line/30 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menú" aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="anim-pop border-t border-line/15 px-4 pb-5 pt-3 lg:hidden">
            <div className="grid gap-1">
              {LINKS.map(([id, label]) => <button key={id} onClick={() => go(id)} className="rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-line/10">{label}</button>)}
            </div>
            <div className="mt-3 flex gap-2">
              <ThemeToggle />
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn-outline flex-1"><MessageCircle className="h-4 w-4" />Escribinos por WhatsApp</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
