import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccentThemeService } from '../../../core/services/accent-theme.service';

@Component({
  selector: 'app-accent-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="inline-flex size-10 items-center justify-center rounded-lg border border-brand-light-border bg-brand-light-surface text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-secondary dark:hover:bg-brand-surface/80 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
      (click)="accentThemeService.toggle()"
      [attr.aria-label]="
        accentThemeService.accent() === 'orange'
          ? 'Ativar estilo verde clássico'
          : 'Ativar estilo laranja energético'
      "
      [attr.title]="
        accentThemeService.accent() === 'orange'
          ? 'Estilo laranja (atual)'
          : 'Estilo verde clássico'
      "
    >
      @if (accentThemeService.accent() === 'orange') {
        <!-- Paleta + indicador laranja -->
        <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3c-1.5 2.5-4 5.2-4 8.5a4 4 0 108 0c0-3.3-2.5-6-4-8.5z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle cx="8" cy="18" r="1.5" fill="#FF6D00" />
          <circle cx="12" cy="20" r="1.5" fill="#FF9100" />
          <circle cx="16" cy="18" r="1.5" fill="#71717A" />
        </svg>
      } @else {
        <!-- Paleta + indicador verde -->
        <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3c-1.5 2.5-4 5.2-4 8.5a4 4 0 108 0c0-3.3-2.5-6-4-8.5z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle cx="8" cy="18" r="1.5" fill="#00C853" />
          <circle cx="12" cy="20" r="1.5" fill="#00E676" />
          <circle cx="16" cy="18" r="1.5" fill="#71717A" />
        </svg>
      }
    </button>
  `,
})
export class AccentThemeToggleComponent {
  protected readonly accentThemeService = inject(AccentThemeService);
}
