import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { getWeekday } from '../../../../core/utils/date.utils';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';
import { previewTimeOrPlaceholder } from '../../../../shared/components/habit-card-preview/habit-card-preview.utils';
import type { MarqueeItem } from '../../../../core/utils/habit-trigger-motivation.utils';
import type { Weekday } from '../../../../core/models/weekday.model';
import { WeekdayScheduleComponent } from '../../../../shared/components/weekday-schedule/weekday-schedule.component';
import { HabitMarqueeComponent } from '../habit-marquee/habit-marquee.component';
import { HabitCardStreakStatusComponent } from '../habit-card-streak-status/habit-card-streak-status.component';
import { getStreakTier } from './habit-card-streak.utils';

export type { StreakTier } from './habit-card-streak.utils';
export { getStreakTier } from './habit-card-streak.utils';

export type HabitCardAccent = 'default' | 'physical' | 'wellness';

const COMPLETE_SWEEP_MS = 400;

const COMPLETE_SWEEP_BANDS = [1, 2, 3, 4] as const;

type CompleteSweepPhase = 'idle' | 'in' | 'out';

@Component({
  selector: 'app-habit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WeekdayScheduleComponent,
    HabitMarqueeComponent,
    HabitCardStreakStatusComponent,
  ],
  templateUrl: './habit-card.component.html',
  styleUrl: './habit-card.component.scss',
})
export class HabitCardComponent {
  private readonly currentDay = inject(CurrentDayService);

  private initialized = false;
  private previousCompleted = false;

  protected readonly completeSweepPhase = signal<CompleteSweepPhase>('idle');
  protected readonly completeSweepBands = COMPLETE_SWEEP_BANDS;

  readonly name = input.required<string>();
  readonly displayMeta = input('');
  readonly scheduleDays = input.required<Weekday[]>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly marqueeItems = input.required<MarqueeItem[]>();
  readonly minimumAction = input.required<string>();
  readonly dayCount = input<number>(0);
  readonly freezeReassurance = input<string | null>(null);
  readonly isDayOne = input(false);
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();

  constructor() {
    effect((onCleanup) => {
      const isCompleted = this.completed();

      if (!this.initialized) {
        this.initialized = true;
        this.previousCompleted = isCompleted;
        return;
      }

      if (isCompleted && !this.previousCompleted) {
        this.completeSweepPhase.set('in');

        const timer = setTimeout(
          () => this.completeSweepPhase.set('idle'),
          COMPLETE_SWEEP_MS,
        );

        onCleanup(() => clearTimeout(timer));
      } else if (!isCompleted && this.previousCompleted) {
        this.completeSweepPhase.set('out');

        const timer = setTimeout(
          () => this.completeSweepPhase.set('idle'),
          COMPLETE_SWEEP_MS,
        );

        onCleanup(() => clearTimeout(timer));
      }

      this.previousCompleted = isCompleted;
    });
  }

  protected readonly showCompleteOverlay = computed(
    () => this.completed() || this.completeSweepPhase() === 'out',
  );

  protected readonly todayWeekday = computed(() =>
    getWeekday(this.currentDay.today()),
  );

  protected readonly displayTitle = computed(() =>
    formatHabitCardTitle(this.name(), this.displayMeta()),
  );

  protected readonly displayTime = computed(() =>
    previewTimeOrPlaceholder(this.time()),
  );

  protected readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  protected readonly dayCountStyleClass = computed(() => {
    const tier = this.streakTier();
    const base = 'text-brand-light-primary dark:text-brand-primary';

    if (tier >= 4) {
      return base + ' font-extrabold';
    }
    if (tier >= 3) {
      return base + ' font-extrabold';
    }
    if (tier >= 2) {
      return base + ' font-bold';
    }
    return base;
  });
}
