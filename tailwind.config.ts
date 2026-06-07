import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Acentos compartilhados (Light + Dark)
        'brand-accent-orange': '#FF6D00',
        'brand-accent-purple': '#7B2CBF',

        // Tokens Light (padrão sem prefixo dark:)
        'brand-light-bg': '#F8FAFC',
        'brand-light-surface': '#FFFFFF',
        'brand-light-text-primary': '#0F172A',
        'brand-light-text-secondary': '#475569',
        'brand-light-primary': '#00C853',
        'brand-light-secondary': '#1E40AF',

        // Tokens Dark (via modificador dark:)
        'brand-bg': '#0F172A',
        'brand-surface': '#1E293B',
        'brand-text-primary': '#FFFFFF',
        'brand-text-secondary': '#90A4AE',
        'brand-primary': '#00E676',
        'brand-secondary': '#1565C0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
} satisfies Config;
