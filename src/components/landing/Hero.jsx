import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, CalendarCheck } from 'lucide-react';
import Particles from '../common/Particles';
import { CountUp, Reveal } from '../common/hooks';
import Simulator from './Simulator';
import { scrollToId } from '../../lib/scroll';

export default function Hero() {
  return (
    <section id="simulador" className="grain relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-28">
      <div className="aurora" /><div className="grid-lines absolute inset-0" /><Particles />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div>
          <Reveal><span className="eyebrow"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-300" />Soluciones financieras en el Norte Argentino</span></Reveal>
          <Reveal delay={90}>
            <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              Financiamos <span className="text-gold-grad">tus sueños</span>,<br />construimos juntos un camino.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted sm:text-lg">
              Créditos ágiles en <b className="font-semibold text-fg">cuotas fijas</b> y atención personalizada para potenciar tu negocio y cada etapa de tu vida. Simulá tu cuota en segundos y gestioná todo desde la app.
            </p>
          </Reveal>
          <Reveal delay={260} className="mt-8 flex flex-wrap gap-3">
            <button className="btn-gold" onClick={() => scrollToId('beneficios')}>Conocé los beneficios<ArrowRight className="h-4 w-4" /></button>
            <Link to="/ingresar" className="btn-outline">Ingresar a mi cuenta</Link>
          </Reveal>
          <Reveal delay={340} className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-line/20 pt-8">
            {[[CalendarCheck, <CountUp to={24} key="a" />, 'cuotas máx.'], [Zap, <><CountUp to={100} />%</>, 'digital y ágil'], [ShieldCheck, <CountUp to={2} suffix="+" key="c" />, 'años de trayectoria']].map(([Icon, val, label], i) => (
              <div key={i}>
                <Icon className="mb-2 h-5 w-5 text-gold-300" />
                <div className="text-2xl font-bold sm:text-3xl">{val}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={200} className="mx-auto w-full max-w-md lg:ml-auto"><Simulator /></Reveal>
      </div>
    </section>
  );
}
