import { useMemo, useState } from 'react';
import { Bell, User, Wallet, FileText, Calculator, MessageSquareText, ClipboardCheck, MapPin, Landmark, Headphones, CalendarDays, ChevronRight, ArrowLeft, Search, Phone, Mail, MessageCircle, Globe, CheckCircle2, Clock, LogOut, Settings, Sparkles, Briefcase, Eye, Banknote, Info, Lock } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Simulator from '../../components/landing/Simulator';
import ThemeToggle from '../../components/common/ThemeToggle';
import CardEmblem from '../../components/portal/CardEmblem';
import NewsSection from '../../components/portal/NewsSection';
import ShortcutGrid from '../../components/portal/ShortcutGrid';
import { PORTAL_SECTIONS } from '../../lib/news';
import { Badge, Empty, Modal } from '../../components/dashboard/ui';
import { BUSINESS, waLink, telLink } from '../../config/business';
import { creditStats, buildSchedule, nextInstallment, planLabel, reqState, FINAL_REQUEST_STATES } from '../../lib/credit';
import { money, moneyInt, fmtDate, fmtDateTime, weekday, greeting } from '../../lib/format';

export const ViewHeader = ({ title, onBack, right }) => (
  <div className="mb-6 flex items-center gap-3">
    <button onClick={onBack} aria-label="Volver" className="flex h-10 w-10 items-center justify-center rounded-full border border-line/25 text-muted transition hover:bg-line/10 hover:text-fg"><ArrowLeft className="h-5 w-5" /></button>
    <h2 className="flex-1 text-xl font-bold sm:text-2xl">{title}</h2>{right}
  </div>
);

export function summarize(data, now = new Date()) {
  const active = data.credits.filter((c) => c.estado === 'activo');
  const saldo = active.reduce((s, c) => s + creditStats(c).saldo, 0);
  const next = active.map((c) => ({ c, q: nextInstallment(c, now) })).filter((x) => x.q).sort((a, b) => a.q.due - b.q.due)[0];
  return { active, saldo, next };
}

const noticeIcon = (n) => {
  const t = `${n.tipo} ${n.ruta}`.toLowerCase();
  return /cuota|vencim|pago/.test(t) ? CalendarDays : /solicitud|crm/.test(t) ? FileText : /credito|cr[eé]dito/.test(t) ? Wallet : /promo|benef|banner|novedad/.test(t) ? Sparkles : Bell;
};
export function buildNotices(data, now = new Date()) {
  // Con la API real los avisos vienen del servidor (con su estado leído / no leído).
  if (data.source === 'api') return [...data.notices].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((n) => ({ ...n, icon: noticeIcon(n) }));
  const { next } = summarize(data, now);
  const list = [];
  if (next) list.push({ id: 'cuota', icon: CalendarDays, title: 'Próxima cuota', text: `${moneyInt(next.q.monto)} a pagar el día ${weekday(next.q.due)}`, date: next.q.due, unread: true });
  [...data.requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).forEach((r) =>
    list.push({ id: `r-${r.id}`, icon: FileText, title: `Solicitud #${r.numero}`, text: `La solicitud pasó a “${reqState(r.estado, r.estadoNombre).label}”`, date: r.updatedAt }));
  list.push({ id: 'beneficio', icon: Sparkles, title: 'Beneficios', text: '¡Llegan los SUPERMIÉRCOLES! Enterate los beneficios que tenemos para vos', date: now.toISOString() });
  return list;
}

const SHORTCUTS = [['creditos', Wallet, 'Mis créditos'], ['estado', FileText, 'Estado de cuenta'], ['simulador', Calculator, 'Simulá tu crédito'], ['solicitudes', MessageSquareText, 'Mis solicitudes'], ['requisitos', ClipboardCheck, 'Requisitos'], ['sucursales', MapPin, 'Sucursales'], ['nosotros', Landmark, 'Quienes somos'], ['atencion', Headphones, 'Atención']];

export function HomeView({ user, data, go, unread }) {
  const { active, saldo, next } = summarize(data);
  const pending = data.requests.filter((r) => !FINAL_REQUEST_STATES.includes(r.estado)).length;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6">
        <section className="relative overflow-hidden rounded-[14px] px-5 py-4 text-white shadow-gold-lg" style={{ backgroundImage: 'linear-gradient(132deg, #8D6E2D 3%, #DDB85F 90%)' }}>
          <CardEmblem />
          <div className="relative">
            <div><p className="text-sm opacity-90">{greeting()}</p><h1 className="text-2xl font-bold leading-tight">{user.displayName}</h1></div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-xs opacity-80">DNI {data.client.dni}</p>
              <Badge tone="gray" dot className="!border-white/40 !bg-white/20 !text-white">{active.length ? 'Crédito activo' : 'Sin créditos activos'}</Badge>
            </div>
          </div>
          <div className="relative mt-3 border-t border-white/25 pt-3"><p className="text-sm font-medium opacity-90">Saldo pendiente</p><p className="text-3xl font-extrabold tracking-tight sm:text-4xl">{money(saldo)}</p></div>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold">Tus atajos</h3>
          <ShortcutGrid items={SHORTCUTS} onSelect={go} />
        </section>
      </div>

      <div className="min-w-0 space-y-6">
        <section>
          <h3 className="mb-3 text-lg font-bold">Avisos</h3>
          {next ? (
            <button onClick={() => go('estado', next.c.id)} className="card-flat flex w-full items-center gap-4 p-4 text-left transition hover:border-line/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-line/10 text-gold-300"><CalendarDays className="h-6 w-6" /></span>
              <span className="flex-1"><span className="block text-xs text-muted">Próxima cuota</span><span className="text-xl font-bold">{money(next.q.monto)}</span></span>
              <span className="text-right"><Badge tone={next.c.alerta === 'atraso' ? 'rose' : 'gold'}>{next.c.alerta === 'atraso' ? 'Con atraso' : weekday(next.q.due)}</Badge><span className="mt-1 block text-[11px] text-muted">{fmtDate(next.q.due)}</span></span>
            </button>
          ) : <div className="card-flat p-5 text-sm text-muted">No tenés cuotas pendientes. ¡Excelente!</div>}
          {pending > 0 && <button onClick={() => go('solicitudes')} className="card-flat mt-3 flex w-full items-center gap-3 p-4 text-left text-sm hover:border-line/40"><MessageSquareText className="h-5 w-5 text-gold-300" /><span className="flex-1">Tenés <b>{pending}</b> solicitud{pending > 1 ? 'es' : ''} en curso</span><ChevronRight className="h-4 w-4 text-muted" /></button>}
        </section>

        <NewsSection sections={PORTAL_SECTIONS} onWeb={(n) => go('novedad', n.id)} onSection={go} />
      </div>
    </div>
  );
}

const Bar = ({ value }) => <div className="h-2 overflow-hidden rounded-full bg-line/20"><div className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-300 transition-all duration-700" style={{ width: `${value}%` }} /></div>;
const creditBadge = (c) => c.estado !== 'activo' ? <Badge tone="gray"><CheckCircle2 className="h-3 w-3" />Cancelado</Badge> : c.alerta === 'atraso' ? <Badge tone="rose" dot>Con atraso</Badge> : c.alerta === 'proximo' ? <Badge tone="gold" dot>Próximo a vencer</Badge> : <Badge tone="emerald" dot>Activo</Badge>;

export function CreditsView({ data, go, back }) {
  const list = [...data.credits].sort((a, b) => b.numero.localeCompare(a.numero, undefined, { numeric: true }));
  return (
    <div className="mx-auto max-w-2xl">
      <ViewHeader title="Mis créditos" onBack={back} />
      <p className="mb-5 text-sm text-muted">Consultá tus créditos activos, pagos y saldos pendientes.</p>
      {!list.length ? <div className="card"><Empty title="Todavía no tenés créditos" text="Simulá y solicitá tu primer crédito." /></div> : (
        <div className="space-y-4">
          {list.map((c) => { const s = creditStats(c); return (
            <button key={c.id} onClick={() => go('estado', c.id)} className="card spot block w-full p-5 text-left transition hover:border-line/40">
              <div className="flex items-start justify-between"><div><h3 className="font-bold">Crédito {c.numero}</h3><p className="text-xs text-muted">Inicio: {fmtDate(c.inicio)}</p></div>{creditBadge(c)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface2/70 p-4"><div><p className="text-xs text-muted">Saldo pendiente</p><p className="text-xl font-bold">{money(s.saldo)}</p></div><div><p className="text-xs text-muted">Valor de cuota</p><p className="text-lg font-bold">{money(c.valorCuota)}</p></div></div>
              <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs text-muted"><span>Avance del crédito</span><span className="font-semibold text-fg">{s.avance}% pagado</span></div><Bar value={s.avance} /></div>
              <p className="mt-3 text-xs text-muted">Monto pagado: <b className="text-fg">{money(s.pagado)}</b> · Plan: {planLabel(c)} · {c.estado === 'activo' ? `Períodos: ${s.restantes} cuotas aprox.` : 'Finalizado'}</p>
              <p className="mt-2 flex items-center justify-between text-xs text-gold-300">Toca para ver el estado de cuenta<ChevronRight className="h-4 w-4" /></p>
            </button>); })}
        </div>)}
    </div>
  );
}

const MOVEMENT = {
  CREDITO: ['Crédito otorgado', Banknote, 'gold'], PAGO: ['Pago', CheckCircle2, 'emerald'], INTERES: ['Interés', Info, 'gold'], INTERES_ATRASO: ['Interés por atraso', Clock, 'rose'],
  REFINANCIACION: ['Refinanciación', Info, 'gold'], ACUERDO_PAGO: ['Acuerdo de pago', ClipboardCheck, 'gold'], CUOTA_IMPAGA: ['Cuota impaga', Clock, 'rose'], AVISO_IMPAGO: ['Aviso de impago', Bell, 'rose'],
  NOTA_CREDITO: ['Nota de crédito', FileText, 'emerald'], CAMBIO_PLAN: ['Cambio de plan', Info, 'gold'], CAMBIO_ZONA: ['Cambio de zona', MapPin, 'gold'], ANULACION: ['Anulación', Info, 'rose'],
};
const MOV_TONE = { gold: 'bg-line/10 text-gold-300', emerald: 'bg-emerald-500/10 text-emerald-400', rose: 'bg-rose-500/10 text-rose-400' };
function Movements({ list = [] }) {
  if (!list.length) return <div className="card-flat p-5 text-sm text-muted">Todavía no hay movimientos registrados.</div>;
  return (
    <div className="space-y-3">
      {list.map((m) => { const [label, Icon, tone] = MOVEMENT[m.tipo] || [m.tipo || 'Movimiento', Info, 'gold']; const detail = [m.formaPago, m.ticket && `Ticket ${m.ticket}`].filter(Boolean).join(' · ');
        return (<div key={m.id} className="card-flat flex items-center gap-4 p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${MOV_TONE[tone]}`}><Icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{m.concepto || label}</p><p className="text-xs text-muted">{fmtDate(m.fecha)}{detail ? ` · ${detail}` : ''}</p></div>
          {m.mostrarImporte && <p className={`shrink-0 text-sm font-bold ${tone === 'emerald' ? 'text-emerald-400' : ''}`}>{money(m.importe)}</p>}</div>); })}
    </div>
  );
}

export function StatementView({ data, creditId, back, go }) {
  const active = data.credits.filter((c) => c.estado === 'activo');
  const credit = data.credits.find((c) => c.id === creditId) || active[0] || data.credits[0];
  if (!credit) return <div className="mx-auto max-w-2xl"><ViewHeader title="Estado de cuenta" onBack={back} /><div className="card"><Empty title="Sin créditos" /></div></div>;
  const s = creditStats(credit); const real = !!credit.real; const sched = real ? [] : buildSchedule(credit); const nextQ = real ? nextInstallment(credit) : sched.find((q) => q.estado !== 'pagada');
  const tone = { pagada: 'emerald', vencida: 'rose', pendiente: 'gray' };
  return (
    <div className="mx-auto max-w-2xl">
      <ViewHeader title="Estado de cuenta" onBack={back} right={data.credits.length > 1 && <select aria-label="Crédito" value={credit.id} onChange={(e) => go('estado', e.target.value)} className="input !w-auto !py-2 text-xs">{data.credits.map((c) => <option key={c.id} value={c.id}>Crédito {c.numero}</option>)}</select>} />
      <h3 className="text-lg font-bold">Crédito {credit.numero}</h3><p className="mb-4 text-xs text-muted">Inicio: {fmtDate(credit.inicio)}</p>
      <div className="card p-6"><p className="text-sm text-muted">Saldo pendiente</p><p className="text-4xl font-extrabold text-gold-grad">{money(s.saldo)}</p><p className="mt-1 text-xs text-muted">{credit.estado !== 'activo' ? 'Crédito cancelado' : credit.alerta === 'atraso' ? 'Crédito con atraso' : 'Crédito activo'} {credit.numero} · Inicio: {fmtDate(credit.inicio)}</p></div>
      <div className="card mt-4 p-6">
        <div className="mb-1.5 flex justify-between text-sm"><span className="text-muted">Avance del crédito</span><b>{s.avance}% pagado</b></div><Bar value={s.avance} />
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-muted">Monto total</dt><dd className="font-bold">{money(s.total)}</dd></div><div><dt className="text-xs text-muted">Monto pagado</dt><dd className="font-bold">{money(s.pagado)}</dd></div><div><dt className="text-xs text-muted">Valor de cuota</dt><dd className="font-bold">{money(credit.valorCuota)}</dd></div><div><dt className="text-xs text-muted">Plan</dt><dd className="font-bold">{planLabel(credit)}</dd></div></dl>
      </div>
      {nextQ && <div className="card-flat mt-4 flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-line/10 text-gold-300"><CalendarDays className="h-6 w-6" /></span><div className="flex-1"><p className="text-xs text-muted">Próximo vencimiento</p><p className="text-lg font-bold">{fmtDate(nextQ.due)}</p>{credit.alerta === 'atraso' && <p className="text-xs font-semibold text-rose-400">Con atraso</p>}</div><p className="text-xl font-bold">{money(nextQ.monto)}</p></div>}
      {!real && <><h3 className="mb-3 mt-8 text-lg font-bold">Cronograma de cuotas</h3>
      <div className="card-flat overflow-hidden"><div className="max-h-[360px] overflow-auto"><table className="w-full"><thead className="sticky top-0 bg-surface"><tr><th className="th">Cuota</th><th className="th">Vence</th><th className="th text-right">Monto</th><th className="th text-right">Estado</th></tr></thead>
        <tbody className="divide-y divide-line/10">{sched.map((q) => <tr key={q.n}><td className="td font-semibold">{q.n}/{credit.cuotas}</td><td className="td">{fmtDate(q.due)}</td><td className="td text-right">{money(q.monto)}</td><td className="td text-right"><Badge tone={tone[q.estado]}>{q.estado[0].toUpperCase() + q.estado.slice(1)}</Badge></td></tr>)}</tbody></table></div></div></>}
      <h3 className="mb-3 mt-8 text-lg font-bold">Historial del crédito</h3>
      {real ? <Movements list={credit.movimientos} /> : <div className="space-y-3">
        {[...sched].filter((q) => q.estado === 'pagada').reverse().map((q) => <div key={q.n} className="card-flat flex items-center gap-4 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Pago de cuota {q.n}</p><p className="text-xs text-muted">{fmtDate(q.due)}</p></div><p className="text-sm font-bold">{money(q.monto)}</p></div>)}
        <div className="card-flat flex items-center gap-4 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-line/10 text-gold-300"><Banknote className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Crédito otorgado</p><p className="text-xs text-muted">{fmtDate(credit.inicio)}</p></div><p className="text-sm font-bold">{money(s.total)}</p></div>
      </div>}
    </div>
  );
}

export function SimulatorView({ back, onSubmit }) {
  const [draft, setDraft] = useState(null); const [comment, setComment] = useState(''); const [busy, setBusy] = useState(false);
  const send = async () => { setBusy(true); try { await onSubmit({ ...draft, comentario: comment }); } finally { setBusy(false); setDraft(null); setComment(''); } };
  return (
    <div className="mx-auto max-w-lg"><ViewHeader title="Simulador de crédito" onBack={back} /><p className="mb-5 text-sm text-muted">Calculá cuánto pagarías según el monto, el plan y la cantidad de períodos.</p>
      <Simulator compact onRequest={setDraft} />
      {draft && <Modal title="Solicitar el crédito" onClose={() => setDraft(null)} footer={<><button className="btn-ghost" onClick={() => setDraft(null)}>Cancelar</button><button className="btn-gold" onClick={send} disabled={busy}>{busy ? 'Enviando…' : 'Enviar solicitud'}</button></>}>
        <p className="text-sm text-muted">Vas a solicitar <b className="text-fg">{moneyInt(draft.monto)}</b> en <b className="text-fg">{draft.cuotas} cuotas {BUSINESS.plans[draft.plan].label.toLowerCase()}s</b>.</p>
        <label className="label mt-4">Comentario de la solicitud (opcional)</label><textarea className="input min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ej: Necesito ampliar mi negocio." maxLength={240} />
      </Modal>}
    </div>
  );
}

const BANNER = {
  ingresada: 'Recibimos tu solicitud. En breve comenzaremos a revisarla.', en_revision: 'Tu solicitud está siendo revisada por nuestro equipo.', observada: 'La empresa solicitó información adicional. Comunicate con nosotros para enviarla.',
  correccion_recibida: 'Recibimos tu corrección y será revisada nuevamente.', aprobada: '¡Tu solicitud fue aprobada! Ya podés ver tu crédito en “Mis créditos”.', rechazada: 'Tu solicitud no pudo ser aprobada en esta oportunidad.',
};
export function RequestsView({ data, go, back }) {
  const list = [...data.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="mx-auto max-w-2xl"><ViewHeader title="Mis solicitudes" onBack={back} right={<button className="btn-gold btn-sm" onClick={() => go('simulador')}>Nueva</button>} />
      <p className="mb-5 text-sm text-muted">Consultá el estado y seguimiento de tus solicitudes de crédito.</p>
      {!list.length ? <div className="card"><Empty title="No tenés solicitudes" text="Simulá un crédito y envialo desde el simulador." /></div> : <div className="space-y-4">
        {list.map((r) => <button key={r.id} onClick={() => go('solicitud', r.id)} className="card block w-full p-5 text-left transition hover:border-line/40">
          <div className="flex items-start justify-between"><div><h3 className="font-bold">Solicitud #{r.numero}</h3><p className="text-xs text-muted">{fmtDateTime(r.createdAt)}</p></div><Badge tone={reqState(r.estado, r.estadoNombre).tone}>{reqState(r.estado, r.estadoNombre).label}</Badge></div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-muted">Monto solicitado</p><p className="font-bold">{money(r.monto)}</p></div><div><p className="text-xs text-muted">Plan</p><p className="font-bold">{planLabel(r)}</p></div><div><p className="text-xs text-muted">Cuotas</p><p className="font-bold">{r.cuotas} cuotas</p></div></div>
          <p className="mt-3 flex items-center justify-between text-xs text-muted">Actualizada {fmtDateTime(r.updatedAt)}<ChevronRight className="h-4 w-4 text-gold-300" /></p></button>)}</div>}
    </div>
  );
}
export function RequestDetailView({ data, id, back }) {
  const r = data.requests.find((x) => x.id === id); if (!r) return null;
  const tl = [...r.timeline].reverse(); const obsText = r.ultimaObservacion || [...r.timeline].reverse().find((t) => t.estado === 'observada')?.detalle; const st = reqState(r.estado, r.estadoNombre);
  return (
    <div className="mx-auto max-w-2xl"><ViewHeader title="Detalle de solicitud" onBack={back} />
      <div className="card p-6"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold">Solicitud #{r.numero}</h3><p className="text-xs text-muted">Ingresada el {fmtDateTime(r.createdAt)}</p></div><Badge tone={st.tone}>{st.label}</Badge></div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-muted">Monto solicitado</p><p className="font-bold">{money(r.monto)}</p></div><div><p className="text-xs text-muted">Plan</p><p className="font-bold">{planLabel(r)}</p></div><div><p className="text-xs text-muted">Cuotas</p><p className="font-bold">{r.cuotas} cuotas</p></div></div></div>
      <div className="card-flat mt-4 flex gap-3 p-4 text-sm"><Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" /><div><b>Estado de solicitud</b><p className="mt-0.5 text-muted">{r.estadoDescripcion || BANNER[r.estado] || 'Consultá aquí el seguimiento de tu solicitud.'}</p></div></div>
      {obsText && <><h3 className="mb-2 mt-6 font-bold">Última observación</h3><div className="card-flat p-4 text-sm">{obsText}</div></>}
      {r.comentario && <><h3 className="mb-2 mt-6 font-bold">Comentario de la solicitud</h3><div className="card-flat p-4 text-sm">{r.comentario}</div></>}
      <div className="mb-3 mt-8 flex items-center justify-between"><h3 className="font-bold">Línea de tiempo</h3><Badge>{tl.length} movimiento{tl.length > 1 ? 's' : ''}</Badge></div>
      <ol className="relative ml-2 space-y-4 border-l border-line/25 pl-6">
        {tl.map((t, i) => <li key={i} className="relative"><span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-base ${i === 0 ? 'bg-gold-300' : 'bg-line/40'}`} />
          <div className="card-flat p-4"><div className="flex items-center justify-between gap-3"><b className="text-sm">{reqState(t.estado, t.estadoNombre).label}</b><span className="text-xs text-muted">{fmtDateTime(t.fecha)}</span></div><p className="mt-1.5 text-sm text-muted">{t.detalle}</p></div></li>)}
      </ol>
    </div>
  );
}

export function NoticesView({ notices, read, onRead, onOpen, back }) {
  const unread = notices.filter((n) => n.unread && !read.has(n.id)).length;
  return (
    <div className="mx-auto max-w-2xl"><ViewHeader title="Notificaciones" onBack={back} />
      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted">{unread ? `Tenés ${unread} aviso${unread > 1 ? 's' : ''} sin leer` : notices.length ? 'No tenés avisos sin leer' : 'No tenés avisos por ahora'}</p>{unread > 0 && <button onClick={onRead} className="text-sm font-semibold text-gold-300 underline underline-offset-4">Marcar como leídos</button>}</div>
      <div className="space-y-3">{notices.map((n) => { const { id, icon: Icon, title, text, date, unread: u } = n; return <button key={id} onClick={() => onOpen?.(n)} className="card-flat flex w-full items-center gap-4 p-4 text-left"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-line/10 text-gold-300"><Icon className="h-6 w-6" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><b className="text-sm">{title}</b>{u && !read.has(id) && <span className="h-2 w-2 rounded-full bg-rose-500" />}</div><p className="text-xs text-muted">{text}</p></div><span className="shrink-0 text-[11px] text-muted">{fmtDate(date)}</span></button>; })}</div>
    </div>
  );
}

function PasswordModal({ onClose, onSubmit }) {
  const [f, setF] = useState({ actual: '', nueva: '', confirmacion: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = async () => { setErr(''); setBusy(true); try { await onSubmit(f); } catch (e) { setErr(e.message || 'No se pudo cambiar la contraseña.'); setBusy(false); } };
  return (
    <Modal title="Cambiar contraseña" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-gold" onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></>}>
      <div className="space-y-3">
        {[['actual', 'Contraseña actual', 'current-password'], ['nueva', 'Nueva contraseña (mínimo 8 caracteres)', 'new-password'], ['confirmacion', 'Repetí la nueva contraseña', 'new-password']].map(([k, label, ac]) => (
          <div key={k}><label className="label">{label}</label><input type="password" autoComplete={ac} className="input" value={f[k]} onChange={set(k)} /></div>))}
        {err && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">{err}</p>}
      </div>
    </Modal>
  );
}

export function ProfileView({ user, data, back, onLogout, onChangePassword }) {
  const [pw, setPw] = useState(false);
  const c = data.client; const rows = [['Nombre', c.nombre], ['DNI', c.dni], ['Dirección', c.direccion], ['Teléfono', c.telefono], ...(c.email !== undefined ? [['Correo electrónico', c.email]] : []), ...(c.empresa ? [['Empresa', c.empresa]] : []), ...(c.legajo ? [['Legajo', c.legajo]] : [])].map(([k, v]) => [k, v || 'No informado']);
  return (
    <div className="mx-auto max-w-xl"><ViewHeader title="Mi perfil" onBack={back} />
      <div className="card p-6"><div className="mb-5 flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-grad text-xl font-bold text-ink">{user.displayName.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><div><h3 className="text-lg font-bold">{user.displayName}</h3><p className="text-sm text-muted">Socio FINIX Center</p></div></div>
        <dl className="divide-y divide-line/10">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
        <p className="mt-3 text-xs text-muted">Para modificar tus datos, comunicate con tu sucursal.</p></div>
      <div className="card mt-4 divide-y divide-line/10">{onChangePassword && <button onClick={() => setPw(true)} className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold hover:bg-line/5"><Lock className="h-5 w-5 text-gold-300" /><span className="flex-1">Cambiar contraseña</span><ChevronRight className="h-4 w-4 text-muted" /></button>}<div className="flex items-center gap-3 p-4"><Settings className="h-5 w-5 text-gold-300" /><span className="flex-1 text-sm font-semibold">Apariencia (claro / oscuro)</span><ThemeToggle /></div>
        <button onClick={onLogout} className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/5"><LogOut className="h-5 w-5" />Cerrar sesión</button></div>
      {pw && <PasswordModal onClose={() => setPw(false)} onSubmit={async (f) => { await onChangePassword(f); setPw(false); }} />}
    </div>
  );
}

export function RequirementsView({ back }) {
  return (<div className="mx-auto max-w-2xl"><ViewHeader title="Requisitos" onBack={back} /><p className="mb-5 text-sm text-muted">Para acceder a un crédito con FINIX necesitás:</p>
    <div className="space-y-4">{[['Crédito comercial', Briefcase, BUSINESS.requirements.comercial], ['Crédito personal', User, BUSINESS.requirements.personal]].map(([t, Icon, l]) => <div key={t} className="card p-6"><div className="mb-3 flex items-center gap-3"><Icon className="h-5 w-5 text-gold-300" /><h3 className="font-bold">{t}</h3></div><ul className="space-y-2">{l.map((x) => <li key={x} className="flex gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />{x}</li>)}</ul></div>)}</div></div>);
}
export function BranchesView({ back }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => BUSINESS.branches.filter((b) => `${b.name} ${b.address}`.toLowerCase().includes(q.toLowerCase())), [q]);
  return (<div className="mx-auto max-w-2xl"><ViewHeader title="Sucursales" onBack={back} /><p className="mb-4 text-sm text-muted">Encontrá la oficina de FINIX más cercana a vos.</p>
    <div className="relative"><Search className="pointer-events-none absolute left-4 top-3.5 h-[18px] w-[18px] text-muted" /><input className="input pl-11" placeholder="Ingresá tu código postal o ciudad" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar sucursal" /></div>
    <div className="mt-5 space-y-3">{list.length ? list.map((b) => <div key={b.name} className="card p-5"><h3 className="font-bold">{b.name}</h3><ul className="mt-2 space-y-1.5 text-sm text-muted"><li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 text-gold-300" />{b.address}</li><li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 text-gold-300" />Horario de atención: {b.hours}</li><li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 text-gold-300" />Tel.: <a href={telLink(b.phone)} className="hover:text-fg">{b.phone}</a></li></ul>
      <a className="btn-outline btn-sm mt-4" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery || b.address)}`}>Cómo llegar</a></div>) : <div className="card"><Empty title="Sin resultados" text="Probá con otra ciudad o código postal." /></div>}</div></div>);
}
export function SupportView({ back }) {
  const ch = [[MessageCircle, 'Mandar un whatsapp', waLink('Hola FINIX Center, necesito ayuda con mi cuenta.')], [Phone, 'Llamar a tu sucursal', telLink(BUSINESS.branches[0].phone)], ...(BUSINESS.email ? [[Mail, 'Enviar un mail', `mailto:${BUSINESS.email}`]] : []), ...(BUSINESS.social.instagram || BUSINESS.social.facebook ? [[Globe, 'Conocé nuestras redes', BUSINESS.social.instagram || BUSINESS.social.facebook]] : [])];
  return (<div className="mx-auto max-w-xl"><ViewHeader title="Canales de atención" onBack={back} /><p className="mb-5 text-sm text-muted">¿En qué podemos ayudarte hoy? Podés elegir cómo contactarnos.</p>
    <div className="space-y-3">{ch.map(([Icon, label, href]) => <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="card-flat flex items-center gap-4 p-5 transition hover:border-line/40"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-line/10 text-gold-300"><Icon className="h-5 w-5" /></span><span className="flex-1 font-semibold">{label}</span><ChevronRight className="h-4 w-4 text-muted" /></a>)}</div></div>);
}
export function AboutView({ back }) {
  return (<div className="mx-auto max-w-2xl"><ViewHeader title="Quiénes somos" onBack={back} /><div className="card p-7">
    <h3 className="text-xl font-bold">Tu aliado financiero para <span className="text-gold-grad">impulsarte</span> en cada etapa</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted">En FINIX Center nacimos en el Norte Argentino con un propósito claro: ser el motor que transforma proyectos en realidades. Acompañamos a cientos de socios construyendo relaciones basadas en la confianza y la cercanía. Detrás de cada consulta hay un comerciante con ganas de expandirse, un emprendedor que busca invertir o un trabajador proyectando su futuro, por eso nos amoldamos a tus necesidades con un trato directo, transparente y sin vueltas.</p>
    {[['Nuestra misión', 'Ser tu aliado financiero, brindándote soluciones simples, rápidas y a medida para que alcances tus metas comerciales y personales.'], ['Nuestra visión', 'Liderar el sector financiero regional manteniendo siempre nuestra esencia: una atención humana, personalizada y orientada a potenciar tus oportunidades.'], ['Nuestros valores', 'Integridad, honestidad, respeto y transparencia. Son los pilares que nos trajeron hasta acá.']].map(([t, d]) => <div key={t} className="mt-5"><h4 className="font-bold text-gold-300">{t}</h4><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></div>)}</div></div>);
}
