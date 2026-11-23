/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: v('bg'),
        surface: v('surface'),
        surface2: v('surface2'),
        fg: v('text'),
        muted: v('muted'),
        line: v('line'),
        ink: '#17110A',
        cream: '#F3ECDA',
        gold: { 100: '#FBF1CE', 200: '#F3DE97', 300: '#E2BF60', 400: '#C9A24B', 500: '#B08B3C', 600: '#A28033', 700: '#8A6A2C', 800: '#6E5220' },
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      boxShadow: {
        gold: '0 8px 30px -8px rgba(226,191,96,.45)',
        'gold-lg': '0 14px 44px -8px rgba(226,191,96,.6)',
        glass: '0 20px 60px -20px rgba(0,0,0,.55)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
      animation: { marquee: 'marquee 276s linear infinite', float: 'float 7s ease-in-out infinite' },
    },
  },
  plugins: [],
};
