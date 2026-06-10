import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type { MonthHeatmapCell } from '../../../../core/models/day-history.model';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../../core/constants/weekday-schedule.constants';
import type { HabitCompletion } from '../../../../core/models/habit-completion.model';
import type { Habit } from '../../../../core/models/habit.model';
import {
  buildMonthHeatmapCells,
  formatMonthYearLabel,
} from '../../../../core/utils/month-heatmap.utils';
import { parseDateKey } from '../../../../core/utils/date.utils';
import { HeatmapDayCellComponent } from '../heatmap-day-cell/heatmap-day-cell.component';

type MonthSlideDirection = 'prev' | 'next';

const MONTH_SLIDE_MS = 280;

@Component({
  selector: 'app-month-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeatmapDayCellComponent],
  styles: `
    .weekday-label-row {
      min-height: 15px;
    }

    .weekday-label {
      display: inline-block;
      cursor: default;
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      margin-block: 2px;
      transition:
        font-size 150ms ease,
        font-weight 150ms ease,
        margin 150ms ease;
    }

    .weekday-label:hover {
      margin-block: 0;
      font-size: 15px;
      font-weight: 700;
    }

    @media (prefers-reduced-motion: reduce) {
      .weekday-label {
        transition: none;
      }

      .month-grid-track {
        animation: none !important;
      }
    }

    .month-grid-viewport {
      overflow: hidden;
    }

    .month-grid-track {
      display: flex;
      width: 200%;
      will-change: transform;
    }

    .month-grid-panel {
      width: 50%;
      flex-shrink: 0;
    }

    @keyframes month-grid-slide-to-prev {
      from {
        transform: translateX(-100%);
      }

      to {
        transform: translateX(0);
      }
    }

    @keyframes month-grid-slide-to-next {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(-100%);
      }
    }

    .month-grid-track--to-prev {
      animation: month-grid-slide-to-prev ${MONTH_SLIDE_MS}ms ease-out forwards;
    }

    .month-grid-track--to-next {
      animation: month-grid-slide-to-next ${MONTH_SLIDE_MS}ms ease-out forwards;
    }
  `,
  template: `
    <section
      class="overflow-hidden rounded-2xl border border-brand-light-border bg-brand-light-surface dark:border-brand-border dark:bg-brand-surface"
      aria-labelledby="month-heatmap-title"
    >
      <header
        class="border-b border-brand-light-border bg-brand-light-bg px-4 py-3 sm:px-6 dark:border-brand-border dark:bg-brand-bg"
      >
        <div class="grid grid-cols-7 items-center gap-1">
          <h2
            id="month-heatmap-title"
            class="col-span-5 min-w-0 text-left font-display text-lg font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            {{ monthLabel() }}
          </h2>

          <div class="col-span-2 flex items-center justify-end gap-1">
            <button
              type="button"
              class="inline-flex size-9 items-center justify-center rounded-lg border border-brand-light-border text-brand-light-text-secondary transition-colors hover:bg-brand-light-surface hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-surface dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary dark:disabled:hover:bg-transparent dark:disabled:hover:text-brand-text-secondary"
              aria-label="Mês anterior"
              [disabled]="isAnimating()"
              (click)="previousMonth()"
            >
              <i class="bi bi-chevron-left text-base" aria-hidden="true"></i>
            </button>

            <button
              type="button"
              class="inline-flex size-9 items-center justify-center rounded-lg border border-brand-light-border text-brand-light-text-secondary transition-colors hover:bg-brand-light-surface hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-surface dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary dark:disabled:hover:bg-transparent dark:disabled:hover:text-brand-text-secondary"
              aria-label="Próximo mês"
              [disabled]="isAtCurrentMonth() || isAnimating()"
              (click)="nextMonth()"
            >
              <i class="bi bi-chevron-right text-base" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </header>

      <div class="p-4 sm:p-6">
        <div
          class="weekday-label-row grid grid-cols-7 items-center gap-1 text-center uppercase tracking-wide text-brand-light-primary dark:text-brand-primary"
          aria-hidden="true"
        >
          @for (day of weekdayLabels; track day) {
            <span class="weekday-label">{{ day }}</span>
          }
        </div>

        <div class="month-grid-viewport mt-1">
          @if (isAnimating()) {
            <div
              class="month-grid-track"
              [class.month-grid-track--to-prev]="slideDirection() === 'prev'"
              [class.month-grid-track--to-next]="slideDirection() === 'next'"
              (animationend)="onSlideAnimationEnd($event)"
            >
              @if (slideDirection() === 'prev') {
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  [attr.aria-label]="'Calendário de ' + incomingMonthLabel()"
                >
                  @for (cell of incomingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell [cell]="cell" />
                  }
                </div>
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  aria-hidden="true"
                >
                  @for (cell of outgoingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell [cell]="cell" />
                  }
                </div>
              } @else {
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  aria-hidden="true"
                >
                  @for (cell of outgoingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell [cell]="cell" />
                  }
                </div>
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  [attr.aria-label]="'Calendário de ' + incomingMonthLabel()"
                >
                  @for (cell of incomingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell [cell]="cell" />
                  }
                </div>
              }
            </div>
          } @else {
            <div
              class="grid grid-cols-7 gap-1"
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

  protected readonly isAnimating = signal(false);
  protected readonly slideDirection = signal<MonthSlideDirection | null>(null);
  protected readonly outgoingCells = signal<MonthHeatmapCell[]>([]);
  protected readonly incomingCells = signal<MonthHeatmapCell[]>([]);
  protected readonly incomingMonthLabel = signal('');

  protected readonly weekdayLabels = WEEKDAY_SCHEDULE_ITEMS.map(
    (item) => item.label,
  );

  protected readonly monthLabel = computed(() =>
    formatMonthYearLabel(this.year(), this.month()),
  );

  protected readonly isAtCurrentMonth = computed(() => {
    const today = parseDateKey(this.todayKey());

    return (
      this.year() === today.getFullYear() && this.month() === today.getMonth()
    );
  });

  protected readonly cells = computed(() =>
    this.buildCellsFor(this.year(), this.month()),
  );

  protected previousMonth(): void {
    if (this.isAnimating()) {
      return;
    }

    const date = new Date(this.year(), this.month() - 1, 1);
    this.navigateToMonth(
      {
        year: date.getFullYear(),
        month: date.getMonth(),
      },
      'prev',
    );
  }

  protected nextMonth(): void {
    if (this.isAtCurrentMonth() || this.isAnimating()) {
      return;
    }

    const date = new Date(this.year(), this.month() + 1, 1);
    this.navigateToMonth(
      {
        year: date.getFullYear(),
        month: date.getMonth(),
      },
      'next',
    );
  }

  protected onSlideAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget || !this.isAnimating()) {
      return;
    }

    this.finishSlideAnimation();
  }

  private navigateToMonth(
    target: { year: number; month: number },
    direction: MonthSlideDirection,
  ): void {
    if (this.shouldSkipSlideAnimation()) {
      this.monthChange.emit(target);
      return;
    }

    this.outgoingCells.set(this.cells());
    this.incomingCells.set(this.buildCellsFor(target.year, target.month));
    this.incomingMonthLabel.set(formatMonthYearLabel(target.year, target.month));
    this.slideDirection.set(direction);
    this.isAnimating.set(true);
    this.monthChange.emit(target);
  }

  private finishSlideAnimation(): void {
    this.isAnimating.set(false);
    this.slideDirection.set(null);
    this.outgoingCells.set([]);
    this.incomingCells.set([]);
    this.incomingMonthLabel.set('');
  }

  private buildCellsFor(year: number, month: number): MonthHeatmapCell[] {
    return buildMonthHeatmapCells(
      year,
      month,
      this.habits(),
      this.completions(),
      this.todayKey(),
    );
  }

  private shouldSkipSlideAnimation(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
