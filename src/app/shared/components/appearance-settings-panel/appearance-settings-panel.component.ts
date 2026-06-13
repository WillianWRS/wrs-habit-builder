import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccentThemeService } from '../../../core/services/accent-theme.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-appearance-settings-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="appearance-settings-title">
      <h2
        id="appearance-settings-title"
        class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
      >
        Aparência
      </h2>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary"
          (click)="themeService.toggle()"
        >
          <i
            class="bi text-base text-brand-light-primary dark:text-brand-primary"
            [class.bi-sun]="themeService.theme() === 'dark'"
            [class.bi-moon-stars]="themeService.theme() === 'light'"
            aria-hidden="true"
          ></i>
          {{ themeService.theme() === 'dark' ? 'Modo claro' : 'Modo escuro' }}
        </button>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary"
          (click)="accentThemeService.toggle()"
        >
          <i
            class="bi bi-palette text-base text-brand-light-primary dark:text-brand-primary"
            aria-hidden="true"
          ></i>
          Alterar tema
        </button>
      </div>
    </section>
  `,
})
export class AppearanceSettingsPanelComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly accentThemeService = inject(AccentThemeService);
}
