import { useMemo, useState } from 'react';
import { Calculator, Sparkles, MessageCircle } from 'lucide-react';
import { BUSINESS, waLink } from '../../config/business';
import { simulate, isWednesday } from '../../lib/credit';
import { moneyInt } from '../../lib/format';

// Simulador de crédito (mismas reglas que la app: interés simple por período).
export default function Simulator({ compact = false, onRequest }) {
  const [amount, setAmount] = useState(300000);
  const [plan, setPlan] = useState('semanal');
  const [periods, setPeriods] = useState(BUSINESS.plans.semanal.default);
  const [promo, setPromo] = useState(isWednesday());
  const [name, setName] = useState('');
  const p = BUSINESS.plans[plan];
  const r = useMemo(() => simulate({ amount, periods, promo }), [amount, periods, promo]);
  const pct = Math.round(r.rate * 100);

  const changePlan = (k) => { setPlan(k); setPeriods(BUSINESS.plans[k].default); };
  const msg = `Hola FINIX Center! Mi nombre es ${name.trim() || 'un futuro socio'}. Quisiera solicitar un crédito de ${moneyInt(amount)} en ${periods} ${p.unit} (cuota estimada ${moneyInt(r.installment)}).`;

  return (
    <div className={`card relative overflow-hidden ${compact ? 'p-5' : 'p-6 sm:p-7'}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-700 via-gold-300 to-gold-600" />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-gold-300">Calculá tu cuota estimada</span>
          <h3 className="text-xl font-bold">Simulador de crédito</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/30 bg-line/10 text-gold-300"><Calculator className="h-5 w-5" /></div>
      </div>

      <div className="mb-1 flex items-end justify-between">
        <label htmlFor="sim-amount" className="label !mb-0">¿Cuánto necesitás?</label>
        <span className="text-2xl font-bold text-gold-grad">{moneyInt(amount)}</span>
      </div>
      <input id="sim-amount" type="range" className="w-full" min={BUSINESS.amount.min} max={BUSINESS.amount.max} step={BUSINESS.amount.step} value={amount} onChange={(e) => setAmount(+e.target.value)} />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {BUSINESS.amount.chips.map((c) => (
          <button key={c} onClick={() => setAmount(c)} className={`rounded-xl border px-1 py-1.5 text-[11px] font-semibold transition ${amount === c ? 'border-line bg-line/20 text-fg' : 'border-line/20 text-muted hover:border-line/50'}`}>{c >= 1e6 ? '$1M' : moneyInt(c)}</button>
        ))}
      </div>

      <div className="mt-5">
        <span className="label">Plan de financiación</span>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {Object.entries(BUSINESS.plans).map(([k, v]) => (
            <button key={k} role="radio" aria-checked={plan === k} onClick={() => changePlan(k)} className={`rounded-xl border py-2 text-xs font-semibold transition ${plan === k ? 'border-line bg-gold-grad text-ink' : 'border-line/25 text-muted hover:border-line/60'}`}>{v.label}</button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-end justify-between">
          <label htmlFor="sim-periods" className="label !mb-0">Cantidad de {p.unit}</label>
          <span className="text-lg font-bold">{periods}</span>
        </div>
        <input id="sim-periods" type="range" className="w-full" min={p.min} max={p.max} value={periods} onChange={(e) => setPeriods(+e.target.value)} />
      </div>

      <button onClick={() => setPromo((v) => !v)} aria-pressed={promo} className={`mt-5 flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${promo ? 'border-line bg-line/15' : 'border-line/20 hover:border-line/50'}`}>
        <Sparkles className="h-4 w-4 shrink-0 text-gold-300" />
        <span className="flex-1"><b>Supermiércoles:</b> pedilo un miércoles y la tasa baja de {Math.round(BUSINESS.rates.standard * 100)}% a {Math.round(BUSINESS.rates.supermiercoles * 100)}% por período.</span>
        <span className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${promo ? 'bg-gold-400' : 'bg-line/25'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${promo ? 'translate-x-4' : ''}`} /></span>
      </button>

      <div className="mt-5 rounded-2xl border border-line/30 bg-base/60 p-4">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">Cuota {p.label.toLowerCase()}</span>
          <div className="text-4xl font-bold text-gold-grad" aria-live="polite">{moneyInt(r.installment)}</div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line/15 pt-3 text-center text-[11px]">
          <div><dt className="text-muted">Cuotas</dt><dd className="mt-0.5 text-sm font-bold">{periods}</dd></div>
          <div><dt className="text-muted">Interés ({pct}%)</dt><dd className="mt-0.5 text-sm font-bold">{moneyInt(r.interest)}</dd></div>
          <div><dt className="text-muted">Total</dt><dd className="mt-0.5 text-sm font-bold">{moneyInt(r.total)}</dd></div>
        </dl>
      </div>

      {!onRequest && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre (opcional)" className="input mt-4" aria-label="Tu nombre" />}
      {onRequest ? (
        <button className="btn-gold mt-4 w-full" onClick={() => onRequest({ monto: amount, plan, cuotas: periods })}>Solicitar este crédito</button>
      ) : (
        <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-gold mt-3 w-full"><MessageCircle className="h-4 w-4" />Solicitar por WhatsApp</a>
      )}
      <p className="mt-3 text-center text-[11px] text-muted">Simulación orientativa, no representa una aprobación. Las condiciones definitivas son confirmadas por la empresa.</p>
    </div>
  );
}
