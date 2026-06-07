import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-brand-light-text-secondary transition-colors hover:bg-slate-50 hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:border-brand-surface dark:bg-brand-surface dark:text-brand-text-secondary dark:hover:bg-brand-surface/80 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
      (click)="themeService.toggle()"
      [attr.aria-label]="
        themeService.theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
      "
      [attr.title]="themeService.theme() === 'dark' ? 'Modo claro' : 'Modo escuro'"
    >
      @if (themeService.theme() === 'dark') {
        <!-- Sol: indica que pode mudar para Light -->
        <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      } @else {
        <!-- Lua: indica que pode mudar para Dark -->
        <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 14.5A8.5 8.5 0 1112.5 3a6.5 6.5 0 009.5 11.5z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
