import { useMemo, useState } from 'react';
import { Calculator, Sparkles, MessageCircle } from 'lucide-react';
import { BUSINESS, waLink } from '../../config/business';
import { simulate } from '../../lib/credit';
import { moneyInt } from '../../lib/format';

const AMOUNT_SHORTCUTS = [
  { value: 300000, label: '$300.000' },
  { value: 500000, label: '$500.000' },
  { value: 1000000, label: '$1M' },
  { value: 3000000, label: '$3M' },
];

// Simulador de crédito (mismas reglas que la app: interés simple por período).
export default function Simulator({ compact = false, onRequest }) {
  const [amount, setAmount] = useState(300000);
  const [creditType, setCreditType] = useState('personal');
  const [plan, setPlan] = useState('mensual');
  const [periods, setPeriods] = useState(BUSINESS.simulator.personal.plans.mensual.default);
  const [promo, setPromo] = useState(false);
  const [name, setName] = useState('');
  const credit = BUSINESS.simulator[creditType];
  const amountRules = credit.amount;
  const p = credit.plans[plan];
  const promoAvailable = Boolean(p.promoRate);
  const rate = promo && promoAvailable ? p.promoRate : p.rate;
  const r = useMemo(() => simulate({ amount, periods, rate }), [amount, periods, rate]);
  const pct = Math.round(r.rate * 100);

  const changeCreditType = (type) => {
    const nextCredit = BUSINESS.simulator[type];
    const nextPlan = Object.keys(nextCredit.plans)[0];
    setCreditType(type);
    setPlan(nextPlan);
    setPeriods(nextCredit.plans[nextPlan].default);
    setAmount((current) => Math.min(current, nextCredit.amount.max));
    setPromo(false);
  };
  const changePlan = (k) => { setPlan(k); setPeriods(credit.plans[k].default); setPromo(false); };
  const msg = `Hola FINIX Center! Mi nombre es ${name.trim() || 'un futuro socio'}. Quisiera solicitar un ${credit.label.toLowerCase()} de ${moneyInt(amount)} en ${periods} ${p.unit} (cuota estimada ${moneyInt(r.installment)}).`;

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

      <div className="mb-5 grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de crédito">
        {Object.entries(BUSINESS.simulator).map(([key, option]) => (
          <button key={key} role="tab" aria-selected={creditType === key} onClick={() => changeCreditType(key)} className={`rounded-xl border py-2.5 text-xs font-semibold transition ${creditType === key ? 'border-line bg-gold-grad text-ink' : 'border-line/25 text-muted hover:border-line/60'}`}>{option.label}</button>
        ))}
      </div>

      <div className="mb-1 flex items-center justify-between gap-3">
        <label htmlFor="sim-amount" className="label !mb-0">¿Cuánto necesitás?</label>
        <div className="relative w-44">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gold-300">$</span>
          <input
            id="sim-amount"
            type="number"
            inputMode="numeric"
            min={amountRules.min}
            max={amountRules.max}
            step={1}
            value={amount || ''}
            onChange={(e) => setAmount(Math.min(Number(e.target.value) || 0, amountRules.max))}
            onBlur={() => setAmount((value) => Math.min(amountRules.max, Math.max(amountRules.min, value || amountRules.min)))}
            className="w-full rounded-xl border border-line/25 bg-base/60 py-2 pl-8 pr-3 text-right text-xl font-bold text-gold-300 outline-none transition focus:border-line/60"
            aria-label="Monto del crédito"
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {AMOUNT_SHORTCUTS.map(({ value, label }) => (
          <button
            key={value}
            disabled={value > amountRules.max}
            onClick={() => setAmount(value)}
            className={`rounded-xl border px-1 py-1.5 text-[11px] font-semibold transition ${value > amountRules.max ? 'cursor-not-allowed border-line/10 text-muted/40' : amount === value ? 'border-line bg-line/20 text-fg' : 'border-line/20 text-muted hover:border-line/50'}`}
          >{label}</button>
        ))}
      </div>
      <p className="mt-2 text-right text-[10px] text-muted">Mínimo {moneyInt(amountRules.min)} · Máximo {moneyInt(amountRules.max)}</p>

      <div className="mt-5">
        <span className="label">Plan de financiación</span>
        <div className={`grid gap-2 ${Object.keys(credit.plans).length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`} role="radiogroup">
          {Object.entries(credit.plans).map(([k, v]) => (
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

      {promoAvailable && (
        <button onClick={() => setPromo((v) => !v)} aria-pressed={promo} className={`mt-5 flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${promo ? 'border-line bg-line/15' : 'border-line/20 hover:border-line/50'}`}>
          <Sparkles className="h-4 w-4 shrink-0 text-gold-300" />
          <span className="flex-1"><b>Supermiércoles:</b> la tasa baja de {Math.round(p.rate * 100)}% a {Math.round(p.promoRate * 100)}% por período.</span>
          <span className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${promo ? 'bg-gold-400' : 'bg-line/25'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${promo ? 'translate-x-4' : ''}`} /></span>
        </button>
      )}

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
        <button className="btn-gold mt-4 w-full" disabled={amount < amountRules.min || amount > amountRules.max} onClick={() => onRequest({ monto: amount, plan, cuotas: periods, tipoCredito: creditType, promo, rate: r.rate })}>Solicitar este crédito</button>
      ) : (
        <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-gold mt-3 w-full"><MessageCircle className="h-4 w-4" />Solicitar por WhatsApp</a>
      )}
      <p className="mt-3 text-center text-[11px] text-muted">Simulación orientativa, no representa una aprobación. Las condiciones definitivas son confirmadas por la empresa.</p>
    </div>
  );
}
