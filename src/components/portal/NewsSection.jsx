import { useNews } from '../../lib/news';
import NewsCarousel from './NewsCarousel';
import { Skeleton } from '../dashboard/ui';

// Sección "Novedades para vos": título + carrusel. Se oculta sola si no hay novedades vigentes.
// sections: secciones del portal a las que puede apuntar un banner.
export default function NewsSection({ sections, onWeb, onSection, title = 'Novedades para vos' }) {
  const { items, ready } = useNews();
  if (ready && !items.length) return null;
  const open = (n) => {
    if (n.action?.type === 'web') onWeb(n);
    else if (n.action?.type === 'app' && sections.includes(n.action.section)) onSection(n.action.section);
  };
  return (
    <section>
      <h3 className="mb-3 text-lg font-bold">{title}</h3>
      {ready ? <NewsCarousel items={items} onOpen={open} /> : <Skeleton className="h-40 !rounded-3xl" />}
    </section>
  );
}
