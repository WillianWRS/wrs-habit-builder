import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { AppearanceSettingsPanelComponent } from '../../../../shared/components/appearance-settings-panel/appearance-settings-panel.component';
import { DataManagementPanelComponent } from '../../../../shared/components/data-management-panel/data-management-panel.component';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppNavComponent,
    AppearanceSettingsPanelComponent,
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

        <hr class="border-brand-light-border dark:border-brand-border" />

        <app-data-management-panel />
      </div>
    </main>
  `,
})
export class SettingsPageComponent {}
