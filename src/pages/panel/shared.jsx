import { Badge } from '../../components/dashboard/ui';
import { scoreInfo, creditStats, overdueCount } from '../../lib/credit';

export const PageTitle = ({ title, sub, right }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>{right}</div>
);
export const ScoreBadge = ({ score }) => { const s = scoreInfo(score); return <Badge tone={s.tone}>{score} · {s.label}</Badge>; };
export const Avatar = ({ name, size = 'h-10 w-10' }) => <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-line/15 text-sm font-bold text-gold-300`}>{name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')}</span>;

// Resumen por socio: créditos activos, saldo y cuotas vencidas.
export function clientSummary(client, credits) {
  const mine = credits.filter((c) => c.clientId === client.id);
  const active = mine.filter((c) => c.estado === 'activo');
  return { mine, active, saldo: active.reduce((s, c) => s + creditStats(c).saldo, 0), overdue: active.reduce((s, c) => s + overdueCount(c), 0) };
}
export const SearchBox = ({ value, onChange, placeholder }) => (
  <input className="input max-w-xs !py-2.5" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
);
export const Select = ({ value, onChange, options, label }) => (
  <select className="input !w-auto !py-2.5" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
);
