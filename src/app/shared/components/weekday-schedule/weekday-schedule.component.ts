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
  styles: `
    .weekday-schedule-today {
      border-color: color-mix(in srgb, var(--accent-light) 80%, #18181b);
      background-color: rgb(var(--accent-rgb-light) / 0.28);
      color: color-mix(in srgb, var(--accent-light) 88%, #18181b);
      font-weight: 700;
    }

    :host-context(.dark) .weekday-schedule-today {
      border-color: rgb(var(--accent-tint-dark));
      background-color: rgb(var(--accent-rgb-dark) / 0.22);
      color: rgb(var(--accent-tint-dark));
    }
  `,
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
            [class]="dayCellClass(day.weekday)"
            [class.weekday-schedule-today]="isHighlightedToday(day.weekday)"
            [attr.aria-label]="dayAriaLabel(day)"
          >
            {{ day.label }}
          </span>
        } @else {
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            [class]="dayCellClass(day.weekday, true)"
            [class.weekday-schedule-today]="isHighlightedToday(day.weekday)"
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
  /** Destaca o dia da semana atual (ex.: tela Hoje). */
  readonly highlightWeekday = input<Weekday | null>(null);

  protected readonly weekdays = WEEKDAY_SCHEDULE_ITEMS;

  private readonly selectedSet = computed(
    () => new Set<Weekday>(this.selectedDays()),
  );

  protected isSelected(weekday: Weekday): boolean {
    return this.selectedSet().has(weekday);
  }

  protected isHighlightedToday(weekday: Weekday): boolean {
    return this.highlightWeekday() === weekday;
  }

  protected dayAriaLabel(day: (typeof WEEKDAY_SCHEDULE_ITEMS)[number]): string {
    const parts = [day.fullLabel];

    if (this.isSelected(day.weekday)) {
      parts.push('ativo');
    } else {
      parts.push('inativo');
    }

    if (this.isHighlightedToday(day.weekday)) {
      parts.push('hoje');
    }

    return parts.join(', ');
  }

  protected dayCellClass(weekday: Weekday, interactive = false): string {
    if (this.isHighlightedToday(weekday)) {
      return '';
    }

    if (this.isSelected(weekday)) {
      if (this.highlightWeekday() !== null) {
        return 'border-brand-light-primary bg-transparent text-brand-light-primary dark:border-brand-primary dark:bg-transparent dark:text-brand-primary';
      }

      return 'border-brand-light-primary bg-brand-light-primary/15 text-brand-light-primary dark:border-brand-primary dark:bg-brand-primary/15 dark:text-brand-primary';
    }

    if (interactive) {
      return 'border-brand-light-border text-brand-light-text-secondary hover:border-brand-light-primary/40 hover:text-brand-light-text-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary';
    }

    return 'border-brand-light-border/70 text-brand-light-text-secondary/50 dark:border-brand-border/70 dark:text-brand-text-secondary/50';
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
