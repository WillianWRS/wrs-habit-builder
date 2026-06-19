import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { HabitCorrectionDayIntent } from '../../../../core/utils/month-heatmap.utils';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../../core/constants/weekday-schedule.constants';
import type { MonthHeatmapCell } from '../../../../core/models/day-history.model';
import type { HabitCompletion } from '../../../../core/models/habit-completion.model';
import type { HabitFreezeUsed } from '../../../../core/models/habit-freeze-used.model';
import type { Habit } from '../../../../core/models/habit.model';
import {
  buildHabitMonthHeatmapCells,
  buildMonthHeatmapCells,
  formatMonthYearLabel,
  resolveCorrectionPulseDelay,
  resolveHabitCorrectionDayIntent,
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
        transition: none !important;
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

    .month-grid-track--prep-prev {
      transform: translateX(-50%);
    }

    .month-grid-track--prep-next {
      transform: translateX(0);
    }

    .month-grid-track--active-prev {
      transform: translateX(0);
      transition: transform ${MONTH_SLIDE_MS}ms ease-out;
    }

    .month-grid-track--active-next {
      transform: translateX(-50%);
      transition: transform ${MONTH_SLIDE_MS}ms ease-out;
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
              #slideTrack
              class="month-grid-track"
              [class.month-grid-track--prep-prev]="
                slideDirection() === 'prev' && !isSlideActive()
              "
              [class.month-grid-track--prep-next]="
                slideDirection() === 'next' && !isSlideActive()
              "
              [class.month-grid-track--active-prev]="
                slideDirection() === 'prev' && isSlideActive()
              "
              [class.month-grid-track--active-next]="
                slideDirection() === 'next' && isSlideActive()
              "
              (transitionend)="onSlideTransitionEnd($event)"
            >
              @if (slideDirection() === 'prev') {
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  [attr.aria-label]="'Calendário de ' + incomingMonthLabel()"
                >
                  @for (cell of incomingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell
                      [cell]="cell"
                      [correctionMode]="correctionMode()"
                      [correctionIntent]="correctionIntent(cell)"
                      [correctionSelected]="isCorrectionSelected(cell)"
                      [correctionPulseDelay]="correctionPulseDelay()"
                      (dayClick)="dayClick.emit($event)"
                    />
                  }
                </div>
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  aria-hidden="true"
                >
                  @for (cell of outgoingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell
                      [cell]="cell"
                      [correctionMode]="correctionMode()"
                      [correctionIntent]="correctionIntent(cell)"
                      [correctionSelected]="isCorrectionSelected(cell)"
                      [correctionPulseDelay]="correctionPulseDelay()"
                      (dayClick)="dayClick.emit($event)"
                    />
                  }
                </div>
              } @else {
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  aria-hidden="true"
                >
                  @for (cell of outgoingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell
                      [cell]="cell"
                      [correctionMode]="correctionMode()"
                      [correctionIntent]="correctionIntent(cell)"
                      [correctionSelected]="isCorrectionSelected(cell)"
                      [correctionPulseDelay]="correctionPulseDelay()"
                      (dayClick)="dayClick.emit($event)"
                    />
                  }
                </div>
                <div
                  class="month-grid-panel grid grid-cols-7 gap-1"
                  role="grid"
                  [attr.aria-label]="'Calendário de ' + incomingMonthLabel()"
                >
                  @for (cell of incomingCells(); track cell.dateKey) {
                    <app-heatmap-day-cell
                      [cell]="cell"
                      [correctionMode]="correctionMode()"
                      [correctionIntent]="correctionIntent(cell)"
                      [correctionSelected]="isCorrectionSelected(cell)"
                      [correctionPulseDelay]="correctionPulseDelay()"
                      (dayClick)="dayClick.emit($event)"
                    />
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
                  [correctionMode]="correctionMode()"
                  [correctionIntent]="correctionIntent(cell)"
                  [correctionSelected]="isCorrectionSelected(cell)"
                  [correctionPulseDelay]="correctionPulseDelay()"
                  (dayClick)="dayClick.emit($event)"
                />
              }
            </div>
          }
        </div>

        @if (mode() === 'aggregate') {
          <div
            class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brand-light-border pt-4 text-xs text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary"
            aria-label="Legenda de cores do calendário"
          >
            <span class="font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              Legenda
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span
                class="size-2.5 rounded-full border border-brand-light-border dark:border-brand-border"
                aria-hidden="true"
              ></span>
              Sem conclusões
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span
                class="size-2.5 rounded-full bg-brand-light-primary/25 dark:bg-brand-primary/25"
                aria-hidden="true"
              ></span>
              Parcial
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span
                class="size-2.5 rounded-full bg-brand-light-primary/55 dark:bg-brand-primary/55"
                aria-hidden="true"
              ></span>
              Maioria
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span
                class="size-2.5 rounded-full bg-brand-light-primary dark:bg-brand-primary"
                aria-hidden="true"
              ></span>
              Completo
            </span>
          </div>
        }
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
  readonly mode = input<'aggregate' | 'habit'>('aggregate');
  readonly habit = input<Habit | null>(null);
  readonly freezeUsed = input<HabitFreezeUsed[]>([]);
  readonly correctionMode = input(false);
  readonly correctionMarkDates = input<readonly string[]>([]);
  readonly correctionUnmarkDates = input<readonly string[]>([]);
  readonly correctionPulseAnchorMs = input<number | null>(null);

  readonly monthChange = output<{ year: number; month: number }>();
  readonly dayClick = output<string>();

  protected readonly isAnimating = signal(false);
  protected readonly isSlideActive = signal(false);
  protected readonly slideDirection = signal<MonthSlideDirection | null>(null);
  protected readonly outgoingCells = signal<MonthHeatmapCell[]>([]);
  protected readonly incomingCells = signal<MonthHeatmapCell[]>([]);
  protected readonly incomingMonthLabel = signal('');
  private readonly pendingTarget = signal<{ year: number; month: number } | null>(
    null,
  );
  private readonly slideTrackRef =
    viewChild<ElementRef<HTMLDivElement>>('slideTrack');

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

  protected readonly correctionPulseDelay = computed(() => {
    this.year();
    this.month();
    this.correctionMode();
    this.correctionMarkDates();
    this.correctionUnmarkDates();
    this.correctionPulseAnchorMs();

    return resolveCorrectionPulseDelay(this.correctionPulseAnchorMs());
  });

  protected correctionIntent(cell: MonthHeatmapCell): HabitCorrectionDayIntent | null {
    if (!this.correctionMode() || this.mode() !== 'habit') {
      return null;
    }

    const habit = this.habit();

    if (!habit) {
      return null;
    }

    return resolveHabitCorrectionDayIntent(
      cell,
      this.todayKey(),
      habit.id,
      this.completions(),
    );
  }

  protected isCorrectionSelected(cell: MonthHeatmapCell): boolean {
    const intent = this.correctionIntent(cell);

    if (!intent) {
      return false;
    }

    return intent === 'mark'
      ? this.correctionMarkDates().includes(cell.dateKey)
      : this.correctionUnmarkDates().includes(cell.dateKey);
  }

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

  protected onSlideTransitionEnd(event: TransitionEvent): void {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform' ||
      !this.isAnimating() ||
      !this.isSlideActive()
    ) {
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

    this.pendingTarget.set(target);
    this.outgoingCells.set(this.cells());
    this.incomingCells.set(this.buildCellsFor(target.year, target.month));
    this.incomingMonthLabel.set(formatMonthYearLabel(target.year, target.month));
    this.slideDirection.set(direction);
    this.isAnimating.set(true);
    this.isSlideActive.set(false);
    this.scheduleSlideStart();
  }

  private finishSlideAnimation(): void {
    const target = this.pendingTarget();

    if (target) {
      this.monthChange.emit(target);
    }

    this.isAnimating.set(false);
    this.isSlideActive.set(false);
    this.slideDirection.set(null);
    this.outgoingCells.set([]);
    this.incomingCells.set([]);
    this.incomingMonthLabel.set('');
    this.pendingTarget.set(null);
  }

  private buildCellsFor(year: number, month: number): MonthHeatmapCell[] {
    if (this.mode() === 'habit') {
      const targetHabit = this.habit();

      if (!targetHabit) {
        return [];
      }

      return buildHabitMonthHeatmapCells(
        year,
        month,
        targetHabit,
        this.completions(),
        this.freezeUsed(),
        this.todayKey(),
      );
    }

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

  private scheduleSlideStart(): void {
    if (typeof window === 'undefined') {
      this.isSlideActive.set(true);
      return;
    }

    // Aguarda a montagem das duas grades, força layout/pintura e só então anima.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const track = this.slideTrackRef()?.nativeElement;

        if (track) {
          void track.getBoundingClientRect();
          const panels = track.querySelectorAll<HTMLElement>('.month-grid-panel');

          panels.forEach((panel) => {
            void panel.getBoundingClientRect();
          });
        }

        window.requestAnimationFrame(() => {
          if (!this.isAnimating()) {
            return;
          }

          this.isSlideActive.set(true);
        });
      });
    });
  }
}
