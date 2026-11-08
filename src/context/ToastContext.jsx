import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, message, type }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="anim-pop pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-line/30 bg-surface px-4 py-3 text-sm shadow-glass">
            {t.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} aria-label="Cerrar"><X className="h-4 w-4 text-muted" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
