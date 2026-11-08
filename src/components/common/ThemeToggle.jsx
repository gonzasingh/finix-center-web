import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-line/30 bg-line/5 text-gold-300 transition hover:border-line/70 hover:bg-line/10 ${className}`}>
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px] text-gold-700" />}
    </button>
  );
}
