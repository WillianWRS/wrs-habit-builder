import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BETA_FEEDBACK_EMAIL,
  BETA_FEEDBACK_FORM_URL,
} from '../../../core/constants/beta-feedback.constants';

@Component({
  selector: 'app-beta-feedback-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section aria-labelledby="beta-feedback-title">
      <h2
        id="beta-feedback-title"
        class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
      >
        Beta fechado
      </h2>
      <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
        Ajude a melhorar o app com feedback estruturado. Leva cerca de 3 minutos.
      </p>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          [href]="feedbackFormUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary"
        >
          <i class="bi bi-chat-square-text" aria-hidden="true"></i>
          Enviar feedback (beta)
        </a>

        <a
          routerLink="/privacy"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-light-border px-4 py-2 text-sm font-medium text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
        >
          Política de privacidade
        </a>
      </div>

      <p class="mt-3 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
        Dúvidas:
        <a
          [href]="'mailto:' + contactEmail"
          class="text-brand-light-primary underline underline-offset-2 dark:text-brand-primary"
        >
          {{ contactEmail }}
        </a>
      </p>
    </section>
  `,
})
export class BetaFeedbackPanelComponent {
  protected readonly feedbackFormUrl = BETA_FEEDBACK_FORM_URL;
  protected readonly contactEmail = BETA_FEEDBACK_EMAIL;
}
