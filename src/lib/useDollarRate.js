import { useEffect, useRef, useState } from 'react';
import { BUSINESS } from '../config/business';
import { cacheDollar, fetchLiveDollar, manualDollar, readCachedDollar } from '../services/exchangeRates';

// Devuelve { buy, sell, updatedAt, source, live }.
// - Muestra al instante el último valor guardado (o el manual de BUSINESS.usd) y lo reemplaza por el de la API.
// - Se refresca cada BUSINESS.usdLive.refreshMs y al volver a la pestaña. Si la API falla, conserva el último valor.
export default function useDollarRate() {
  const cfg = BUSINESS.usdLive || {};
  const [rate, setRate] = useState(() => {
    const cached = cfg.enabled ? readCachedDollar() : null;
    return { ...(cached || manualDollar()), live: Boolean(cached) };
  });
  const lastLoad = useRef(0);

  useEffect(() => {
    if (!cfg.enabled) return undefined;
    const refreshMs = cfg.refreshMs || 5 * 60 * 1000;
    let alive = true;
    let ctrl;

    const load = async () => {
      ctrl?.abort();
      ctrl = new AbortController();
      try {
        const fresh = await fetchLiveDollar(ctrl.signal);
        if (!alive) return;
        lastLoad.current = Date.now();
        setRate({ ...fresh, live: true });
        cacheDollar(fresh);
      } catch { /* se mantiene el último valor mostrado */ }
    };

    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, refreshMs);
    const onVisible = () => { if (!document.hidden && Date.now() - lastLoad.current > refreshMs / 2) load(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      alive = false;
      clearInterval(timer);
      ctrl?.abort();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [cfg.enabled, cfg.refreshMs]);

  return rate;
}
