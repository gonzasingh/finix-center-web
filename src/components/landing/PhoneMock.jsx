import { Home, Wallet, FileText, Calculator, MessageSquareText, ClipboardCheck, MapPin, Landmark, Headphones, CalendarDays, Bell, User, Moon, BadgePercent } from 'lucide-react';
import Logo from '../common/Logo';
import CardEmblem from '../portal/CardEmblem';
import { BUSINESS } from '../../config/business';

const SHORTCUTS = [[Wallet, 'Mis créditos'], [FileText, 'Estado de cuenta'], [Calculator, 'Simulá tu crédito'], [MessageSquareText, 'Mis solicitudes'], [ClipboardCheck, 'Requisitos'], [MapPin, 'Sucursales'], [Landmark, 'Quienes somos'], [Headphones, 'Atención']];
const NAV = [[Home, 'Inicio'], [Wallet, 'Créditos'], [MessageSquareText, 'Solicitudes'], [Bell, 'Avisos'], [User, 'Perfil']];

// Maqueta de la pantalla de Inicio de la App FINIX (tema claro, datos de ejemplo). Replica el diseño actual de la app:
// encabezado con el logo, tarjeta dorada con el emblema, atajos, próximo vencimiento, carrusel de novedades y barra inferior.
export default function PhoneMock() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="relative h-[700px] w-[300px] overflow-hidden rounded-[44px] border-[7px] border-[#1d1812] bg-[#F7F6F2] text-[#1C160E] shadow-[0_40px_80px_-20px_rgba(226,191,96,.45)] sm:w-[320px]">
        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold text-[#444]"><span>9:41</span><span className="h-4 w-16 rounded-full bg-[#1d1812]" /><span>●●●</span></div>

        {/* Encabezado de la app: solo el logo, centrado */}
        <div className="mt-1 flex h-11 items-center justify-center border-b border-[#B08B3C]/15"><Logo className="h-7" /></div>

        <div className="px-3.5 pt-3">
          {/* Tarjeta de saldo */}
          <div className="relative overflow-hidden rounded-xl px-3.5 py-3 text-white shadow-[0_10px_24px_-8px_rgba(226,191,96,.6)]" style={{ backgroundImage: 'linear-gradient(132deg, #8D6E2D 3%, #DDB85F 90%)' }}>
            <CardEmblem />
            <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/25"><Moon className="h-3.5 w-3.5" /></span>
            <div className="relative">
              <p className="text-[10px] opacity-90">Buenos días</p>
              <p className="pr-9 text-[15px] font-bold leading-tight">Mateo E. Gomez</p>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="text-[9px] opacity-80">DNI 38492615</p>
                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-[8px] font-semibold"><span className="h-1 w-1 rounded-full bg-current" />Crédito activo</span>
              </div>
            </div>
            <div className="relative mt-2 border-t border-white/25 pt-2"><p className="text-[10px] font-medium opacity-90">Saldo pendiente</p><p className="text-[22px] font-extrabold leading-tight tracking-tight">$2.760.002,00</p></div>
          </div>

          {/* Atajos */}
          <p className="mb-1.5 mt-3.5 text-[11px] font-bold">Tus atajos</p>
          <div className="grid grid-cols-4 gap-1.5">
            {SHORTCUTS.map(([Icon, label]) => (
              <div key={label} className="flex aspect-[1/1.02] flex-col items-center justify-center gap-1 rounded-xl bg-[#F3ECDA]/90 px-0.5 text-center"><Icon className="h-4 w-4 text-gold-400" /><span className="text-[7px] font-semibold leading-tight">{label}</span></div>
            ))}
          </div>

          {/* Avisos */}
          <p className="mb-1.5 mt-3.5 text-[11px] font-bold">Avisos</p>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#B08B3C]/15 bg-white/70 px-2.5 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B08B3C]/10"><CalendarDays className="h-4 w-4 text-gold-400" /></span>
            <div className="flex-1"><p className="text-[8px] text-[#625A4C]">Próxima cuota</p><p className="text-[13px] font-bold leading-tight">$197.143,00</p></div>
            <div className="text-right"><span className="inline-block rounded-full border border-[#B08B3C]/40 bg-[#B08B3C]/15 px-2 py-0.5 text-[8px] font-semibold text-gold-700">Martes</span><p className="mt-0.5 text-[7px] text-[#625A4C]">24/11/2026</p></div>
          </div>

          {/* Novedades (carrusel) */}
          <p className="mb-1.5 mt-3.5 text-[11px] font-bold">Novedades para vos</p>
          <div className="flex gap-1.5 rounded-2xl border border-[#B08B3C]/15 bg-white/70 p-2">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1 pl-1.5">
              <span className="inline-flex self-start rounded-full bg-gold-500/15 px-2 py-0.5 text-[8px] font-semibold text-gold-700">Promo</span>
              <p className="text-[11px] font-bold leading-snug">¡Llegan los SUPERMIÉRCOLES!</p>
              <p className="text-[8px] leading-snug text-[#625A4C]">Pedí tu crédito un miércoles y accedé a una tasa preferencial del {Math.round(BUSINESS.rates.supermiercoles * 100)}%.</p>
            </div>
            <div className="flex w-[34%] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300/30 to-gold-500/10"><BadgePercent className="h-9 w-9 text-gold-500" strokeWidth={1.6} /></div>
          </div>
          <div className="mt-2 flex justify-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-gold-500" /><span className="h-1.5 w-1.5 rounded-full bg-[#B08B3C]/30" /><span className="h-1.5 w-1.5 rounded-full bg-[#B08B3C]/30" /></div>
        </div>

        {/* Barra inferior flotante */}
        <nav className="absolute inset-x-2.5 bottom-2.5 rounded-2xl border border-[#B08B3C]/25 bg-[#F7F6F2]/90 p-1 shadow-[0_10px_30px_-12px_rgba(23,17,10,.25)] backdrop-blur" aria-hidden="true">
          <ul className="grid grid-cols-5">
            {NAV.map(([Icon, label], i) => (
              <li key={label} className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[7px] font-semibold ${i === 0 ? 'bg-gold-grad text-[#17110A]' : 'text-[#625A4C]'}`}>
                <Icon className="h-4 w-4" />{label}{label === 'Avisos' && <span className="absolute right-3 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
