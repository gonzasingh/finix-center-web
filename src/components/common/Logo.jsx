import logo from '../../assets/logo-finix.png';
import logoWhite from '../../assets/logo-finix-blanco.png';
import isotipo from '../../assets/isotipo-finix.png';

// Logo original de FINIX Center (isotipo + wordmark). `white` = versión monocromática para fondos dorados.
export default function Logo({ variant = 'full', className = 'h-16', white = false }) {
  const src = variant === 'icon' ? isotipo : white ? logoWhite : logo;
  return <img src={src} alt="FINIX Center" className={`w-auto select-none ${className}`} draggable="false" />;
}
