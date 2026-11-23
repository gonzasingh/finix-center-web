import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Spinner } from '../dashboard/ui';
import { useNews } from '../../lib/news';

// Página web mostrada dentro del portal (pantalla completa, con botón volver). Acepta una URL https://… o una ruta de /public.
export default function NewsWebView({ id, onBack }) {
  const { items } = useNews();
  const item = items.find((n) => n.id === id);
  const src = item?.action?.type === 'web' ? item.action.url : '';
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => { setLoaded(false); setSlow(false); const t = setTimeout(() => setSlow(true), 10000); return () => clearTimeout(t); }, [src]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base">
      <div className="flex items-center gap-3 border-b border-line/15 px-4 py-2.5">
        <button onClick={onBack} aria-label="Volver" className="flex h-10 w-10 items-center justify-center rounded-full border border-line/25 text-muted transition hover:bg-line/10 hover:text-fg"><ArrowLeft className="h-5 w-5" /></button>
        <h2 className="flex-1 truncate text-xl font-bold">Novedades</h2>
        {src && <a href={src} target="_blank" rel="noreferrer" aria-label="Abrir en el navegador" className="flex h-10 w-10 items-center justify-center rounded-full border border-line/25 text-muted transition hover:bg-line/10 hover:text-fg"><ExternalLink className="h-[18px] w-[18px]" /></a>}
      </div>
      <div className="relative flex-1 bg-white">
        {!src ? <div className="flex h-full flex-col items-center justify-center gap-4 bg-base p-8 text-center"><p className="text-sm text-muted">Esta novedad ya no está disponible.</p><button onClick={onBack} className="btn-gold">Volver</button></div> : <>
          {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-base"><Spinner className="h-8 w-8" /></div>}
          <iframe key={src} title={item?.title || 'Novedad'} src={src} onLoad={() => setLoaded(true)} className="h-full w-full border-0" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
        </>}
      </div>
      {src && slow && !loaded && (
        <p className="border-t border-line/15 px-4 py-3 text-center text-xs text-muted">¿Tarda en cargar? <a href={src} target="_blank" rel="noreferrer" className="font-semibold text-gold-ink underline">Abrir en el navegador</a></p>
      )}
    </div>
  );
}
