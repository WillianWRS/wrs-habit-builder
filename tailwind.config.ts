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
        'brand-light-nav': 'var(--brand-light-nav)',
        'brand-light-nav-border': 'var(--brand-light-nav-border)',

        // Tokens Dark (via modificador dark:)
        'brand-bg': 'var(--brand-bg)',
        'brand-nav': 'var(--brand-nav)',
        'brand-nav-border': 'var(--brand-nav-border)',
        'brand-surface': 'var(--brand-surface)',
        'brand-border': 'var(--brand-border)',
        'brand-text-primary': 'var(--brand-text-primary)',
        'brand-text-secondary': 'var(--brand-text-secondary)',
        'brand-primary': 'var(--accent-dark)',
        'brand-secondary': '#1565C0',

        'action-activate': 'var(--action-activate-text)',
        'action-activate-border': 'var(--action-activate-border)',
        'action-activate-border-hover': 'var(--action-activate-border-hover)',
        'action-activate-ring': 'var(--action-activate-ring)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
} satisfies Config;
