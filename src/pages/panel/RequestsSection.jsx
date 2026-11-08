import { useState } from 'react';
import { Check, X, Search, MessageSquareWarning, Eye } from 'lucide-react';
import { api } from '../../services';
import { PageTitle, Avatar, ScoreBadge } from './shared';
import { Badge, Modal, Empty } from '../../components/dashboard/ui';
import { BUSINESS } from '../../config/business';
import { REQUEST_STATES, simulate } from '../../lib/credit';
import { moneyInt, fmtDateTime } from '../../lib/format';

export default function RequestsSection({ requests, clients, actor, refresh, toast }) {
  const [tab, setTab] = useState('pendientes'); const [dlg, setDlg] = useState(null); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const byId = Object.fromEntries(clients.map((c) => [c.id, c]));
  const open = (r) => !['aprobada', 'rechazada'].includes(r.estado);
  const rows = requests.filter((r) => byId[r.clientId] && (tab === 'todas' || (tab === 'pendientes' ? open(r) : !open(r)))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const run = async (r, action, comentario = '') => {
    setBusy(true);
    try {
      await api.reviewRequest(actor, r.id, action, comentario);
      toast({ revision: 'Solicitud pasada a revisión', observar: 'Solicitud observada. El socio fue notificado.', aprobar: '¡Crédito aprobado! Se generó el crédito del socio.', rechazar: 'Solicitud rechazada' }[action] + ' · Registrado en auditoría');
      setDlg(null); setText(''); await refresh();
    } catch (e) { toast(e.message || 'No se pudo completar la acción', 'error'); } finally { setBusy(false); }
  };
  const ask = (r, action) => { setText(''); setDlg({ r, action }); };
  const meta = { observar: ['Observar solicitud', 'Indicá qué información o documentación necesita el socio.', true, 'Enviar observación'], rechazar: ['Rechazar solicitud', 'Podés dejar un motivo (opcional).', false, 'Rechazar'], aprobar: ['Aprobar crédito', null, false, 'Aprobar y generar crédito'] };

  return (
    <>
      <PageTitle title="Solicitudes" sub="Gestioná las solicitudes de crédito. Cada acción queda registrada con tu nombre y horario." />
      <div className="mb-5 inline-flex rounded-2xl border border-line/20 bg-surface/60 p-1">{[['pendientes', 'Pendientes'], ['resueltas', 'Resueltas'], ['todas', 'Todas']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-gold-grad text-ink' : 'text-muted hover:text-fg'}`}>{l}</button>)}</div>
      {!rows.length ? <div className="card"><Empty title="No hay solicitudes en esta vista" /></div> : (
        <div className="grid gap-4 lg:grid-cols-2">{rows.map((r) => { const c = byId[r.clientId]; const sim = simulate({ amount: r.monto, periods: r.cuotas, promo: r.promo }); const last = r.timeline[r.timeline.length - 1]; return (
          <article key={r.id} className="card p-5">
            <div className="flex items-start gap-3"><Avatar name={c.nombre} size="h-11 w-11" /><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{c.nombre}</h3><p className="text-xs text-muted">DNI {c.dni} · Solicitud #{r.numero}</p></div><Badge tone={REQUEST_STATES[r.estado].tone}>{REQUEST_STATES[r.estado].label}</Badge></div>
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-line/5 p-4 text-sm"><div><p className="text-[11px] text-muted">Monto</p><p className="font-bold">{moneyInt(r.monto)}</p></div><div><p className="text-[11px] text-muted">Plan</p><p className="font-bold">{r.cuotas} {BUSINESS.plans[r.plan].label.toLowerCase()}s</p></div><div><p className="text-[11px] text-muted">Cuota est.</p><p className="font-bold">{moneyInt(sim.installment)}</p></div></div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted"><span>Score:</span><ScoreBadge score={c.score} />{r.promo && <Badge tone="gold">Supermiércoles {Math.round(BUSINESS.rates.supermiercoles * 100)}%</Badge>}</div>
            {r.comentario && <p className="mt-3 rounded-xl border border-line/10 p-3 text-xs text-muted">“{r.comentario}”</p>}
            <p className="mt-3 text-[11px] text-muted">Último movimiento: {last.detalle} · {fmtDateTime(last.fecha)}{last.by ? ` · ${last.by}` : ''}</p>
            {open(r) && <div className="mt-4 flex flex-wrap gap-2 border-t border-line/10 pt-4">
              {['ingresada', 'correccion_recibida'].includes(r.estado) && <button className="btn-outline btn-sm" disabled={busy} onClick={() => run(r, 'revision')}><Search className="h-3.5 w-3.5" />Pasar a revisión</button>}
              <button className="btn-outline btn-sm" onClick={() => ask(r, 'observar')}><MessageSquareWarning className="h-3.5 w-3.5" />Observar</button>
              <button className="btn-gold btn-sm" onClick={() => ask(r, 'aprobar')}><Check className="h-3.5 w-3.5" />Aprobar</button>
              <button className="btn-danger btn-sm" onClick={() => ask(r, 'rechazar')}><X className="h-3.5 w-3.5" />Rechazar</button></div>}
          </article>); })}</div>)}

      {dlg && <Modal title={meta[dlg.action][0]} onClose={() => setDlg(null)} footer={<><button className="btn-ghost" onClick={() => setDlg(null)}>Cancelar</button><button className={dlg.action === 'rechazar' ? 'btn-danger' : 'btn-gold'} disabled={busy || (meta[dlg.action][2] && !text.trim())} onClick={() => run(dlg.r, dlg.action, text)}>{busy ? 'Procesando…' : meta[dlg.action][3]}</button></>}>
        <p className="text-sm text-muted">Solicitud #{dlg.r.numero} de <b className="text-fg">{byId[dlg.r.clientId].nombre}</b> por <b className="text-fg">{moneyInt(dlg.r.monto)}</b>.</p>
        {dlg.action === 'aprobar' ? <div className="mt-4 rounded-2xl border border-line/25 bg-line/5 p-4 text-sm">Se generará un crédito de <b>{dlg.r.cuotas}</b> cuotas {BUSINESS.plans[dlg.r.plan].label.toLowerCase()}s de <b>{moneyInt(simulate({ amount: dlg.r.monto, periods: dlg.r.cuotas, promo: dlg.r.promo }).installment)}</b>. La aprobación quedará registrada a nombre de <b>{actor.displayName}</b> con fecha y hora.</div>
          : <><label className="label mt-4">{dlg.action === 'observar' ? 'Observación para el socio' : 'Motivo'}</label><textarea className="input min-h-24" value={text} onChange={(e) => setText(e.target.value)} placeholder={meta[dlg.action][1]} maxLength={240} autoFocus /></>}
      </Modal>}
    </>
  );
}
