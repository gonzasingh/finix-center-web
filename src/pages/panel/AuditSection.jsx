import { useMemo, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { PageTitle, SearchBox, Select, Avatar } from './shared';
import { Badge, Empty } from '../../components/dashboard/ui';
import { AUDIT_ACTIONS } from '../../lib/credit';
import { fmtDateTime, normalize } from '../../lib/format';

export default function AuditSection({ audit }) {
  const [q, setQ] = useState(''); const [actor, setActor] = useState('todos'); const [action, setAction] = useState('todas');
  const actors = useMemo(() => [...new Map(audit.map((a) => [a.actorId, a.actorName]))], [audit]);
  const rows = audit.filter((a) => (actor === 'todos' || a.actorId === actor) && (action === 'todas' || a.action === action) && (!q || normalize(`${a.entityLabel} ${a.summary} ${a.actorName}`).includes(normalize(q))));

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Fecha y hora', 'Colaborador', 'Email', 'Acción', 'Registro', 'Detalle', 'Cambios'].map(esc).join(',')];
    rows.forEach((a) => lines.push([fmtDateTime(a.ts, true), a.actorName, a.actorEmail, AUDIT_ACTIONS[a.action]?.label || a.action, a.entityLabel, a.summary, (a.changes || []).map((c) => `${c.label}: ${c.from} -> ${c.to}`).join(' | ')].map(esc).join(',')));
    const url = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `auditoria-finix-${new Date().toISOString().slice(0, 10)}.csv` });
    link.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle title="Auditoría" sub="Registro inmutable de quién hizo cada modificación o aprobación y en qué horario." right={<button className="btn-outline" onClick={exportCsv} disabled={!rows.length}><Download className="h-4 w-4" />Exportar CSV</button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3"><SearchBox value={q} onChange={setQ} placeholder="Buscar socio, acción o colaborador…" />
        <Select label="Colaborador" value={actor} onChange={setActor} options={[['todos', 'Todos los colaboradores'], ...actors]} />
        <Select label="Acción" value={action} onChange={setAction} options={[['todas', 'Todas las acciones'], ...Object.entries(AUDIT_ACTIONS).map(([k, v]) => [k, v.label])]} />
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-emerald-400" />Solo lectura · {rows.length} registros</span></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead className="border-b border-line/15"><tr><th className="th">Fecha y hora</th><th className="th">Colaborador</th><th className="th">Acción</th><th className="th">Registro</th><th className="th">Detalle</th></tr></thead>
        <tbody className="divide-y divide-line/10">{rows.map((a) => <tr key={a.id} className="align-top hover:bg-line/5">
          <td className="td whitespace-nowrap font-mono text-xs">{fmtDateTime(a.ts, true)}</td>
          <td className="td"><span className="flex items-center gap-2.5"><Avatar name={a.actorName} size="h-8 w-8" /><span><span className="block font-medium">{a.actorName}</span><span className="text-[11px] text-muted">{a.actorEmail}</span></span></span></td>
          <td className="td"><Badge tone={AUDIT_ACTIONS[a.action]?.tone}>{AUDIT_ACTIONS[a.action]?.label || a.action}</Badge></td>
          <td className="td font-medium">{a.entityLabel}</td>
          <td className="td text-muted">{a.summary}{a.changes?.length > 0 && <ul className="mt-1.5 space-y-0.5 text-xs">{a.changes.map((c) => <li key={c.field}>{c.label}: <s>{c.from || '—'}</s> → <b className="text-fg">{c.to || '—'}</b></li>)}</ul>}</td></tr>)}</tbody></table></div>
        {!rows.length && <Empty title="Sin registros" text="No hay movimientos con esos filtros." />}</div>
    </>
  );
}
