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
import { RouterLink } from '@angular/router';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { getWeekday } from '../../../../core/utils/date.utils';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';
import { previewTimeOrPlaceholder } from '../../../../shared/components/habit-card-preview/habit-card-preview.utils';
import type { MarqueeItem } from '../../../../core/utils/habit-trigger-motivation.utils';
import type { Weekday } from '../../../../core/models/weekday.model';
import { WeekdayScheduleComponent } from '../../../../shared/components/weekday-schedule/weekday-schedule.component';
import { HabitMarqueeComponent } from '../habit-marquee/habit-marquee.component';
import { HabitCardStreakStatusComponent } from '../habit-card-streak-status/habit-card-streak-status.component';
import { didAdvanceStreakTier, getStreakTier, MILESTONE_CELEBRATION_MS } from './habit-card-streak.utils';

export type { StreakTier } from './habit-card-streak.utils';
export { getStreakTier } from './habit-card-streak.utils';

export type HabitCardAccent = 'default' | 'physical' | 'wellness';

const COMPLETE_SWEEP_MS = 400;
const MOBILE_SWIPE_THRESHOLD_RATIO = 0.3;
const SWIPE_CLICK_SUPPRESS_MS = 450;

type CompleteSweepPhase = 'idle' | 'in' | 'out';
type SwipeDirection = 'left' | 'right' | null;

@Component({
  selector: 'app-habit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
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
  private previousDayCount = 0;
  /** Swipe já mostrou a animação — não repetir sweep ao confirmar. */
  private skipNextSweepAnimation = false;
  private milestoneCelebrationTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly completeSweepPhase = signal<CompleteSweepPhase>('idle');
  protected readonly milestoneCelebrating = signal(false);
  protected readonly milestonePreviousDayCount = signal<number | null>(null);
  protected readonly swipePreviewActive = signal(false);
  protected readonly swipeReleasing = signal(false);
  protected readonly swipeDirection = signal<SwipeDirection>(null);
  protected readonly swipePreviewProgress = signal(0);
  protected readonly noteDraft = signal('');
  protected readonly noteEditorOpen = signal(false);
  protected readonly noteLimit = 140;
  protected readonly noteRemaining = computed(
    () => this.noteLimit - this.noteDraft().length,
  );
  protected readonly hasNoteChanges = computed(
    () => this.noteDraft().trim() !== this.dailyNote().trim(),
  );
  protected readonly hasSavedNote = computed(() => this.dailyNote().trim().length > 0);
  protected readonly swipeUnlocked = computed(
    () => this.swipePreviewProgress() >= 1,
  );

  readonly name = input.required<string>();
  readonly habitId = input.required<string>();
  readonly displayMeta = input('');
  readonly scheduleDays = input.required<Weekday[]>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly marqueeItems = input.required<MarqueeItem[]>();
  readonly minimumAction = input.required<string>();
  readonly dayCount = input<number>(0);
  readonly freezeReassurance = input<string | null>(null);
  readonly dailyNote = input('');
  readonly isDayOne = input(false);
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();
  readonly dailyNoteChange = output<string>();

  private swipeStartX = 0;
  private swipeCurrentX = 0;
  private swipeCardWidth = 0;
  private swipeTracking = false;
  private swipeReleaseTimer: ReturnType<typeof setTimeout> | null = null;
  private ignoreToggleClickUntil = 0;

  constructor() {
    effect((onCleanup) => {
      const isCompleted = this.completed();
      const dayCount = this.dayCount();

      if (!this.initialized) {
        this.initialized = true;
        this.previousCompleted = isCompleted;
        this.previousDayCount = dayCount;
        return;
      }

      if (isCompleted && !this.previousCompleted) {
        if (didAdvanceStreakTier(this.previousDayCount, dayCount)) {
          this.triggerMilestoneCelebration(onCleanup);
        }

        if (this.skipNextSweepAnimation) {
          this.skipNextSweepAnimation = false;
          this.completeSweepPhase.set('idle');
        } else {
          this.completeSweepPhase.set('in');

          const timer = setTimeout(
            () => this.completeSweepPhase.set('idle'),
            COMPLETE_SWEEP_MS,
          );

          onCleanup(() => clearTimeout(timer));
        }
      } else if (!isCompleted && this.previousCompleted) {
        this.clearMilestoneCelebration();

        if (this.skipNextSweepAnimation) {
          this.skipNextSweepAnimation = false;
          this.completeSweepPhase.set('idle');
        } else {
          this.completeSweepPhase.set('out');

          const timer = setTimeout(
            () => this.completeSweepPhase.set('idle'),
            COMPLETE_SWEEP_MS,
          );

          onCleanup(() => clearTimeout(timer));
        }
      }

      this.previousCompleted = isCompleted;
      this.previousDayCount = dayCount;
    });

    effect(() => {
      if (this.noteEditorOpen()) {
        return;
      }

      this.noteDraft.set(this.dailyNote().slice(0, this.noteLimit));
    });
  }

  protected readonly showCompleteOverlay = computed(
    () =>
      this.completed() ||
      this.completeSweepPhase() === 'out' ||
      this.swipePreviewActive() ||
      this.swipeReleasing(),
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

  private triggerMilestoneCelebration(onCleanup: (fn: () => void) => void): void {
    this.clearMilestoneCelebration();
    this.milestonePreviousDayCount.set(this.previousDayCount);
    this.milestoneCelebrating.set(true);

    this.milestoneCelebrationTimer = setTimeout(() => {
      this.milestoneCelebrating.set(false);
      this.milestonePreviousDayCount.set(null);
      this.milestoneCelebrationTimer = null;
    }, MILESTONE_CELEBRATION_MS);

    onCleanup(() => this.clearMilestoneCelebration());
  }

  private clearMilestoneCelebration(): void {
    if (this.milestoneCelebrationTimer) {
      clearTimeout(this.milestoneCelebrationTimer);
      this.milestoneCelebrationTimer = null;
    }

    this.milestoneCelebrating.set(false);
    this.milestonePreviousDayCount.set(null);
  }

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

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      return;
    }

    if (isInteractiveSwipeTarget(event)) {
      return;
    }

    this.clearSwipeReleaseTimer();
    this.swipeReleasing.set(false);
    this.swipeTracking = true;
    this.swipeStartX = event.clientX;
    this.swipeCurrentX = event.clientX;
    this.swipeCardWidth = (event.currentTarget as HTMLElement).offsetWidth;
    this.swipePreviewActive.set(false);
    this.swipeDirection.set(null);
    this.swipePreviewProgress.set(0);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.swipeTracking || event.pointerType !== 'touch') {
      return;
    }

    this.swipeCurrentX = event.clientX;
    const deltaX = this.swipeCurrentX - this.swipeStartX;
    const threshold = this.swipeCardWidth * MOBILE_SWIPE_THRESHOLD_RATIO;
    const allowedDirection: SwipeDirection = this.completed() ? 'right' : 'left';

    if (Math.abs(deltaX) > 4) {
      const direction: SwipeDirection = deltaX < 0 ? 'left' : 'right';

      if (direction !== allowedDirection) {
        this.swipeDirection.set(null);
        this.swipePreviewProgress.set(0);
        return;
      }

      this.swipeDirection.set(direction);

      if (!this.swipePreviewActive()) {
        this.swipePreviewActive.set(true);
      }
    }

    const effectiveDelta =
      allowedDirection === 'left' ? Math.max(0, -deltaX) : Math.max(0, deltaX);
    const progress = threshold > 0 ? effectiveDelta / threshold : 0;
    this.swipePreviewProgress.set(Math.min(progress, 1));
  }

  protected onPointerEnd(event: PointerEvent): void {
    if (!this.swipeTracking || event.pointerType !== 'touch') {
      return;
    }

    const deltaX = this.swipeCurrentX - this.swipeStartX;
    const threshold = this.swipeCardWidth * MOBILE_SWIPE_THRESHOLD_RATIO;

    this.swipeTracking = false;

    if (!this.swipePreviewActive()) {
      this.swipeDirection.set(null);
      this.swipePreviewProgress.set(0);
      return;
    }

    const shouldMark = deltaX < 0 && !this.completed() && Math.abs(deltaX) >= threshold;
    const shouldUnmark = deltaX > 0 && this.completed() && Math.abs(deltaX) >= threshold;

    if (shouldMark || shouldUnmark) {
      this.skipNextSweepAnimation = true;
      this.suppressToggleClickAfterSwipe(event);
      this.resetSwipeState();
      this.markToggle.emit();
      return;
    }

    const progress = this.swipePreviewProgress();
    const direction = this.swipeDirection();
    const allowedDirection: SwipeDirection = this.completed() ? 'right' : 'left';

    if (progress <= 0 || direction !== allowedDirection) {
      this.resetSwipeState();
      return;
    }

    this.swipeReleasing.set(true);
    this.clearSwipeReleaseTimer();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.swipePreviewProgress.set(0);
        this.swipeReleaseTimer = setTimeout(() => this.resetSwipeState(), COMPLETE_SWEEP_MS);
      });
    });
  }

  private resetSwipeState(): void {
    this.swipeTracking = false;
    this.swipeReleasing.set(false);
    this.swipePreviewActive.set(false);
    this.swipePreviewProgress.set(0);
    this.swipeDirection.set(null);
    this.clearSwipeReleaseTimer();
  }

  private clearSwipeReleaseTimer(): void {
    if (this.swipeReleaseTimer) {
      clearTimeout(this.swipeReleaseTimer);
      this.swipeReleaseTimer = null;
    }
  }

  protected onToggleClick(event: MouseEvent): void {
    if (Date.now() < this.ignoreToggleClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.markToggle.emit();
  }

  private suppressToggleClickAfterSwipe(event: PointerEvent): void {
    this.ignoreToggleClickUntil = Date.now() + SWIPE_CLICK_SUPPRESS_MS;
    event.preventDefault();
  }

  protected toggleNoteEditor(): void {
    const opening = !this.noteEditorOpen();

    if (opening) {
      this.noteDraft.set(this.dailyNote().slice(0, this.noteLimit));
    }

    this.noteEditorOpen.set(opening);
  }

  protected onNoteInput(value: string): void {
    this.noteDraft.set(value.slice(0, this.noteLimit));
  }

  protected saveNote(): void {
    const normalized = this.noteDraft().trim().slice(0, this.noteLimit);
    this.noteDraft.set(normalized);
    this.dailyNoteChange.emit(normalized);
    this.noteEditorOpen.set(false);
  }

  protected readonly isUnmarkSwipePreview = computed(
    () =>
      (this.swipePreviewActive() || this.swipeReleasing()) &&
      this.completed() &&
      this.swipeDirection() === 'right',
  );

  protected swipeFillScale(): number {
    if (!this.swipePreviewActive() && !this.swipeReleasing()) {
      return 1;
    }

    const progress = this.swipePreviewProgress();

    if (this.isUnmarkSwipePreview()) {
      return 1 - progress;
    }

    if (!this.completed() && this.swipeDirection() === 'left') {
      return progress;
    }

    if (this.completed()) {
      return 1;
    }

    return 0;
  }
}

function isInteractiveSwipeTarget(event: PointerEvent): boolean {
  const interactiveSelector =
    'button, a, input, textarea, select, label, .habit-mark-btn, .habit-unmark-btn';

  return event.composedPath().some(
    (node) => node instanceof HTMLElement && Boolean(node.closest(interactiveSelector)),
  );
}
