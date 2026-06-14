import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { buildDayHistory } from '../../../../core/utils/day-history.utils';
import { computeHabitAdherence } from '../../../../core/utils/habit-adherence.utils';
import { computeWeeklySummary } from '../../../../core/utils/weekly-summary.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { DayHistoryModalComponent } from '../../components/day-history-modal/day-history-modal.component';
import { MonthHeatmapComponent } from '../../components/month-heatmap/month-heatmap.component';

@Component({
  selector: 'app-progress-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, MonthHeatmapComponent, DayHistoryModalComponent],
  template: `
    <app-nav />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-28 pt-6 md:max-w-2xl md:px-6 md:pb-10 md:pt-10 lg:max-w-3xl lg:px-8"
    >
      <header class="mb-6 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Progresso
        </h1>
        <p
          class="mt-2 max-w-2xl text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          Calendário mensal com a intensidade de hábitos concluídos por dia.
          Toque em um dia para ver o resumo.
        </p>

        <div class="mt-3 flex flex-wrap gap-2">
          <span
            class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary"
            [attr.aria-label]="
              'Adesão média nos últimos 7 dias: ' +
              adherenceSummary().sevenDays.percentage +
              ' por cento. ' +
              adherenceSummary().sevenDays.completed +
              ' de ' +
              adherenceSummary().sevenDays.expected +
              ' feitos'
            "
          >
            Adesão média nos últimos 7 dias:
            {{ adherenceSummary().sevenDays.percentage }}% ·
            {{ adherenceSummary().sevenDays.completed }} de
            {{ adherenceSummary().sevenDays.expected }} feitos
          </span>
          <span
            class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary"
            [attr.aria-label]="
              'Adesão média nos últimos 30 dias: ' +
              adherenceSummary().thirtyDays.percentage +
              ' por cento. ' +
              adherenceSummary().thirtyDays.completed +
              ' de ' +
              adherenceSummary().thirtyDays.expected +
              ' feitos'
            "
          >
            Adesão média nos últimos 30 dias:
            {{ adherenceSummary().thirtyDays.percentage }}% ·
            {{ adherenceSummary().thirtyDays.completed }} de
            {{ adherenceSummary().thirtyDays.expected }} feitos
          </span>
        </div>

        <section
          class="mt-4 rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface"
          aria-labelledby="weekly-summary-title"
        >
          <h2
            id="weekly-summary-title"
            class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            Resumo semanal (7 dias)
          </h2>

          @if (!weeklySummary().hasEnoughData) {
            <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              Ainda sem dados suficientes desta semana.
            </p>
            <p class="text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              Conclua alguns hábitos e volte para ver seu resumo.
            </p>
          } @else {
            <div class="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <article
                class="rounded-lg border border-brand-light-border bg-brand-light-bg p-3 dark:border-brand-border dark:bg-brand-bg"
              >
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Melhor dia
                </p>
                <p class="font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                  {{ weeklySummary().bestDay.label }}
                </p>
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  {{ weeklySummary().bestDay.value }}
                </p>
              </article>
              <article
                class="rounded-lg border border-brand-light-border bg-brand-light-bg p-3 dark:border-brand-border dark:bg-brand-bg"
              >
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Pior dia
                </p>
                <p class="font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                  {{ weeklySummary().worstDay.label }}
                </p>
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  {{ weeklySummary().worstDay.value }}
                </p>
              </article>
              <article
                class="rounded-lg border border-brand-light-border bg-brand-light-bg p-3 dark:border-brand-border dark:bg-brand-bg"
              >
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Hábito de maior adesão
                </p>
                <p class="font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                  {{ weeklySummary().topHabit.label }}
                </p>
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  {{ weeklySummary().topHabit.value }}
                </p>
              </article>
              <article
                class="rounded-lg border border-brand-light-border bg-brand-light-bg p-3 dark:border-brand-border dark:bg-brand-bg"
              >
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Hábito de menor adesão
                </p>
                <p class="font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                  {{ weeklySummary().lowHabit.label }}
                </p>
                <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                  {{ weeklySummary().lowHabit.value }}
                </p>
              </article>
            </div>
          }
        </section>
      </header>

      <app-month-heatmap
        [year]="visibleYear()"
        [month]="visibleMonth()"
        [habits]="storage.habitsReadonly()"
        [completions]="storage.completionsReadonly()"
        [todayKey]="currentDay.todayKey()"
        (monthChange)="onMonthChange($event)"
        (dayClick)="openDay($event)"
      />
    </main>

    @if (selectedSnapshot(); as snapshot) {
      <app-day-history-modal
        [snapshot]="snapshot"
        (dismissed)="closeDayModal()"
      />
    }
  `,
})
export class ProgressPageComponent {
  protected readonly storage = inject(HabitStorageService);
  protected readonly currentDay = inject(CurrentDayService);

  protected readonly visibleYear = signal(this.currentDay.today().getFullYear());
  protected readonly visibleMonth = signal(this.currentDay.today().getMonth());
  protected readonly selectedDateKey = signal<string | null>(null);
  protected readonly adherenceSummary = computed(() => {
    const activeHabits = this.storage
      .habitsReadonly()
      .filter((habit) => !habit.archived);
    const completions = this.storage.completionsReadonly();
    const referenceDate = this.currentDay.today();
    const sevenDayWindows = activeHabits.map((habit) =>
      computeHabitAdherence(habit, completions, 7, referenceDate),
    );
    const thirtyDayWindows = activeHabits.map((habit) =>
      computeHabitAdherence(habit, completions, 30, referenceDate),
    );

    const summarize = (windows: ReturnType<typeof computeHabitAdherence>[]) => {
      const expected = windows.reduce((sum, item) => sum + item.expectedDays, 0);
      const completed = windows.reduce((sum, item) => sum + item.completedDays, 0);

      return {
        expected,
        completed,
        percentage: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      };
    };

    return {
      sevenDays: summarize(sevenDayWindows),
      thirtyDays: summarize(thirtyDayWindows),
    };
  });

  protected readonly selectedSnapshot = computed(() => {
    const dateKey = this.selectedDateKey();

    if (!dateKey) {
      return null;
    }

    return buildDayHistory(
      dateKey,
      this.storage.habitsReadonly(),
      this.storage.completionsReadonly(),
      this.storage.freezeUsedReadonly(),
      this.storage.habitNotesReadonly(),
    );
  });

  protected readonly weeklySummary = computed(() =>
    computeWeeklySummary(
      this.storage.habitsReadonly(),
      this.storage.completionsReadonly(),
      this.currentDay.today(),
    ),
  );

  protected onMonthChange(next: { year: number; month: number }): void {
    this.visibleYear.set(next.year);
    this.visibleMonth.set(next.month);
  }

  protected openDay(dateKey: string): void {
    this.selectedDateKey.set(dateKey);
  }

  protected closeDayModal(): void {
    this.selectedDateKey.set(null);
  }
}
