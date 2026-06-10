import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../../core/constants/weekday-schedule.constants';
import type { HabitCompletion } from '../../../../core/models/habit-completion.model';
import type { Habit } from '../../../../core/models/habit.model';
import {
  buildMonthHeatmapCells,
  formatMonthYearLabel,
} from '../../../../core/utils/month-heatmap.utils';
import { HeatmapDayCellComponent } from '../heatmap-day-cell/heatmap-day-cell.component';

const LEGEND_INTENSITIES = [0, 1, 2, 3, 4, 5] as const;

@Component({
  selector: 'app-month-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeatmapDayCellComponent],
  template: `
    <section aria-labelledby="month-heatmap-title">
      <div class="flex items-center justify-between gap-3">
        <h2
          id="month-heatmap-title"
          class="font-display text-lg font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
        >
          {{ monthLabel() }}
        </h2>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg border border-brand-light-border text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
            aria-label="Mês anterior"
            (click)="previousMonth()"
          >
            <i class="bi bi-chevron-left text-base" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg border border-brand-light-border text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
            aria-label="Próximo mês"
            (click)="nextMonth()"
          >
            <i class="bi bi-chevron-right text-base" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div
        class="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary"
        aria-hidden="true"
      >
        @for (day of weekdayLabels; track day) {
          <span>{{ day }}</span>
        }
      </div>

      <div
        class="mt-1 grid grid-cols-7 gap-1"
        role="grid"
        [attr.aria-label]="'Calendário de ' + monthLabel()"
      >
        @for (cell of cells(); track cell.dateKey) {
          <app-heatmap-day-cell
            [cell]="cell"
            (dayClick)="dayClick.emit($event)"
          />
        }
      </div>

      <div class="mt-5">
        <p
          class="text-xs font-medium text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          Hábitos concluídos
        </p>

        <div
          class="mt-2 flex flex-wrap items-center gap-2"
          aria-hidden="true"
        >
          @for (level of legendLevels; track level) {
            <div class="flex items-center gap-1.5">
              <span
                class="relative flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
              >
                @if (level > 0) {
                  <span
                    class="absolute inset-0.5 rounded-full"
                    [class]="legendIntensityClass(level)"
                  ></span>
                }
                <span class="relative z-[1]">{{ level === 5 ? '5+' : level }}</span>
              </span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class MonthHeatmapComponent {
  readonly year = input.required<number>();
  readonly month = input.required<number>();
  readonly habits = input.required<Habit[]>();
  readonly completions = input.required<HabitCompletion[]>();
  readonly todayKey = input.required<string>();

  readonly monthChange = output<{ year: number; month: number }>();
  readonly dayClick = output<string>();

  protected readonly weekdayLabels = WEEKDAY_SCHEDULE_ITEMS.map(
    (item) => item.label,
  );
  protected readonly legendLevels = LEGEND_INTENSITIES;

  protected readonly monthLabel = computed(() =>
    formatMonthYearLabel(this.year(), this.month()),
  );

  protected readonly cells = computed(() =>
    buildMonthHeatmapCells(
      this.year(),
      this.month(),
      this.habits(),
      this.completions(),
      this.todayKey(),
    ),
  );

  protected legendIntensityClass(level: number): string {
    switch (level) {
      case 1:
        return 'bg-brand-light-primary/20 dark:bg-brand-primary/20';
      case 2:
        return 'bg-brand-light-primary/35 dark:bg-brand-primary/35';
      case 3:
        return 'bg-brand-light-primary/50 dark:bg-brand-primary/50';
      case 4:
        return 'bg-brand-light-primary/70 dark:bg-brand-primary/70';
      case 5:
        return 'bg-brand-light-primary dark:bg-brand-primary';
      default:
        return '';
    }
  }

  protected previousMonth(): void {
    const date = new Date(this.year(), this.month() - 1, 1);
    this.monthChange.emit({
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  protected nextMonth(): void {
    const date = new Date(this.year(), this.month() + 1, 1);
    this.monthChange.emit({
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }
}
