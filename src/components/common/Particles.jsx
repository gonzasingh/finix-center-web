import { useEffect, useRef } from 'react';

// Polvo de estrellas dorado (canvas). Se pausa fuera de pantalla y respeta prefers-reduced-motion.
export default function Particles({ count = 70 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d'); let w, h, raf, visible = true;
    const colors = ['#F3DE97', '#E2BF60', '#B08B3C', '#FFFFFF'];
    const resize = () => { const r = canvas.getBoundingClientRect(); w = canvas.width = r.width; h = canvas.height = r.height; };
    resize();
    const ps = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .12, a: Math.random() * .6 + .2, c: colors[(Math.random() * colors.length) | 0] }));
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (const p of ps) {
          p.x += p.vx; p.y += p.vy; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
          ctx.globalAlpha = p.a; ctx.fillStyle = p.c; ctx.shadowBlur = 8; ctx.shadowColor = '#E2BF60';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize); };
  }, [count]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full opacity-80" aria-hidden="true" />;
}
