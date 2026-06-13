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

      <div class="mt-3 flex items-center gap-3">
        <button
          type="button"
          class="inline-flex size-12 items-center justify-center rounded-full border-0 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
          [class.border-4]="accentThemeService.accent() === 'orange'"
          [class.theme-pulse-ring]="accentThemeService.accent() === 'orange'"
          [class.opacity-60]="accentThemeService.accent() !== 'orange'"
          [attr.aria-label]="'Tema laranja'"
          [attr.aria-pressed]="accentThemeService.accent() === 'orange'"
          (click)="setAccent('orange')"
        >
          <span class="size-7 rounded-full bg-[#FF9100]"></span>
        </button>

        <button
          type="button"
          class="inline-flex size-12 items-center justify-center rounded-full border-0 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
          [class.border-4]="accentThemeService.accent() === 'emerald'"
          [class.theme-pulse-ring]="accentThemeService.accent() === 'emerald'"
          [class.opacity-60]="accentThemeService.accent() !== 'emerald'"
          [attr.aria-label]="'Tema esmeralda'"
          [attr.aria-pressed]="accentThemeService.accent() === 'emerald'"
          (click)="setAccent('emerald')"
        >
          <span class="size-7 rounded-full bg-[#00E676]"></span>
        </button>
      </div>
    </section>
  `,
})
export class AppearanceSettingsPanelComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly accentThemeService = inject(AccentThemeService);

  protected setTheme(mode: 'light' | 'dark'): void {
    this.themeService.setTheme(mode);
  }

  protected setAccent(accent: AccentTheme): void {
    this.accentThemeService.setAccent(accent);
  }
}
