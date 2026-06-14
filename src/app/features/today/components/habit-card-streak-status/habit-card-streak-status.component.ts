import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  DAY_ONE_TITLE,
  getStreakTier,
  getStreakTierTitle,
  STREAK_TITLE_SWAP_FADE_MS,
} from '../habit-card/habit-card-streak.utils';

@Component({
  selector: 'app-habit-card-streak-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './habit-card-streak-status.component.html',
  styleUrl: './habit-card-streak-status.component.scss',
})
export class HabitCardStreakStatusComponent {
  readonly dayCount = input(0);
  readonly completed = input(false);
  readonly isDayOne = input(false);
  readonly freezeReassurance = input<string | null>(null);
  readonly milestoneCelebrating = input(false);
  readonly milestonePreviousDayCount = input<number | null>(null);

  protected readonly titleSwapHalfMs = STREAK_TITLE_SWAP_FADE_MS / 2;

  private readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  protected readonly titleSwapActive = computed(
    () =>
      this.milestoneCelebrating() && this.milestonePreviousDayCount() !== null,
  );

  protected readonly streakTitle = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return DAY_ONE_TITLE;
    }

    if (this.freezeReassurance()) {
      return this.freezeReassurance()!;
    }

    return getStreakTierTitle(this.streakTier());
  });

  protected readonly outgoingTitle = computed(() => {
    const previousDayCount = this.milestonePreviousDayCount();

    if (previousDayCount === null) {
      return '';
    }

    return getStreakTierTitle(getStreakTier(previousDayCount));
  });

  protected readonly ariaLabel = computed(() => this.streakTitle());
}
