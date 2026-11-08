import { useEffect } from 'react';
import { X, Loader2, AlertTriangle, Inbox } from 'lucide-react';

const TONES = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', gold: 'border-line/40 bg-line/15 text-gold-300', amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400', sky: 'border-sky-500/30 bg-sky-500/10 text-sky-400', violet: 'border-violet-500/30 bg-violet-500/10 text-violet-400', gray: 'border-line/20 bg-line/5 text-muted',
};
export const Badge = ({ tone = 'gray', children, dot, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TONES[tone]} ${className}`}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}
  </span>
);

export const Spinner = ({ className = 'h-5 w-5' }) => <Loader2 className={`animate-spin text-gold-300 ${className}`} />;
export const Skeleton = ({ className = 'h-24' }) => <div className={`skeleton ${className}`} />;
export const Empty = ({ title = 'Sin resultados', text }) => (
  <div className="flex flex-col items-center gap-2 px-6 py-14 text-center"><Inbox className="h-9 w-9 text-muted/60" /><p className="font-semibold">{title}</p>{text && <p className="text-sm text-muted">{text}</p>}</div>
);
export const ErrorBox = ({ text }) => <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400"><AlertTriangle className="h-5 w-5 shrink-0" />{text}</div>;

function useEsc(onClose) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [onClose]);
}

export function Modal({ title, onClose, children, footer, size = 'max-w-lg' }) {
  useEsc(onClose);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`anim-pop relative w-full ${size} rounded-3xl border border-line/25 bg-surface p-6 shadow-glass`}>
        <div className="mb-4 flex items-start justify-between gap-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-muted hover:bg-line/10"><X className="h-5 w-5" /></button></div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ title, subtitle, onClose, children }) {
  useEsc(onClose);
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="anim-slide absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line/25 bg-base shadow-glass">
        <div className="flex items-start justify-between gap-4 border-b border-line/15 px-6 py-5">
          <div><h3 className="text-lg font-bold">{title}</h3>{subtitle && <p className="text-sm text-muted">{subtitle}</p>}</div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-muted hover:bg-line/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}

export function ScoreGauge({ score, color, label, size = 150 }) {
  const r = 54, c = Math.PI * r, off = c * (1 - Math.min(100, score) / 100);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 140 84" className="h-full w-full">
        <path d="M16 74 A54 54 0 0 1 124 74" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="11" strokeLinecap="round" />
        <path d="M16 74 A54 54 0 0 1 124 74" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center"><div className="text-3xl font-bold leading-none">{score}</div><div className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</div></div>
    </div>
  );
}

export const Field = ({ label, error, children }) => (
  <div><label className="label">{label}</label>{children}{error && <p className="mt-1 text-xs text-rose-400">{error}</p>}</div>
);
