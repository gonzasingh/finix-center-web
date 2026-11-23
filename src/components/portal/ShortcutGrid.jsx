// Cuadrícula de atajos (4 por fila). La usan Inicio del socio y la bienvenida, así tienen exactamente el mismo tamaño y forma
// en cualquier pantalla (el ancho máximo evita que crezcan distinto en pantallas anchas).
export default function ShortcutGrid({ items, onSelect }) {
  return (
    <div className="grid max-w-[34rem] grid-cols-4 gap-2.5 sm:gap-3">
      {items.map(([key, Icon, label]) => (
        <button key={key} onClick={() => onSelect(key)} className="group flex aspect-[1/1.02] flex-col items-center justify-center gap-2 rounded-2xl bg-surface2/80 px-1 text-center transition hover:-translate-y-1 hover:bg-line/15 hover:shadow-gold">
          <Icon className="h-6 w-6 text-gold-300 transition group-hover:scale-110 sm:h-7 sm:w-7" /><span className="text-[11px] font-semibold leading-tight sm:text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
}
