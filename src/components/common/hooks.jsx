import { useEffect, useRef, useState } from 'react';

export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, seen];
}

export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, seen] = useInView();
  return <Tag ref={ref} style={{ '--d': `${delay}ms` }} className={`reveal ${seen ? 'in' : ''} ${className}`}>{children}</Tag>;
}

export function CountUp({ to, suffix = '', prefix = '', duration = 1600 }) {
  const [ref, seen] = useInView();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setV(to);
    let raf; const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / duration); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return <span ref={ref}>{prefix}{v.toLocaleString('es-AR')}{suffix}</span>;
}

export function SpotCard({ children, className = '', as: Tag = 'div', ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <Tag onMouseMove={onMove} className={`spot ${className}`} {...rest}>{children}</Tag>;
}
