import { Bell, User, Wallet, FileText, Calculator, MessageSquareText, ClipboardCheck, MapPin, Landmark, Headphones, CalendarDays } from 'lucide-react';
import Logo from '../common/Logo';

const SHORTCUTS = [[Wallet, 'Mis créditos'], [FileText, 'Estado de cuenta'], [Calculator, 'Simulá tu crédito'], [MessageSquareText, 'Mis solicitudes'], [ClipboardCheck, 'Requisitos'], [MapPin, 'Sucursales'], [Landmark, 'Quienes somos'], [Headphones, 'Atención']];

// Maqueta de la pantalla de inicio de la App FINIX (datos de ejemplo).
export default function PhoneMock() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gold-400/25 blur-3xl" />
      <div className="w-[300px] rounded-[44px] border-[7px] border-[#1d1812] bg-[#F7F6F2] shadow-[0_40px_80px_-20px_rgba(226,191,96,.45)] sm:w-[320px]">
        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold text-[#444]"><span>9:41</span><span className="h-4 w-16 rounded-full bg-[#1d1812]" /><span>●●●</span></div>
        <div className="overflow-hidden rounded-b-[36px]">
          <div className="relative mt-2 overflow-hidden rounded-b-[28px] bg-gradient-to-br from-gold-600 via-gold-500 to-gold-300 px-4 pb-4 pt-3 text-white">
            <Logo white className="absolute -right-6 -top-2 h-44 opacity-10" variant="icon" />
            <div className="flex items-start justify-between">
              <Logo white className="h-11" />
              <div className="flex gap-1.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25"><Bell className="h-4 w-4" /></span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25"><User className="h-4 w-4" /></span></div>
            </div>
            <div className="mt-2 flex items-end justify-between"><div><p className="text-[10px] opacity-90">Buen día</p><p className="text-base font-bold leading-tight">Mateo E. Gomez</p><p className="text-[9px] opacity-80">DNI 38.492.615</p></div><span className="text-[9px] opacity-90">Crédito activo</span></div>
            <p className="mt-3 text-[10px] font-medium opacity-90">Saldo pendiente</p>
            <p className="text-2xl font-extrabold tracking-tight">$2.760.002,00</p>
          </div>
          <div className="px-3.5 pb-4 pt-3.5 text-[#444]">
            <p className="mb-2 text-[11px] font-bold">Tus atajos</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SHORTCUTS.map(([Icon, label]) => (
                <div key={label} className="flex h-[62px] flex-col items-center justify-center gap-1 rounded-xl bg-[#F3ECDA] px-0.5 text-center"><Icon className="h-4 w-4 text-gold-500" /><span className="text-[7.5px] font-semibold leading-tight">{label}</span></div>
              ))}
            </div>
            <p className="mb-2 mt-3 text-[11px] font-bold">Avisos</p>
            <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm"><CalendarDays className="h-5 w-5 text-gold-500" /><div className="flex-1"><p className="text-[9px] text-[#8E8E8E]">Próxima cuota</p><p className="text-sm font-bold">$197.143,00</p></div><span className="text-[9px] font-semibold text-gold-500">Martes</span></div>
            <p className="mb-2 mt-3 text-[11px] font-bold">Novedades para vos</p>
            <div className="rounded-xl bg-[#F3ECDA] p-3"><span className="rounded-full bg-gold-500 px-2 py-0.5 text-[8px] font-semibold text-white">Más beneficios</span><p className="mt-1.5 text-[11px] font-extrabold leading-tight">¡Llegan los SUPERMIÉRCOLES!</p><p className="mt-1 text-[8px] leading-snug">Tasa preferencial para vos y tu comercio cada miércoles.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
