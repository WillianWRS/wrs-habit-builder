import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../core/constants/weekday-schedule.constants';
import type { Weekday } from '../../../core/models/weekday.model';

@Component({
  selector: 'app-weekday-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-1"
      role="group"
      [attr.aria-label]="ariaLabel()"
    >
      @for (day of weekdays; track day.weekday) {
        @if (readonly()) {
          <span
            class="flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold"
            [class]="
              isSelected(day.weekday)
                ? 'border-brand-light-primary bg-brand-light-primary/15 text-brand-light-primary dark:border-brand-primary dark:bg-brand-primary/15 dark:text-brand-primary'
                : 'border-brand-light-border/70 text-brand-light-text-secondary/50 dark:border-brand-border/70 dark:text-brand-text-secondary/50'
            "
            [attr.aria-label]="day.fullLabel + (isSelected(day.weekday) ? ', ativo' : ', inativo')"
          >
            {{ day.label }}
          </span>
        } @else {
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            [class]="
              isSelected(day.weekday)
                ? 'border-brand-light-primary bg-brand-light-primary/15 text-brand-light-primary dark:border-brand-primary dark:bg-brand-primary/15 dark:text-brand-primary'
                : 'border-brand-light-border text-brand-light-text-secondary hover:border-brand-light-primary/40 hover:text-brand-light-text-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary'
            "
            [attr.aria-label]="day.fullLabel"
            [attr.aria-pressed]="isSelected(day.weekday)"
            (click)="toggleDay(day.weekday)"
          >
            {{ day.label }}
          </button>
        }
      }
    </div>
  `,
})
export class WeekdayScheduleComponent {
  readonly selectedDays = model.required<Weekday[]>();
  readonly readonly = input(false);
  readonly ariaLabel = input('Dias da semana do hábito');

  protected readonly weekdays = WEEKDAY_SCHEDULE_ITEMS;

  private readonly selectedSet = computed(
    () => new Set<Weekday>(this.selectedDays()),
  );

  protected isSelected(weekday: Weekday): boolean {
    return this.selectedSet().has(weekday);
  }

  protected toggleDay(weekday: Weekday): void {
    const selected = this.selectedDays();

    if (this.isSelected(weekday)) {
      if (selected.length === 1) {
        return;
      }

      this.selectedDays.set(selected.filter((day) => day !== weekday));
      return;
    }

    this.selectedDays.set(
      WEEKDAY_SCHEDULE_ITEMS.filter(
        (day) => selected.includes(day.weekday) || day.weekday === weekday,
      ).map((day) => day.weekday),
    );
  }
}
