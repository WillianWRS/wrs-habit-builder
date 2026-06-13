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
          <span class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary">
            Adesão média: {{ adherenceSummary().sevenDays.percentage }}% ·
            7d · {{ adherenceSummary().sevenDays.completed }} de
            {{ adherenceSummary().sevenDays.expected }} hábitos feitos
          </span>
          <span class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary">
            Adesão média: {{ adherenceSummary().thirtyDays.percentage }}% ·
            30d · {{ adherenceSummary().thirtyDays.completed }} de
            {{ adherenceSummary().thirtyDays.expected }} hábitos feitos
          </span>
        </div>
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

    const summarize = (
      windows: ReturnType<typeof computeHabitAdherence>[],
    ) => {
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
    );
  });

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
