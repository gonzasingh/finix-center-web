import { useMemo, useState } from 'react';
import { PageTitle, SearchBox, Select, Avatar } from './shared';
import { Badge, Empty } from '../../components/dashboard/ui';
import { BUSINESS } from '../../config/business';
import { creditStats, nextInstallment, overdueCount } from '../../lib/credit';
import { moneyInt, fmtDate, normalize } from '../../lib/format';

export default function CreditsSection({ credits, clients }) {
  const [q, setQ] = useState(''); const [f, setF] = useState('activo');
  const byId = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients]);
  const rows = credits.filter((c) => byId[c.clientId]).map((c) => ({ c, cl: byId[c.clientId], s: creditStats(c), nq: nextInstallment(c), od: overdueCount(c) }))
    .filter(({ c, cl, od }) => (!q || normalize(`${cl.nombre} ${cl.dni} ${c.numero}`).includes(normalize(q))) && (f === 'todos' || (f === 'mora' ? od > 0 : c.estado === f)))
    .sort((a, b) => b.c.inicio.localeCompare(a.c.inicio));
  const total = rows.filter((r) => r.c.estado === 'activo').reduce((s, r) => s + r.s.saldo, 0);
  return (
    <>
      <PageTitle title="Créditos" sub="Cartera completa con saldos y vencimientos" right={<div className="card-flat px-5 py-3 text-right"><p className="text-[11px] uppercase tracking-wider text-muted">Saldo activo filtrado</p><p className="text-xl font-bold text-gold-grad">{moneyInt(total)}</p></div>} />
      <div className="mb-4 flex flex-wrap gap-3"><SearchBox value={q} onChange={setQ} placeholder="Buscar socio, DNI o N° de crédito…" /><Select label="Estado" value={f} onChange={setF} options={[['activo', 'Activos'], ['mora', 'Con mora'], ['cancelado', 'Cancelados'], ['todos', 'Todos']]} /></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead className="border-b border-line/15"><tr><th className="th">Crédito</th><th className="th">Socio</th><th className="th">Plan</th><th className="th">Avance</th><th className="th">Saldo</th><th className="th">Próx. vencimiento</th><th className="th">Estado</th></tr></thead>
        <tbody className="divide-y divide-line/10">{rows.map(({ c, cl, s, nq, od }) => <tr key={c.id} className="hover:bg-line/5"><td className="td font-semibold">{c.numero}<span className="block text-xs font-normal text-muted">{fmtDate(c.inicio)}</span></td>
          <td className="td"><span className="flex items-center gap-2.5"><Avatar name={cl.nombre} size="h-8 w-8" /><span><span className="block font-medium">{cl.nombre}</span><span className="text-xs text-muted">DNI {cl.dni}</span></span></span></td>
          <td className="td">{BUSINESS.plans[c.plan].label}<span className="block text-xs text-muted">{moneyInt(c.valorCuota)} × {c.cuotas}</span></td>
          <td className="td"><div className="w-28"><div className="h-1.5 overflow-hidden rounded-full bg-line/15"><div className="h-full rounded-full bg-gold-grad" style={{ width: `${s.avance}%` }} /></div><span className="text-[11px] text-muted">{c.cuotasPagas}/{c.cuotas} cuotas</span></div></td>
          <td className="td font-semibold">{c.estado === 'activo' ? moneyInt(s.saldo) : '—'}</td><td className="td">{nq ? fmtDate(nq.due) : '—'}</td>
          <td className="td">{c.estado === 'cancelado' ? <Badge tone="gray">Cancelado</Badge> : od ? <Badge tone="rose" dot>{od} vencida{od > 1 ? 's' : ''}</Badge> : <Badge tone="emerald" dot>Al día</Badge>}</td></tr>)}</tbody></table></div>
        {!rows.length && <Empty title="Sin créditos para mostrar" />}</div>
    </>
  );
}
