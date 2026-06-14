import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { AppearanceSettingsPanelComponent } from '../../../../shared/components/appearance-settings-panel/appearance-settings-panel.component';
import { BetaFeedbackPanelComponent } from '../../../../shared/components/beta-feedback-panel/beta-feedback-panel.component';
import { DataManagementPanelComponent } from '../../../../shared/components/data-management-panel/data-management-panel.component';
import { LocalNotificationService } from '../../../../core/services/local-notification.service';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppNavComponent,
    AppearanceSettingsPanelComponent,
    BetaFeedbackPanelComponent,
    DataManagementPanelComponent,
  ],
  template: `
    <app-nav />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header class="mb-6 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Configurações
        </h1>
      </header>

      <div
        class="space-y-8 rounded-2xl border border-brand-light-border bg-brand-light-surface p-6 dark:border-brand-border dark:bg-brand-surface"
      >
        <app-appearance-settings-panel />

        <div class="relative py-1" aria-hidden="true">
          <div
            class="h-px w-full bg-gradient-to-r from-transparent via-brand-light-border to-transparent dark:via-brand-border"
          ></div>
          <div
            class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-light-primary/60 dark:bg-brand-primary/60"
          ></div>
        </div>

        <section aria-labelledby="notifications-settings-title" class="space-y-3">
          <h2
            id="notifications-settings-title"
            class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            Notificações locais
          </h2>
          <p class="text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
            Dispara 1h antes para hábitos com horário e esperados no Hoje.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-brand-light-primary px-4 py-2 text-sm font-semibold text-brand-light-primary transition-colors hover:bg-brand-light-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-primary dark:text-brand-primary dark:hover:bg-brand-primary/10 dark:focus-visible:ring-brand-primary"
            (click)="enableLocalNotifications()"
          >
            <i class="bi bi-bell" aria-hidden="true"></i>
            Ativar notificações
          </button>
        </section>

        <div class="relative mt-8 py-1" aria-hidden="true">
          <div
            class="h-px w-full bg-gradient-to-r from-transparent via-brand-light-border to-transparent dark:via-brand-border"
          ></div>
          <div
            class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-light-primary/60 dark:bg-brand-primary/60"
          ></div>
        </div>

        <app-beta-feedback-panel />

        <div class="relative mt-8 py-1" aria-hidden="true">
          <div
            class="h-px w-full bg-gradient-to-r from-transparent via-brand-light-border to-transparent dark:via-brand-border"
          ></div>
          <div
            class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-light-primary/60 dark:bg-brand-primary/60"
          ></div>
        </div>

        <app-data-management-panel />
      </div>
    </main>
  `,
})
export class SettingsPageComponent {
  private readonly notifications = inject(LocalNotificationService);

  protected enableLocalNotifications(): void {
    this.notifications.requestPermission();
  }
}
