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
        'brand-light-bg': 'var(--brand-light-bg)',
        'brand-light-surface': 'var(--brand-light-surface)',
        'brand-light-border': 'var(--brand-light-border)',
        'brand-light-text-primary': 'var(--brand-light-text-primary)',
        'brand-light-text-secondary': 'var(--brand-light-text-secondary)',
        'brand-light-primary': 'var(--accent-light)',
        'brand-light-secondary': '#1E40AF',

        // Tokens Dark (via modificador dark:)
        'brand-bg': 'var(--brand-bg)',
        'brand-surface': 'var(--brand-surface)',
        'brand-border': 'var(--brand-border)',
        'brand-text-primary': 'var(--brand-text-primary)',
        'brand-text-secondary': 'var(--brand-text-secondary)',
        'brand-primary': 'var(--accent-dark)',
        'brand-secondary': '#1565C0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
} satisfies Config;
