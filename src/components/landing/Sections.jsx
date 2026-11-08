import { Link } from 'react-router-dom';
import { Reveal, SpotCard } from '../common/hooks';
import { BUSINESS, waLink } from '../../config/business';
import { moneyInt } from '../../lib/format';
import { CalendarClock, Smartphone, Handshake, BadgePercent, Eye, Headset, CheckCircle2, FileText, ArrowRight, Target, Telescope, HeartHandshake, MessageCircle, Plus, ChevronRight, TrendingUp, TrendingDown, MapPin, Clock, Phone, Briefcase, User } from 'lucide-react';
import Logo from '../common/Logo';
import PhoneMock from './PhoneMock';
import { scrollToId } from '../../lib/scroll';
import { useState } from 'react';

const SectionHead = ({ eyebrow, title, children, center = true }) => (
  <Reveal className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h2>
    {children && <p className="mt-4 font-light leading-relaxed text-muted sm:text-lg">{children}</p>}
  </Reveal>
);

export function Marquee() {
  const items = [...BUSINESS.coverage, ...BUSINESS.coverage, ...BUSINESS.coverage, ...BUSINESS.coverage];
  return (
    <section className="overflow-hidden border-y border-line/15 bg-line/[.04] py-5" aria-label="Zonas de cobertura">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[.25em] text-muted">{t}<span className="text-gold-300">✦</span></span>
        ))}
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: CalendarClock, title: 'Créditos flexibles', text: 'Planes semanales, quincenales o mensuales con cuotas fijas en pesos, sin sorpresas.', span: 'lg:col-span-2' },
  { icon: BadgePercent, title: 'Supermiércoles', text: 'Pedí tu crédito un miércoles y, si se aprueba, la tasa baja del 6% al 5% por período.', hot: true },
  { icon: Smartphone, title: 'Gestión en la App', text: 'Saldo, próxima cuota, estado de cuenta y solicitudes desde tu celular, las 24 hs.' },
  { icon: Eye, title: 'Transparencia total', text: 'Ves el interés y el total a pagar antes de decidir. Sin letras chicas.' },
  { icon: Headset, title: 'Atención humana', text: 'Un equipo que te conoce por tu nombre y te acompaña en cada etapa del crédito.', span: 'lg:col-span-2' },
];

export function Benefits() {
  return (
    <section id="beneficios" className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHead eyebrow="Beneficios" title={<>Por qué elegir <span className="text-gold-grad">FINIX Center</span></>}>
        Simples, rápidos y a medida. Todo lo que necesitás para financiar tu proyecto con tranquilidad.
      </SectionHead>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text, span = '', hot }, i) => (
          <Reveal key={title} delay={i * 70} className={span}>
            <SpotCard className={`card h-full p-7 ${hot ? 'bg-gradient-to-br from-gold-700/30 to-surface/70' : ''}`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-line/30 bg-line/10 text-gold-300"><Icon className="h-6 w-6" /></div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-muted">{text}</p>
            </SpotCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  ['Simulá', 'Elegí monto, plan y cantidad de cuotas. Ves tu cuota al instante.'],
  ['Presentá tus datos', 'Reuní la documentación según el tipo de crédito.'],
  ['Evaluación y aprobación', 'Revisamos tu solicitud con atención personalizada y te avisamos cada novedad.'],
  ['Gestioná desde la app', 'Seguí tu saldo, tus cuotas y tu estado de cuenta cuando quieras.'],
];
export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-line/[.03] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead eyebrow="Cómo funciona" title={<>De la idea al crédito en <span className="text-gold-grad">4 pasos</span></>} />
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 90} className="list-none">
              <div className="card-flat relative h-full p-6">
                <span className="text-5xl font-bold text-gold-grad opacity-90">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted">{d}</p>
                {i < 3 && <ChevronRight className="absolute -right-3 top-1/2 hidden h-6 w-6 text-gold-300/60 md:block" />}
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[['Crédito personal', User, BUSINESS.requirements.personal], ['Crédito comercial', Briefcase, BUSINESS.requirements.comercial]].map(([t, Icon, list]) => (
            <Reveal key={t}>
              <div className="card p-7">
                <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-line/10 text-gold-300"><Icon className="h-5 w-5" /></div><h3 className="text-lg font-semibold">{t}</h3></div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Requisitos</p>
                <ul className="space-y-2.5">{list.map((r) => <li key={r} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />{r}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppShowcase() {
  return (
    <section id="app" className="relative overflow-hidden py-24">
      <div className="aurora aurora-soft opacity-60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <Reveal className="flex justify-center"><PhoneMock /></Reveal>
        <div>
          <SectionHead center={false} eyebrow="App y portal de socios" title={<>Tu crédito, <span className="text-gold-grad">en tu bolsillo</span></>}>
            Consultá saldos, vencimientos y comprobantes desde la App FINIX o desde el portal web. Ingresá con tu DNI y tu contraseña.
          </SectionHead>
          <ul className="space-y-4">
            {[['Estado de cuenta en vivo', 'Saldo pendiente, avance del crédito y cronograma de cuotas.'], ['Avisos de próximos vencimientos', 'Te recordamos tu próxima cuota y novedades de tus solicitudes.'], ['Solicitudes con seguimiento', 'Línea de tiempo con cada movimiento: ingresada, en revisión, aprobada.']].map(([t, d]) => (
              <Reveal as="li" key={t} className="flex list-none gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-gold-300" /><div><h4 className="font-semibold">{t}</h4><p className="text-sm font-light text-muted">{d}</p></div></Reveal>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/ingresar" className="btn-gold">Ingresar al portal<ArrowRight className="h-4 w-4" /></Link>
            <a href={waLink('Hola, quisiera el link de descarga de la App FINIX Center')} target="_blank" rel="noreferrer" className="btn-outline">Descargar la app</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  const cards = [[Target, 'Nuestra misión', 'Ser tu aliado financiero, brindándote soluciones simples, rápidas y a medida para que alcances tus metas comerciales y personales.'], [Telescope, 'Nuestra visión', 'Liderar el sector financiero regional manteniendo nuestra esencia: una atención humana, personalizada y orientada a potenciar tus oportunidades.'], [HeartHandshake, 'Nuestros valores', 'Integridad, honestidad, respeto y transparencia. Son los pilares que nos trajeron hasta acá.']];
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-5 py-24">
      <div className="card overflow-hidden">
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-gold-800/40 via-transparent to-transparent p-10 grain">
            <Reveal><Logo className="h-56 drop-shadow-[0_10px_40px_rgba(226,191,96,.35)]" /></Reveal>
          </div>
          <div className="p-8 sm:p-12">
            <Reveal><span className="eyebrow">Quiénes somos</span>
              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Tu aliado financiero para <span className="text-gold-grad">impulsarte</span> en cada etapa</h2>
              <p className="mt-4 font-light leading-relaxed text-muted">Nacimos en el Norte Argentino con un propósito claro: ser el motor que transforma proyectos en realidades. Acompañamos a cientos de socios con un trato directo, transparente y sin vueltas.</p></Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {cards.map(([Icon, t, d], i) => (
                <Reveal key={t} delay={i * 80}><div className="card-flat h-full p-5"><Icon className="mb-3 h-6 w-6 text-gold-300" /><h3 className="text-sm font-semibold">{t}</h3><p className="mt-2 text-xs font-light leading-relaxed text-muted">{d}</p></div></Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Dollar() {
  return (
    <section id="cotizacion" className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="card grain relative overflow-hidden p-8 sm:p-12">
          <div className="aurora opacity-50" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="eyebrow">Mercado cambiario</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Compramos tus <span className="text-gold-grad">dólares</span></h2>
              <p className="mt-2 font-light text-muted">Cotización del día con la mejor tasa regional y atención en privado.</p>
              <a href={waLink('Hola FINIX Center, quisiera consultar por la cotización de dólares del día.')} target="_blank" rel="noreferrer" className="btn-gold mt-6"><MessageCircle className="h-4 w-4" />Consultar operaciones</a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Compramos', BUSINESS.usd.buy, TrendingUp], ['Vendemos', BUSINESS.usd.sell, TrendingDown]].map(([l, v, Icon]) => (
                <div key={l} className="rounded-2xl border border-line/25 bg-base/60 p-5 text-center">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-gold-300" /><div className="text-[11px] uppercase tracking-widest text-muted">{l}</div>
                  <div className="mt-1 text-3xl font-bold text-gold-grad">{moneyInt(v)}</div><div className="text-[11px] text-muted">USD</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FAQ = [
  ['¿Qué necesito para pedir un crédito?', 'Para un crédito personal: recibo de sueldo (antigüedad 1 año), D.N.I. y boleta de servicios. Para un crédito comercial: ser titular del comercio (dueño), D.N.I. y boleta de servicio.'],
  ['¿Cómo se calcula mi cuota?', `El simulador aplica una tasa del ${Math.round(BUSINESS.rates.standard * 100)}% por período (semana, quincena o mes) sobre el monto solicitado. Es una estimación orientativa: las condiciones definitivas las confirma la empresa.`],
  ['¿Qué es Supermiércoles?', `Si ingresás tu solicitud un miércoles y resulta aprobada, accedés automáticamente a una tasa preferencial del ${Math.round(BUSINESS.rates.supermiercoles * 100)}% en lugar del ${Math.round(BUSINESS.rates.standard * 100)}% habitual. Tu crédito pasa por la misma evaluación de siempre.`],
  ['¿Cómo ingreso a mi cuenta?', 'Desde “Ingresar” elegí “Soy socio” y usá el documento y la contraseña que registraste. Allí ves tus créditos, pagos y estado de cuenta.'],
];
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24">
      <SectionHead eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
      <div className="space-y-3">
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <div className="card-flat overflow-hidden">
              <button className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {q}<Plus className={`h-5 w-5 shrink-0 text-gold-300 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="px-6 pb-5 text-sm font-light leading-relaxed text-muted">{a}</p></div></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line/15 bg-line/[.03]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="h-24" />
          <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-muted">Financiamos tus sueños, potenciamos tu negocio y construimos juntos un camino. Casa Central en Tucumán con cobertura en todo el Norte Argentino.</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold-300">Secciones</h4>
          <ul className="space-y-2 text-sm text-muted">
            {[['simulador', 'Simulador de créditos'], ['beneficios', 'Beneficios'], ['app', 'App de socios'], ['nosotros', 'Quiénes somos'], ['cotizacion', 'Cotización USD']].map(([id, l]) => <li key={id}><button onClick={() => scrollToId(id)} className="transition hover:text-fg">{l}</button></li>)}
            <li><Link to="/ingresar" className="transition hover:text-fg">Ingresar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold-300">Atención directa</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />{BUSINESS.headquarters}</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><a href={waLink()} target="_blank" rel="noreferrer" className="hover:text-fg">{BUSINESS.whatsappDisplay}</a></li>
            <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />{BUSINESS.hours}</li>
            {BUSINESS.email && <li className="flex gap-2.5"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />{BUSINESS.email}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line/10 px-5 py-5 text-center text-xs text-muted">© {new Date().getFullYear()} FINIX Center. Todos los derechos reservados. Las simulaciones son orientativas y están sujetas a aprobación crediticia.</div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a href={waLink()} target="_blank" rel="noreferrer" aria-label="Escribinos por WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-grad text-ink shadow-gold-lg transition hover:scale-110">
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
