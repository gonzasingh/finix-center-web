import { useEffect, useRef, useState } from 'react';

// Una novedad: texto a la izquierda (etiqueta, título y bajada) y una imagen chica a la derecha.
function NewsCard({ n, onOpen, single, index, total }) {
  const [broken, setBroken] = useState(false);
  return (
    <button onClick={() => onOpen(n)} disabled={!n.action} aria-label={`${n.title}. Novedad ${index + 1} de ${total}`}
      className={`flex min-h-[9.75rem] shrink-0 snap-start items-stretch overflow-hidden rounded-3xl border border-line/15 bg-surface/70 p-2.5 text-left transition enabled:active:scale-[.99] disabled:cursor-default ${single ? 'w-full' : 'w-[88%]'}`}>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-2 pl-3 pr-2">
        {n.tag && <span className="inline-flex self-start rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-ink">{n.tag}</span>}
        <span className="text-[17px] font-bold leading-snug">{n.title}</span>
        {n.text && <span className="text-sm leading-snug text-muted">{n.text}</span>}
      </span>
      {n.image && !broken && (
        <span className="relative ml-1 w-[38%] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gold-300/30 to-gold-500/10">
          <img src={n.image} alt="" draggable="false" onError={() => setBroken(true)} className={`absolute inset-0 h-full w-full ${n.fit === 'contain' ? 'object-contain p-3' : 'object-cover'}`} />
        </span>
      )}
    </button>
  );
}

// Carrusel: desliza con el dedo, deja asomar la tarjeta siguiente, avanza solo y muestra los puntos debajo.
export default function NewsCarousel({ items, onOpen, autoplayMs = 6000 }) {
  const ref = useRef(null);
  const paused = useRef(false);
  const [idx, setIdx] = useState(0);
  const count = items.length;

  const step = () => { const c = ref.current?.children; return c && c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : (ref.current?.clientWidth || 1); };
  const current = () => {
    const el = ref.current; if (!el) return 0;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) return count - 1; // la última tarjeta no llega al borde izquierdo
    return Math.min(count - 1, Math.round(el.scrollLeft / step()));
  };
  const goTo = (i) => ref.current?.scrollTo({ left: i * step(), behavior: 'smooth' });
  const onScroll = () => { const i = current(); setIdx((p) => (p === i ? p : i)); };

  useEffect(() => { setIdx((p) => Math.min(p, Math.max(0, count - 1))); }, [count]);
  useEffect(() => {
    if (count < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => { if (!paused.current && document.visibilityState === 'visible') goTo((current() + 1) % count); }, autoplayMs);
    return () => clearInterval(t);
  }, [count, autoplayMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const hold = () => { paused.current = true; };
  const release = () => { setTimeout(() => { paused.current = false; }, 4000); };

  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Novedades">
      <div ref={ref} onScroll={onScroll} onPointerDown={hold} onPointerUp={release} onPointerCancel={release} onTouchStart={hold} onTouchEnd={release}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {items.map((n, i) => <NewsCard key={n.id} n={n} onOpen={onOpen} single={count === 1} index={i} total={count} />)}
      </div>
      {count > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {items.map((n, i) => (
            <button key={n.id} onClick={() => goTo(i)} aria-label={`Ir a la novedad ${i + 1}`} aria-current={i === idx} className={`h-2 rounded-full transition-all ${i === idx ? 'w-5 bg-gold-500' : 'w-2 bg-line/30'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
