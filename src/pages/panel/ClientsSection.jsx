import { useMemo, useState } from 'react';
import { Eye, Pencil, Trash2, UserPlus, Phone, MapPin, IdCard, History, CheckCircle2 } from 'lucide-react';
import { api } from '../../services';
import { Badge, Drawer, Modal, Empty, ScoreGauge, Field, Spinner } from '../../components/dashboard/ui';
import { PageTitle, ScoreBadge, Avatar, SearchBox, Select, clientSummary } from './shared';
import { BUSINESS } from '../../config/business';
import { creditStats, scoreInfo, AUDIT_ACTIONS, nextInstallment } from '../../lib/credit';
import { moneyInt, money, fmtDate, fmtDateTime, normalize } from '../../lib/format';

function ClientForm({ initial, onCancel, onSubmit, submitLabel }) {
  const [f, setF] = useState({ nombre: '', dni: '', direccion: '', telefono: '', ...initial });
  const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try { await onSubmit(f); } catch (err) { setErrors(err.fields || { _: err.message || 'No se pudo guardar' }); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Nombre completo" error={errors.nombre}><input className="input" value={f.nombre} onChange={set('nombre')} autoFocus /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="DNI" error={errors.dni}><input className="input" inputMode="numeric" value={f.dni} onChange={set('dni')} /></Field><Field label="Teléfono" error={errors.telefono}><input className="input" value={f.telefono} onChange={set('telefono')} placeholder="+54 9 381 555 0000" /></Field></div>
      <Field label="Dirección" error={errors.direccion}><input className="input" value={f.direccion} onChange={set('direccion')} /></Field>
      {errors._ && <p className="text-sm text-rose-400">{errors._}</p>}
      <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button><button className="btn-gold" disabled={busy}>{busy ? <Spinner className="h-4 w-4 !text-ink" /> : submitLabel}</button></div>
      <p className="text-center text-[11px] text-muted">Quedará registrado quién realizó este cambio y en qué horario.</p>
    </form>
  );
}

function ClientDrawer({ client, credits, audit, actor, startEdit, onClose, refresh, toast }) {
  const [edit, setEdit] = useState(startEdit);
  const sum = clientSummary(client, credits); const sc = scoreInfo(client.score);
  const history = [...sum.mine].sort((a, b) => b.inicio.localeCompare(a.inicio));
  const log = audit.filter((a) => a.clientId === client.id).slice(0, 6);
  const save = async (data) => { await api.updateClient(actor, client.id, data); toast('Datos del socio actualizados'); await refresh(); setEdit(false); };
  const Info = ({ icon: Icon, label, value }) => <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><div><p className="text-[11px] uppercase tracking-wider text-muted">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>;
  return (
    <Drawer title={client.nombre} subtitle={`Legajo ${client.legajo} · DNI ${client.dni}`} onClose={onClose}>
      <section className="card-flat p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Registro del socio</h3>{!edit && <button className="btn-outline btn-sm" onClick={() => setEdit(true)}><Pencil className="h-3.5 w-3.5" />Editar</button>}</div>
        {edit ? <ClientForm initial={client} onCancel={() => setEdit(false)} onSubmit={save} submitLabel="Guardar cambios" /> : (
          <div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Info icon={IdCard} label="Nombre completo" value={client.nombre} /></div><Info icon={IdCard} label="DNI" value={client.dni} /><Info icon={Phone} label="Teléfono" value={client.telefono} /><div className="sm:col-span-2"><Info icon={MapPin} label="Dirección" value={client.direccion} /></div></div>)}
        {client.updatedByName && !edit && <p className="mt-4 flex items-center gap-2 border-t border-line/10 pt-3 text-xs text-muted"><History className="h-3.5 w-3.5" />Última modificación por <b className="text-fg">{client.updatedByName}</b> · {fmtDateTime(client.updatedAt)}</p>}
      </section>

      <section className="card-flat mt-4 p-5"><h3 className="mb-3 font-bold">Score de pago</h3>
        <ScoreGauge score={client.score} color={sc.color} label={sc.label} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs"><div className="rounded-xl bg-line/5 p-3"><p className="text-muted">Créditos</p><p className="text-lg font-bold">{sum.mine.length}</p></div><div className="rounded-xl bg-line/5 p-3"><p className="text-muted">Activos</p><p className="text-lg font-bold">{sum.active.length}</p></div><div className="rounded-xl bg-line/5 p-3"><p className="text-muted">Cuotas vencidas</p><p className={`text-lg font-bold ${sum.overdue ? 'text-rose-400' : ''}`}>{sum.overdue}</p></div></div></section>

      <section className="mt-4"><h3 className="mb-3 font-bold">Créditos activos</h3>
        {sum.active.length ? <div className="space-y-3">{sum.active.map((c) => { const s = creditStats(c); const nq = nextInstallment(c); return <div key={c.id} className="card-flat p-4"><div className="flex items-center justify-between"><b>Crédito {c.numero}</b><Badge tone="emerald" dot>Activo</Badge></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><p className="text-muted">Saldo</p><p className="text-sm font-bold">{moneyInt(s.saldo)}</p></div><div><p className="text-muted">Cuota</p><p className="text-sm font-bold">{moneyInt(c.valorCuota)}</p></div><div><p className="text-muted">Próx. venc.</p><p className="text-sm font-bold">{nq ? fmtDate(nq.due) : '—'}</p></div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/15"><div className="h-full rounded-full bg-gold-grad" style={{ width: `${s.avance}%` }} /></div><p className="mt-1.5 text-[11px] text-muted">{c.cuotasPagas}/{c.cuotas} cuotas · {BUSINESS.plans[c.plan].label}</p></div>; })}</div> : <div className="card-flat"><Empty title="Sin créditos activos" /></div>}</section>

      <section className="mt-6"><h3 className="mb-3 font-bold">Historial de créditos</h3>
        {history.length ? <div className="card-flat divide-y divide-line/10">{history.map((c) => { const s = creditStats(c); return <div key={c.id} className="flex items-center gap-3 p-4 text-sm"><div className="flex-1"><b>Crédito {c.numero}</b><p className="text-xs text-muted">Inicio {fmtDate(c.inicio)} · {c.cuotas} cuotas {BUSINESS.plans[c.plan].label.toLowerCase()}s</p></div><div className="text-right"><p className="font-semibold">{moneyInt(s.total)}</p>{c.estado === 'activo' ? <Badge tone="emerald">Activo</Badge> : <Badge tone="gray"><CheckCircle2 className="h-3 w-3" />Cancelado</Badge>}</div></div>; })}</div> : <div className="card-flat"><Empty title="Sin historial" /></div>}</section>

      <section className="mt-6"><h3 className="mb-3 font-bold">Registro de actividad</h3>
        {log.length ? <ul className="space-y-3">{log.map((a) => <li key={a.id} className="card-flat p-3 text-xs"><div className="flex items-center justify-between gap-2"><Badge tone={AUDIT_ACTIONS[a.action]?.tone}>{AUDIT_ACTIONS[a.action]?.label}</Badge><span className="text-muted">{fmtDateTime(a.ts)}</span></div><p className="mt-2"><b>{a.actorName}</b> · {a.summary}</p>{a.changes?.map((c) => <p key={c.field} className="mt-1 text-muted">{c.label}: <s>{c.from}</s> → <b className="text-fg">{c.to}</b></p>)}</li>)}</ul> : <p className="text-sm text-muted">Sin movimientos registrados.</p>}</section>
    </Drawer>
  );
}

export default function ClientsSection({ clients, credits, audit, actor, refresh, toast }) {
  const [q, setQ] = useState(''); const [filter, setFilter] = useState('todos');
  const [drawer, setDrawer] = useState(null); const [creating, setCreating] = useState(false); const [deleting, setDeleting] = useState(null); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false);

  const rows = useMemo(() => clients.map((c) => ({ c, s: clientSummary(c, credits) })).filter(({ c, s }) => {
    const hit = !q || normalize(`${c.nombre} ${c.dni} ${c.telefono} ${c.direccion}`).includes(normalize(q));
    const f = filter === 'todos' || (filter === 'activos' && s.active.length) || (filter === 'mora' && s.overdue) || (filter === 'riesgo' && c.score < 50) || (filter === 'sin' && !s.active.length);
    return hit && f;
  }).sort((a, b) => a.c.nombre.localeCompare(b.c.nombre)), [clients, credits, q, filter]);

  const create = async (data) => { await api.createClient(actor, data); toast('Socio dado de alta correctamente'); await refresh(); setCreating(false); };
  const remove = async () => { setBusy(true); try { await api.deleteClient(actor, deleting.id, reason.trim()); toast('Socio dado de baja. La acción quedó registrada.'); setDeleting(null); setReason(''); await refresh(); } catch { toast('No se pudo eliminar al socio', 'error'); } finally { setBusy(false); } };
  const drawerClient = drawer && clients.find((c) => c.id === drawer.id);

  return (
    <>
      <PageTitle title="Socios" sub={`${clients.length} socios registrados`} right={<button className="btn-gold" onClick={() => setCreating(true)}><UserPlus className="h-4 w-4" />Nuevo socio</button>} />
      <div className="mb-4 flex flex-wrap gap-3"><SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, DNI, teléfono…" /><Select label="Filtrar" value={filter} onChange={setFilter} options={[['todos', 'Todos los socios'], ['activos', 'Con crédito activo'], ['sin', 'Sin crédito activo'], ['mora', 'Con cuotas vencidas'], ['riesgo', 'Score en riesgo']]} /></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[860px]">
        <thead className="border-b border-line/15"><tr><th className="th">Socio</th><th className="th">Teléfono</th><th className="th">Créditos activos</th><th className="th">Saldo</th><th className="th">Score de pago</th><th className="th text-right">Acciones</th></tr></thead>
        <tbody className="divide-y divide-line/10">{rows.map(({ c, s }) => <tr key={c.id} className="transition hover:bg-line/5">
          <td className="td"><button className="flex items-center gap-3 text-left" onClick={() => setDrawer({ id: c.id })}><Avatar name={c.nombre} /><span><span className="block font-semibold">{c.nombre}</span><span className="text-xs text-muted">DNI {c.dni}</span></span></button></td>
          <td className="td text-muted">{c.telefono}</td>
          <td className="td">{s.active.length ? <span className="flex items-center gap-2"><b>{s.active.length}</b>{s.overdue > 0 && <Badge tone="rose">{s.overdue} vencida{s.overdue > 1 ? 's' : ''}</Badge>}</span> : <span className="text-muted">—</span>}</td>
          <td className="td font-semibold">{s.saldo ? moneyInt(s.saldo) : '—'}</td><td className="td"><ScoreBadge score={c.score} /></td>
          <td className="td"><div className="flex justify-end gap-1">{[[Eye, 'Ver ficha', () => setDrawer({ id: c.id })], [Pencil, 'Editar', () => setDrawer({ id: c.id, edit: true })], [Trash2, 'Eliminar', () => setDeleting(c)]].map(([Icon, l, fn]) => <button key={l} onClick={fn} aria-label={`${l} ${c.nombre}`} title={l} className={`rounded-xl p-2 transition hover:bg-line/15 ${l === 'Eliminar' ? 'text-rose-400' : 'text-muted hover:text-fg'}`}><Icon className="h-[18px] w-[18px]" /></button>)}</div></td></tr>)}</tbody></table></div>
        {!rows.length && <Empty title="No hay socios que coincidan" text="Probá con otra búsqueda o filtro." />}</div>

      {drawerClient && <ClientDrawer key={drawer.id + String(drawer.edit)} client={drawerClient} credits={credits} audit={audit} actor={actor} startEdit={!!drawer.edit} onClose={() => setDrawer(null)} refresh={refresh} toast={toast} />}
      {creating && <Modal title="Nuevo socio" onClose={() => setCreating(false)}><ClientForm onCancel={() => setCreating(false)} onSubmit={create} submitLabel="Dar de alta" /></Modal>}
      {deleting && <Modal title="Eliminar socio" onClose={() => setDeleting(null)} footer={<><button className="btn-ghost" onClick={() => setDeleting(null)}>Cancelar</button><button className="btn-danger" onClick={remove} disabled={busy}>{busy ? 'Eliminando…' : 'Sí, eliminar'}</button></>}>
        <p className="text-sm text-muted">Vas a dar de baja a <b className="text-fg">{deleting.nombre}</b> (DNI {deleting.dni}). Su historial se conserva y la acción quedará registrada a nombre de <b className="text-fg">{actor.displayName}</b>.</p>
        <label className="label mt-4">Motivo (opcional)</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: Alta duplicada" /></Modal>}
    </>
  );
}
