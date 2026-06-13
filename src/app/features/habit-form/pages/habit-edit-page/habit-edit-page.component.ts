import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { HabitFormComponent } from '../../../../shared/components/habit-form/habit-form.component';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import type { HabitFormPageHost } from '../habit-form-page-host';

@Component({
  selector: 'app-habit-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, HabitFormComponent],
  template: `
    <app-nav activeTab="habits" />

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

      @if (habitId()) {
        <app-habit-form
          [habitId]="habitId()"
          (saved)="onSaved()"
          (cancelled)="navigateBack()"
        />
      }
    </main>
  `,
})
export class HabitEditPageComponent implements HabitFormPageHost {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly storage = inject(HabitStorageService);

  private readonly formRef = viewChild(HabitFormComponent);

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly habitId = computed(() => {
    const id = this.routeId();

    if (!id || !this.storage.getHabitById(id)) {
      return null;
    }

    return id;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || !this.storage.getHabitById(id)) {
      void this.router.navigate(['/habits']);
    }
  }

  confirmLeave(): Promise<boolean> {
    return this.formRef()?.confirmLeave() ?? Promise.resolve(true);
  }

  protected onSaved(): void {
    void this.router.navigate(['/habits']);
  }

  protected onBack(): void {
    void this.formRef()?.requestCancel();
  }

  protected navigateBack(): void {
    void this.router.navigate(['/habits']);
  }
}
