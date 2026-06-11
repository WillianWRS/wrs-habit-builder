import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  DAY_ONE_MESSAGE,
  getStreakTier,
  STREAK_TIER_MESSAGES,
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

  private readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  private readonly streakTierMessage = computed(
    () => STREAK_TIER_MESSAGES[this.streakTier()],
  );

  protected readonly streakTitle = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return DAY_ONE_MESSAGE.title;
    }

    if (this.freezeReassurance()) {
      return this.freezeReassurance()!;
    }

    return this.streakTierMessage().title;
  });

  protected readonly streakSubtitle = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return DAY_ONE_MESSAGE.subtitle;
    }

    return this.streakTierMessage().subtitle;
  });

  protected readonly mobileSubtitleSeparator = computed(() =>
    this.freezeReassurance() ? ' — ' : ' - ',
  );

  protected readonly ariaLabel = computed(() => {
    return `${this.streakTitle()}. ${this.streakSubtitle()}`;
  });
}
