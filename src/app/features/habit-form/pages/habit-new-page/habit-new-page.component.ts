import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { HabitFormComponent } from '../../../../shared/components/habit-form/habit-form.component';
import { sanitizeHabitFormReturnUrl } from '../../../../core/utils/habit-form-return-url.utils';
import type { AppNavTab } from '../../../../shared/components/app-nav/app-nav.component';
import type { HabitFormPageHost } from '../habit-form-page-host';

@Component({
  selector: 'app-habit-new-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, HabitFormComponent],
  template: `
    <app-nav [activeTab]="navTab" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <div class="mb-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-light-text-secondary transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
          aria-label="Voltar"
          (click)="onBack()"
        >
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Voltar
        </button>
      </div>

      <app-habit-form
        [habitId]="null"
        (saved)="onSaved()"
        (cancelled)="navigateBack()"
      />
    </main>
  `,
})
export class HabitNewPageComponent implements HabitFormPageHost {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly formRef = viewChild(HabitFormComponent);

  private readonly returnUrl = sanitizeHabitFormReturnUrl(
    this.route.snapshot.queryParamMap.get('returnUrl'),
  );

  protected readonly navTab: AppNavTab =
    this.returnUrl === '/habits' ? 'habits' : 'today';

  confirmLeave(): Promise<boolean> {
    return this.formRef()?.confirmLeave() ?? Promise.resolve(true);
  }

  protected onSaved(): void {
    void this.router.navigateByUrl(this.returnUrl);
  }

  protected onBack(): void {
    void this.formRef()?.requestCancel();
  }

  protected navigateBack(): void {
    void this.router.navigateByUrl(this.returnUrl);
  }
}
