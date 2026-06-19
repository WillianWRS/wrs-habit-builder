import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../../core/constants/weekday-schedule.constants';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { resolveHabitDisplayMeta } from '../../../../core/utils/habit-meta.utils';
import { computeHabitAdherenceSnapshot } from '../../../../core/utils/habit-adherence.utils';
import {
  computeFreezeBalance,
  computeHabitStreakSnapshot,
} from '../../../../core/utils/habit-streak.utils';
import { formatCorrectionResultMessage } from '../../../../core/utils/month-heatmap.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { MonthHeatmapComponent } from '../../../progress/components/month-heatmap/month-heatmap.component';
import { HabitCorrectionConfirmModalComponent } from '../../components/habit-correction-confirm-modal/habit-correction-confirm-modal.component';
import { StreakLevelsModalComponent } from '../../components/streak-levels-modal/streak-levels-modal.component';
import { ToastService } from '../../../../core/services/toast.service';
import {
  getStreakTier,
  getStreakTierTitle,
} from '../../../today/components/habit-card/habit-card-streak.utils';

const PROTECTION_TOOLTIP_WIDTH_PX = 240;
const PROTECTION_TOOLTIP_VIEWPORT_PADDING_PX = 16;
const PROTECTION_TOOLTIP_GAP_PX = 8;

function computeProtectionTooltipPosition(
  anchor: HTMLElement,
): { x: number; y: number } {
  const rect = anchor.getBoundingClientRect();
  const maxWidth = Math.min(
    PROTECTION_TOOLTIP_WIDTH_PX,
    window.innerWidth - PROTECTION_TOOLTIP_VIEWPORT_PADDING_PX * 2,
  );
  const halfWidth = maxWidth / 2;
  let centerX = rect.left + rect.width / 2;

  centerX = Math.max(
    PROTECTION_TOOLTIP_VIEWPORT_PADDING_PX + halfWidth,
    Math.min(
      centerX,
      window.innerWidth - PROTECTION_TOOLTIP_VIEWPORT_PADDING_PX - halfWidth,
    ),
  );

  return {
    x: centerX,
    y: rect.top - PROTECTION_TOOLTIP_GAP_PX,
  };
}

@Component({
  selector: 'app-habit-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppNavComponent,
    RouterLink,
    MonthHeatmapComponent,
    StreakLevelsModalComponent,
    HabitCorrectionConfirmModalComponent,
  ],
  templateUrl: './habit-detail-page.component.html',
})
export class HabitDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storage = inject(HabitStorageService);
  private readonly toast = inject(ToastService);
  protected readonly currentDay = inject(CurrentDayService);

  protected readonly visibleYear = signal(this.currentDay.today().getFullYear());
  protected readonly visibleMonth = signal(this.currentDay.today().getMonth());
  protected readonly protectionTooltip = signal<{ x: number; y: number } | null>(
    null,
  );
  protected readonly showStreakLevelsModal = signal(false);
  protected readonly correctionMode = signal(false);
  protected readonly pendingCorrectionMarkDates = signal<string[]>([]);
  protected readonly pendingCorrectionUnmarkDates = signal<string[]>([]);
  protected readonly showCorrectionConfirmModal = signal(false);
  protected readonly correctionPulseAnchorMs = signal<number | null>(null);

  private readonly routeHabitId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly habit = computed(() => {
    const id = this.routeHabitId();

    if (!id) {
      return null;
    }

    return this.storage.getHabitById(id) ?? null;
  });

  protected readonly habitCompletions = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return [];
    }

    return this.storage
      .completionsReadonly()
      .filter((completion) => completion.habitId === habit.id);
  });

  protected readonly habitFreezeUsed = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return [];
    }

    return this.storage
      .freezeUsedReadonly()
      .filter((event) => event.habitId === habit.id);
  });

  protected readonly adherence = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return {
        sevenDays: { windowDays: 7 as const, windowLabel: '7d', trackedDays: 0, expectedDays: 0, completedDays: 0, percentage: 0 },
        thirtyDays: { windowDays: 30 as const, windowLabel: '30d', trackedDays: 0, expectedDays: 0, completedDays: 0, percentage: 0 },
      };
    }

    return computeHabitAdherenceSnapshot(
      habit,
      this.storage.completionsReadonly(),
      this.currentDay.today(),
    );
  });

  protected readonly streak = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        isDayOne: true,
      };
    }

    return computeHabitStreakSnapshot(
      habit,
      this.storage.completionsReadonly(),
      this.storage.freezeUsedReadonly(),
      this.currentDay.today(),
    );
  });

  protected readonly streakLevelTitle = computed(() =>
    getStreakTierTitle(getStreakTier(this.streak().currentStreak)),
  );

  protected readonly freezeBalance = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return { available: 0, cap: 1 };
    }

    return computeFreezeBalance(
      habit,
      this.storage.freezeUsedReadonly(),
      'free',
      this.currentDay.today(),
    );
  });

  protected readonly scheduleLabel = computed(() => {
    const habit = this.habit();

    if (!habit || habit.scheduleDays.length === 0) {
      return 'Sem frequência definida';
    }

    return habit.scheduleDays
      .slice()
      .sort((left, right) => left - right)
      .map(
        (weekday) =>
          WEEKDAY_SCHEDULE_ITEMS.find((item) => item.weekday === weekday)
            ?.fullLabel ?? '',
      )
      .filter(Boolean)
      .join(' · ');
  });

  protected readonly habitSummary = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return '';
    }

    return resolveHabitDisplayMeta(habit, this.currentDay.today());
  });

  protected readonly triggerText = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return '';
    }

    const visibleTriggers = habit.triggers
      .filter((trigger) => trigger.visible && trigger.text.trim().length > 0)
      .map((trigger) => trigger.text.trim());

    if (visibleTriggers.length === 0) {
      return 'Defina um gatilho para facilitar a consistência.';
    }

    return visibleTriggers.join(' · ');
  });

  protected readonly hasPendingCorrections = computed(
    () =>
      this.pendingCorrectionMarkDates().length > 0 ||
      this.pendingCorrectionUnmarkDates().length > 0,
  );

  protected readonly pendingCorrectionMarkCount = computed(
    () => this.pendingCorrectionMarkDates().length,
  );

  protected readonly pendingCorrectionUnmarkCount = computed(
    () => this.pendingCorrectionUnmarkDates().length,
  );

  constructor() {
    effect(() => {
      const id = this.routeHabitId();

      if (!id) {
        void this.router.navigate(['/habits']);
        return;
      }

      if (!this.habit()) {
        void this.router.navigate(['/habits']);
      }
    });
  }

  protected onMonthChange(next: { year: number; month: number }): void {
    this.visibleYear.set(next.year);
    this.visibleMonth.set(next.month);
  }

  protected goBack(): void {
    void this.router.navigate(['/habits']);
  }

  protected toggleProtectionTooltip(anchor: EventTarget | null): void {
    if (!(anchor instanceof HTMLElement)) {
      return;
    }

    if (this.protectionTooltip()) {
      this.protectionTooltip.set(null);
      return;
    }

    this.protectionTooltip.set(computeProtectionTooltipPosition(anchor));
  }

  protected hideProtectionTooltip(): void {
    this.protectionTooltip.set(null);
  }

  @HostListener('document:scroll')
  @HostListener('window:resize')
  protected dismissProtectionTooltipOnViewportChange(): void {
    this.protectionTooltip.set(null);
  }

  protected openStreakLevelsModal(): void {
    this.showStreakLevelsModal.set(true);
  }

  protected closeStreakLevelsModal(): void {
    this.showStreakLevelsModal.set(false);
  }

  protected startCorrectionMode(): void {
    if (this.correctionMode()) {
      return;
    }

    this.correctionMode.set(true);
    this.pendingCorrectionMarkDates.set([]);
    this.pendingCorrectionUnmarkDates.set([]);
    this.correctionPulseAnchorMs.set(performance.now());
  }

  protected cancelCorrectionMode(): void {
    this.correctionMode.set(false);
    this.pendingCorrectionMarkDates.set([]);
    this.pendingCorrectionUnmarkDates.set([]);
    this.showCorrectionConfirmModal.set(false);
    this.correctionPulseAnchorMs.set(null);
  }

  protected onCorrectionDayClick(dateKey: string): void {
    if (!this.correctionMode()) {
      return;
    }

    if (dateKey >= this.currentDay.todayKey()) {
      return;
    }

    const habit = this.habit();

    if (!habit) {
      return;
    }

    const isCompleted = this.storage.isCompleted(habit.id, dateKey);

    if (isCompleted) {
      this.pendingCorrectionUnmarkDates.update((dates) =>
        dates.includes(dateKey)
          ? dates.filter((entry) => entry !== dateKey)
          : [...dates, dateKey],
      );
      return;
    }

    this.pendingCorrectionMarkDates.update((dates) =>
      dates.includes(dateKey)
        ? dates.filter((entry) => entry !== dateKey)
        : [...dates, dateKey],
    );
  }

  protected requestCorrectionSave(): void {
    if (!this.hasPendingCorrections()) {
      return;
    }

    this.showCorrectionConfirmModal.set(true);
  }

  protected dismissCorrectionConfirm(): void {
    this.showCorrectionConfirmModal.set(false);
  }

  protected confirmCorrectionSave(): void {
    const habit = this.habit();

    if (!habit) {
      return;
    }

    const markDates = this.pendingCorrectionMarkDates();
    const unmarkDates = this.pendingCorrectionUnmarkDates();

    for (const dateKey of markDates) {
      if (!this.storage.isCompleted(habit.id, dateKey)) {
        this.storage.toggleCompletion(habit.id, dateKey);
      }
    }

    for (const dateKey of unmarkDates) {
      if (this.storage.isCompleted(habit.id, dateKey)) {
        this.storage.toggleCompletion(habit.id, dateKey);
      }
    }

    this.showCorrectionConfirmModal.set(false);
    this.correctionMode.set(false);
    this.pendingCorrectionMarkDates.set([]);
    this.pendingCorrectionUnmarkDates.set([]);
    this.correctionPulseAnchorMs.set(null);

    this.toast.showSuccess(
      formatCorrectionResultMessage(markDates.length, unmarkDates.length),
    );
  }
}
