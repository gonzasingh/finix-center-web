import { Users, Wallet, FileCheck2, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { PageTitle, clientSummary, Avatar } from './shared';
import { Badge } from '../../components/dashboard/ui';
import { scoreInfo, AUDIT_ACTIONS, REQUEST_STATES } from '../../lib/credit';
import { moneyInt, fmtDateTime, greeting, firstName } from '../../lib/format';

export default function Overview({ clients, credits, requests, audit, actor, go }) {
  const rows = clients.map((c) => clientSummary(c, credits));
  const activeCredits = credits.filter((c) => c.estado === 'activo').length;
  const cartera = rows.reduce((s, r) => s + r.saldo, 0);
  const overdueClients = rows.filter((r) => r.overdue > 0).length;
  const pending = requests.filter((r) => !['aprobada', 'rechazada'].includes(r.estado));
  const dist = [['Excelente', 85, 101], ['Bueno', 70, 85], ['Regular', 50, 70], ['En riesgo', 0, 50]].map(([l, lo, hi]) => ({ l, n: clients.filter((c) => c.score >= lo && c.score < hi).length, color: scoreInfo(lo).color }));
  const max = Math.max(1, ...dist.map((d) => d.n));
  const kpis = [[Users, 'Socios', clients.length, 'activos en el sistema'], [Wallet, 'Créditos activos', activeCredits, 'en curso'], [TrendingUp, 'Cartera pendiente', moneyInt(cartera), 'saldo por cobrar'], [FileCheck2, 'Solicitudes', pending.length, 'pendientes de gestión', 'solicitudes'], [AlertTriangle, 'Socios con mora', overdueClients, 'con cuotas vencidas', 'socios']];

  return (
    <>
      <PageTitle title={`${greeting()}, ${firstName(actor.displayName)}`} sub="Esto es lo que está pasando hoy en FINIX Center." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(([Icon, l, v, s, to], i) => <button key={l} onClick={() => to && go(to)} disabled={!to} className={`card spot p-5 text-left ${to ? 'transition hover:border-line/40' : ''}`} style={{ animationDelay: `${i * 60}ms` }}><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-line/10 text-gold-300"><Icon className="h-5 w-5" /></div><p className="text-xs text-muted">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p><p className="text-[11px] text-muted">{s}</p></button>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-bold">Última actividad</h2><button onClick={() => go('auditoria')} className="flex items-center gap-1 text-xs font-semibold text-gold-300">Ver registro completo<ArrowRight className="h-3.5 w-3.5" /></button></div>
          <ul className="space-y-4">{audit.slice(0, 6).map((a) => <li key={a.id} className="flex gap-3"><Avatar name={a.actorName} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="text-sm"><b>{a.actorName}</b> <span className="text-muted">· {a.summary}</span></p><p className="mt-0.5 text-xs text-muted">{a.entityLabel} · {fmtDateTime(a.ts)}</p></div><Badge tone={AUDIT_ACTIONS[a.action]?.tone} className="self-start">{AUDIT_ACTIONS[a.action]?.label}</Badge></li>)}</ul>
        </section>
        <div className="space-y-6">
          <section className="card p-6"><h2 className="mb-5 font-bold">Score de pago de la cartera</h2>
            <div className="space-y-3.5">{dist.map((d) => <div key={d.l}><div className="mb-1 flex justify-between text-xs"><span className="text-muted">{d.l}</span><b>{d.n}</b></div><div className="h-2.5 overflow-hidden rounded-full bg-line/15"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.n / max) * 100}%`, background: d.color }} /></div></div>)}</div></section>
          <section className="card p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Solicitudes pendientes</h2><button onClick={() => go('solicitudes')} className="text-xs font-semibold text-gold-300">Gestionar</button></div>
            {pending.length ? <ul className="space-y-3">{pending.slice(0, 4).map((r) => { const c = clients.find((x) => x.id === r.clientId); return <li key={r.id} className="flex items-center gap-3 text-sm"><Avatar name={c?.nombre || '?'} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{c?.nombre}</p><p className="text-xs text-muted">#{r.numero} · {moneyInt(r.monto)}</p></div><Badge tone={REQUEST_STATES[r.estado].tone}>{REQUEST_STATES[r.estado].label}</Badge></li>; })}</ul> : <p className="text-sm text-muted">No hay solicitudes pendientes.</p>}</section>
        </div>
      </div>
    </>
  );
}
