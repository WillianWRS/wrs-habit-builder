import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AccentThemeService,
  type AccentTheme,
} from '../../../core/services/accent-theme.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-appearance-settings-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .theme-pulse-ring {
      animation: theme-pulse-ring 1700ms ease-in-out infinite;
    }

    @keyframes theme-pulse-ring {
      0% {
        border-color: #3f3f46;
        box-shadow: 0 0 0 0 rgb(255 255 255 / 0.24);
      }

      50% {
        border-color: #fafafa;
        box-shadow: 0 0 0 4px rgb(63 63 70 / 0.24);
      }

      100% {
        border-color: #3f3f46;
        box-shadow: 0 0 0 0 rgb(255 255 255 / 0.24);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .theme-pulse-ring {
        animation: none;
      }
    }

    .theme-premium-badge {
      left: 50%;
      top: 0;
      transform: translate(4px, 2px);
      z-index: 1;
      border: 1px solid var(--badge-accent);
      background: transparent;
      color: var(--badge-accent);
    }
  `,
  template: `
    <section aria-labelledby="appearance-settings-title">
      <h2
        id="appearance-settings-title"
        class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
      >
        Aparência
      </h2>

      <div
        class="relative mt-4 inline-grid w-fit grid-cols-2 rounded-full border border-brand-light-border bg-brand-light-bg p-1 dark:border-brand-border dark:bg-brand-bg"
        role="group"
        aria-label="Alternar modo claro e escuro"
      >
        <span
          class="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-light-surface shadow-sm transition-transform duration-250 ease-out dark:bg-brand-surface"
          [class.translate-x-full]="themeService.theme() === 'dark'"
          aria-hidden="true"
        ></span>

        <button
          type="button"
          class="relative z-[1] inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
          [class.text-brand-light-text-primary]="themeService.theme() === 'light'"
          [class.dark:text-brand-text-primary]="themeService.theme() === 'light'"
          [class.text-brand-light-text-secondary]="themeService.theme() !== 'light'"
          [class.dark:text-brand-text-secondary]="themeService.theme() !== 'light'"
          [attr.aria-pressed]="themeService.theme() === 'light'"
          (click)="setTheme('light')"
        >
          <i class="bi bi-sun text-base" aria-hidden="true"></i>
          Claro
        </button>

        <button
          type="button"
          class="relative z-[1] inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
          [class.text-brand-light-text-primary]="themeService.theme() === 'dark'"
          [class.dark:text-brand-text-primary]="themeService.theme() === 'dark'"
          [class.text-brand-light-text-secondary]="themeService.theme() !== 'dark'"
          [class.dark:text-brand-text-secondary]="themeService.theme() !== 'dark'"
          [attr.aria-pressed]="themeService.theme() === 'dark'"
          (click)="setTheme('dark')"
        >
          <i class="bi bi-moon-stars text-base" aria-hidden="true"></i>
          Escuro
        </button>
      </div>

      <h3
        class="mt-5 text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
      >
        Tema
      </h3>

      <div class="mb-4 mt-3 flex flex-wrap items-center gap-3">
        @for (accent of accentOptions; track accent.id) {
          <button
            type="button"
            class="relative inline-flex size-12 items-center justify-center rounded-full border-0 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            [class.border-4]="accentThemeService.accent() === accent.id"
            [class.theme-pulse-ring]="accentThemeService.accent() === accent.id"
            [class.opacity-60]="accentThemeService.accent() !== accent.id"
            [attr.aria-label]="'Tema ' + accent.label"
            [attr.aria-pressed]="accentThemeService.accent() === accent.id"
            (click)="setAccent(accent.id)"
          >
            <span
              class="size-7 rounded-full"
              [style.background]="accent.swatch"
              aria-hidden="true"
            ></span>
            @if (accent.premiumReady) {
              <span
                class="theme-premium-badge pointer-events-none absolute rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase leading-none tracking-wider"
                [style.--badge-accent]="accent.swatch"
                aria-hidden="true"
                >Premium</span
              >
            }
          </button>
        }
      </div>
    </section>
  `,
})
export class AppearanceSettingsPanelComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly accentThemeService = inject(AccentThemeService);
  protected readonly accentOptions: readonly {
    id: AccentTheme;
    label: string;
    swatch: string;
    premiumReady: boolean;
  }[] = [
    { id: 'orange', label: 'laranja', swatch: '#FF9100', premiumReady: false },
    { id: 'emerald', label: 'esmeralda', swatch: '#00E676', premiumReady: false },
    { id: 'red', label: 'vermelho', swatch: '#EF4444', premiumReady: true },
    { id: 'blue', label: 'azul', swatch: '#3B82F6', premiumReady: true },
    { id: 'purple', label: 'roxo', swatch: '#8B5CF6', premiumReady: true },
    { id: 'pink', label: 'rosa', swatch: '#EC4899', premiumReady: true },
    { id: 'cyan', label: 'ciano', swatch: '#06B6D4', premiumReady: true },
  ];

  protected setTheme(mode: 'light' | 'dark'): void {
    this.themeService.setTheme(mode);
  }

  protected setAccent(accent: AccentTheme): void {
    this.accentThemeService.setAccent(accent);
  }
}
