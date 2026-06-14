import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import type {
  HabitAdherenceHighlightItem,
  HabitAdherenceTiedHabit,
} from '../../../../core/utils/habit-adherence.utils';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { buildDayHistory } from '../../../../core/utils/day-history.utils';
import { computeHabitAdherence, computeHabitAdherenceHighlights } from '../../../../core/utils/habit-adherence.utils';
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
          Acompanhe sua adesão recente, veja quais hábitos se destacam em todo o
          período e explore o calendário mensal. Toque em um dia para abrir o
          histórico e as notas salvas.
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

        <div
          class="mt-4 grid gap-3 md:grid-cols-2"
          aria-labelledby="habit-adherence-highlights-title"
        >
          <h2 id="habit-adherence-highlights-title" class="sr-only">
            Destaques de adesão por hábito em todo o período
          </h2>

          <article
            class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface"
          >
            <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
              Hábito de maior adesão · todo o período
            </p>
            <div class="mt-1 flex min-w-0 items-center gap-2">
              <p
                class="min-w-0 truncate font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
              >
                {{ habitAdherenceHighlights().topHabit.label }}
              </p>
              @if (habitAdherenceHighlights().topHabit.tiedHabits.length > 0) {
                <button
                  type="button"
                  class="inline-flex shrink-0 rounded-full bg-brand-light-primary/10 px-1.5 py-0.5 text-[11px] font-bold leading-none text-brand-light-primary transition-colors hover:bg-brand-light-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary dark:hover:bg-brand-primary/25 dark:focus-visible:ring-brand-primary"
                  [attr.aria-expanded]="
                    openTieTooltip()?.kind === 'top'
                  "
                  [attr.aria-label]="
                    'Mais ' +
                    habitAdherenceHighlights().topHabit.tiedHabits.length +
                    ' hábitos empatados em maior adesão'
                  "
                  (click)="
                    toggleTieTooltip(
                      'top',
                      habitAdherenceHighlights().topHabit,
                      $event
                    )
                  "
                >
                  +{{ habitAdherenceHighlights().topHabit.tiedHabits.length }}
                </button>
              }
            </div>
            <p class="mt-1 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
              @if (habitAdherenceHighlights().hasEnoughData) {
                {{ habitAdherenceHighlights().topHabit.value }}
              } @else {
                Conclua alguns hábitos para ver este destaque.
              }
            </p>
          </article>

          <article
            class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface"
          >
            <p class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
              Hábito de menor adesão · todo o período
            </p>
            <div class="mt-1 flex min-w-0 items-center gap-2">
              <p
                class="min-w-0 truncate font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
              >
                {{ habitAdherenceHighlights().lowHabit.label }}
              </p>
              @if (habitAdherenceHighlights().lowHabit.tiedHabits.length > 0) {
                <button
                  type="button"
                  class="inline-flex shrink-0 rounded-full bg-brand-light-primary/10 px-1.5 py-0.5 text-[11px] font-bold leading-none text-brand-light-primary transition-colors hover:bg-brand-light-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary dark:hover:bg-brand-primary/25 dark:focus-visible:ring-brand-primary"
                  [attr.aria-expanded]="
                    openTieTooltip()?.kind === 'low'
                  "
                  [attr.aria-label]="
                    'Mais ' +
                    habitAdherenceHighlights().lowHabit.tiedHabits.length +
                    ' hábitos empatados em menor adesão'
                  "
                  (click)="
                    toggleTieTooltip(
                      'low',
                      habitAdherenceHighlights().lowHabit,
                      $event
                    )
                  "
                >
                  +{{ habitAdherenceHighlights().lowHabit.tiedHabits.length }}
                </button>
              }
            </div>
            <p class="mt-1 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
              @if (habitAdherenceHighlights().hasEnoughData) {
                {{ habitAdherenceHighlights().lowHabit.value }}
              } @else {
                Conclua alguns hábitos para ver este destaque.
              }
            </p>
          </article>
        </div>
      </header>

      @if (openTieTooltip(); as tooltip) {
        <div
          role="tooltip"
          class="pointer-events-none fixed z-50 max-w-[min(18rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-full rounded-md border border-brand-light-primary/45 bg-brand-light-surface px-3 py-2 text-xs font-medium leading-relaxed text-brand-light-primary shadow-lg dark:border-brand-primary/45 dark:bg-brand-surface dark:text-brand-primary"
          [style.left.px]="tooltip.x"
          [style.top.px]="tooltip.y"
        >
          <ul class="space-y-1">
            @for (habit of tooltip.habits; track habit.name) {
              <li>
                <span class="font-semibold">{{ habit.name }}</span>
                <span class="text-brand-light-primary/85 dark:text-brand-primary/85">
                  · {{ habit.value }}
                </span>
              </li>
            }
          </ul>
        </div>
      }

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

  protected readonly habitAdherenceHighlights = computed(() =>
    computeHabitAdherenceHighlights(
      this.storage.habitsReadonly(),
      this.storage.completionsReadonly(),
      this.currentDay.today(),
      this.storage.freezeUsedReadonly(),
    ),
  );

  protected readonly openTieTooltip = signal<{
    kind: 'top' | 'low';
    habits: HabitAdherenceTiedHabit[];
    x: number;
    y: number;
  } | null>(null);

  protected toggleTieTooltip(
    kind: 'top' | 'low',
    item: HabitAdherenceHighlightItem,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (item.tiedHabits.length === 0) {
      return;
    }

    if (this.openTieTooltip()?.kind === kind) {
      this.openTieTooltip.set(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    this.openTieTooltip.set({
      kind,
      habits: item.tiedHabits,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }

  protected onMonthChange(next: { year: number; month: number }): void {
    this.visibleYear.set(next.year);
    this.visibleMonth.set(next.month);
  }

  protected openDay(dateKey: string): void {
    this.openTieTooltip.set(null);
    this.selectedDateKey.set(dateKey);
  }

  protected closeDayModal(): void {
    this.selectedDateKey.set(null);
  }
}
