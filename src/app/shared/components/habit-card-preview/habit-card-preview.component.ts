import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../core/constants/weekday-schedule.constants';
import type { Weekday } from '../../../core/models/weekday.model';
import { HabitCardComponent } from '../../../features/today/components/habit-card/habit-card.component';
import type { HabitCardPreviewFormState } from './habit-card-preview.model';
import {
  buildPreviewMarqueeItems,
  mapPreviewAccent,
  previewTextOrPlaceholder,
  previewTimeOrPlaceholder,
} from './habit-card-preview.utils';

@Component({
  selector: 'app-habit-card-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HabitCardComponent],
  styles: `
    .habit-card-preview__card {
      pointer-events: none;
    }

    .habit-card-preview__card ::ng-deep button {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .habit-card-preview__card ::ng-deep .habit-marquee-viewport {
      cursor: default;
    }
  `,
  template: `
    <div class="space-y-3">
      @if (showDaySelector()) {
        <div
          class="flex flex-wrap items-center justify-center gap-1.5"
          role="group"
          aria-label="Dia da pré-visualização"
        >
          @for (day of visiblePreviewDays(); track day.weekday) {
            <button
              type="button"
              class="flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
              [class]="
                previewDay() === day.weekday
                  ? 'border-brand-light-primary bg-brand-light-primary/15 text-brand-light-primary dark:border-brand-primary dark:bg-brand-primary/15 dark:text-brand-primary'
                  : 'border-brand-light-border text-brand-light-text-secondary hover:border-brand-light-primary/40 hover:text-brand-light-text-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary'
              "
              [attr.aria-label]="day.fullLabel"
              [attr.aria-pressed]="previewDay() === day.weekday"
              (click)="selectPreviewDay(day.weekday)"
            >
              {{ day.label }}
            </button>
          }
        </div>
      }

      <div class="habit-card-preview__card">
        <app-habit-card
          [name]="cardName()"
          [displayMeta]="cardDisplayMeta()"
          [scheduleDays]="formState().scheduleDays"
          [time]="cardTime()"
          [category]="cardCategory()"
          [marqueeItems]="cardMarqueeItems()"
          [minimumAction]="cardMinimumAction()"
          [dayCount]="1"
          [missCount]="0"
          [isDayOne]="false"
          [completed]="true"
          [accent]="cardAccent()"
        />
      </div>
    </div>
  `,
})
export class HabitCardPreviewComponent {
  readonly formState = input.required<HabitCardPreviewFormState>();

  protected readonly previewDay = signal<Weekday | null>(null);
  private previousVisibleDays: Weekday[] = [];

  protected readonly visiblePreviewDays = computed(() => {
    const selected = new Set(this.formState().scheduleDays);

    return WEEKDAY_SCHEDULE_ITEMS.filter((day) => selected.has(day.weekday));
  });

  protected readonly showDaySelector = computed(
    () => this.formState().metasDinamicas && this.visiblePreviewDays().length > 0,
  );

  protected readonly cardName = computed(() =>
    previewTextOrPlaceholder(this.formState().name, 'Nome não informado'),
  );

  protected readonly cardCategory = computed(() =>
    previewTextOrPlaceholder(this.formState().category, 'Categoria não informada'),
  );

  protected readonly cardAccent = computed(() =>
    mapPreviewAccent(this.formState().category),
  );

  protected readonly cardMarqueeItems = computed(() =>
    buildPreviewMarqueeItems(this.formState()),
  );

  protected readonly cardDisplayMeta = computed(() => {
    const state = this.formState();

    if (!state.metasDinamicas) {
      return previewTextOrPlaceholder(state.metaGeral, 'Meta não informada');
    }

    if (this.visiblePreviewDays().length === 0) {
      return previewTextOrPlaceholder('', 'Meta não informada');
    }

    const goal = this.activeWeekdayGoal();

    return previewTextOrPlaceholder(goal?.meta ?? '', 'Meta não informada');
  });

  protected readonly cardMinimumAction = computed(() => {
    const state = this.formState();

    if (!state.metasDinamicas) {
      return previewTextOrPlaceholder(
        state.minimumAction,
        'Ação mínima não informada',
      );
    }

    if (this.visiblePreviewDays().length === 0) {
      return previewTextOrPlaceholder('', 'Ação mínima não informada');
    }

    const goal = this.activeWeekdayGoal();

    return previewTextOrPlaceholder(
      goal?.minimumAction ?? '',
      'Ação mínima não informada',
    );
  });

  protected readonly cardTime = computed(() => {
    const state = this.formState();

    if (!state.metasDinamicas) {
      return previewTimeOrPlaceholder(state.optionalReminder);
    }

    if (this.visiblePreviewDays().length === 0) {
      return previewTimeOrPlaceholder('');
    }

    const goal = this.activeWeekdayGoal();

    return previewTimeOrPlaceholder(goal?.optionalReminder ?? '');
  });

  constructor() {
    effect(() => {
      const state = this.formState();
      const days = this.visiblePreviewDays().map((day) => day.weekday);

      untracked(() => {
        if (!state.metasDinamicas || days.length === 0) {
          this.previewDay.set(null);
          this.previousVisibleDays = days;
          return;
        }

        const current = this.previewDay();
        const previousDays = this.previousVisibleDays;

        if (current !== null && days.includes(current)) {
          this.previousVisibleDays = days;
          return;
        }

        const removedDay = previousDays.find((weekday) => !days.includes(weekday));

        if (removedDay !== undefined && current === removedDay) {
          const removedIndex = previousDays.indexOf(removedDay);
          const fallbackIndex = Math.max(0, removedIndex - 1);
          const fallbackDay = previousDays[fallbackIndex];
          this.previewDay.set(days.includes(fallbackDay) ? fallbackDay : days[0]);
        } else {
          this.previewDay.set(days[0]);
        }

        this.previousVisibleDays = days;
      });
    });
  }

  protected selectPreviewDay(weekday: Weekday): void {
    this.previewDay.set(weekday);
  }

  private activeWeekdayGoal() {
    const day = this.previewDay();

    if (day === null) {
      return undefined;
    }

    return this.formState().weekdayGoals.find((entry) => entry.weekday === day);
  }
}
