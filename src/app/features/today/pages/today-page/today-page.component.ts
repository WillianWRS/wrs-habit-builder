import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DemoModeService } from '../../../../core/services/demo-mode.service';
import { HabitFormModalService } from '../../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { DayProgressComponent } from '../../components/day-progress/day-progress.component';
import { HabitCardComponent } from '../../components/habit-card/habit-card.component';

@Component({
  selector: 'app-today-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, DayProgressComponent, HabitCardComponent],
  template: `
    <app-nav activeTab="today" [hideNewHabit]="showEmpty()" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 md:px-6 md:pb-10 lg:px-8"
      [class]="showEmpty() ? 'pt-4 md:pt-5' : 'pt-6 md:pt-10'"
    >
      @if (!showEmpty()) {
        <header class="mb-6 space-y-4 md:mb-8">
          <h1
            class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
          >
            Hoje · {{ todayLabel() }}
          </h1>

          <app-day-progress [done]="doneCount()" [total]="totalCount()" />
        </header>
      }

      @if (showEmpty()) {
        <section
          class="relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-brand-light-border bg-brand-light-surface px-8 py-8 text-center shadow-sm dark:border-brand-border dark:bg-brand-surface md:px-10 md:py-10"
          aria-labelledby="empty-title"
        >
            <div
              class="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-light-primary/10 blur-2xl dark:bg-brand-primary/10"
              aria-hidden="true"
            ></div>
            <div
              class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-brand-light-primary/5 blur-3xl dark:bg-brand-primary/5"
              aria-hidden="true"
            ></div>

            <div
              class="relative flex size-16 items-center justify-center rounded-2xl border border-brand-light-border bg-brand-light-bg dark:border-brand-border dark:bg-brand-bg"
              aria-hidden="true"
            >
              <i
                class="bi bi-inbox text-3xl text-brand-light-text-secondary dark:text-brand-text-secondary"
              ></i>
            </div>

            <h2
              id="empty-title"
              class="relative mt-5 font-display text-2xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
            >
              Construa hábitos agora
            </h2>

            <button
              type="button"
              class="relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              (click)="openHabitForm()"
            >
              <i class="bi bi-plus-lg text-xs" aria-hidden="true"></i>
              Criar primeiro hábito
            </button>
        </section>
      } @else {
        @if (demoMode.isActive()) {
          <p
            class="mb-4 rounded-lg border border-brand-light-primary/25 bg-brand-light-primary/5 px-4 py-2 text-center text-xs text-brand-light-text-secondary dark:border-brand-primary/25 dark:bg-brand-primary/5 dark:text-brand-text-secondary"
          >
            Modo demonstrativo — alterações não são salvas no navegador.
          </p>
        }

        <ul class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li>
              <app-habit-card
                [name]="habit.name"
                [time]="habit.time"
                [category]="habit.category"
                [trigger1]="habit.trigger1"
                [trigger2]="habit.trigger2"
                [motivation1]="habit.motivation1"
                [motivation2]="habit.motivation2"
                [minimumAction]="habit.minimumAction"
                [dayCount]="habit.dayCount"
                [completed]="habit.completed"
                [accent]="habit.accent"
                [previousDayCompleted]="habit.previousDayCompleted"
                (markToggle)="toggleHabit(habit.id)"
              />
            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class TodayPageComponent {
  private readonly storage = inject(HabitStorageService);
  private readonly habitFormModal = inject(HabitFormModalService);
  protected readonly demoMode = inject(DemoModeService);

  protected readonly habits = computed(() =>
    this.demoMode.isActive()
      ? this.demoMode.cards()
      : this.storage.todayHabitCards(),
  );

  protected readonly showEmpty = computed(
    () => !this.demoMode.isActive() && this.habits().length === 0,
  );

  protected readonly todayLabel = computed(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }).format(new Date());
  });

  protected readonly doneCount = computed(
    () => this.habits().filter((habit) => habit.completed).length,
  );

  protected readonly totalCount = computed(() => this.habits().length);

  protected openHabitForm(): void {
    this.habitFormModal.open();
  }

  protected toggleHabit(id: string): void {
    if (this.demoMode.isActive()) {
      this.demoMode.toggleHabit(id);
      return;
    }

    this.storage.toggleCompletion(id);
  }
}
