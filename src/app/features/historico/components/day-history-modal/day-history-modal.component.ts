import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type {
  DayHistoryEntry,
  DayHistorySnapshot,
} from '../../../../core/models/day-history.model';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';

@Component({
  selector: 'app-day-history-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 pt-16 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      (click)="dismissed.emit()"
    >
      <div
        class="flex max-h-[min(80dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-brand-light-border bg-brand-light-surface shadow-xl dark:border-brand-border dark:bg-brand-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-history-title"
        (click)="$event.stopPropagation()"
      >
        <div class="border-b border-brand-light-border px-5 py-4 dark:border-brand-border">
          <h2
            id="day-history-title"
            class="font-display text-lg font-semibold capitalize text-brand-light-text-primary dark:text-brand-text-primary"
          >
            {{ snapshot().dateLabel }}
          </h2>
        </div>

        <div class="overflow-y-auto px-5 py-4">
          @if (!snapshot().hasExpectedHabits) {
            <p
              class="text-sm leading-relaxed text-brand-light-text-secondary dark:text-brand-text-secondary"
            >
              Nenhum hábito estava programado para este dia.
            </p>
          } @else {
            <ul class="space-y-4" aria-label="Hábitos do dia">
              @for (entry of snapshot().entries; track entry.habitId) {
                <li class="space-y-1">
                  <p
                    class="text-xs italic tabular-nums text-brand-light-text-secondary dark:text-brand-text-secondary"
                  >
                    {{ entry.reminderDisplay }}
                  </p>

                  <div class="flex items-start gap-2.5">
                    <p
                      class="min-w-0 flex-1 text-sm leading-snug text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      {{ entryLabel(entry) }}
                    </p>

                    @if (entry.status === 'done') {
                      <span
                        class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-light-primary dark:bg-brand-primary"
                        [attr.aria-label]="entryLabel(entry) + ', feito'"
                      >
                        <i
                          class="bi bi-check text-[10px] text-white dark:text-brand-bg"
                          aria-hidden="true"
                        ></i>
                      </span>
                    } @else {
                      <span
                        class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-light-text-secondary/45 dark:border-white/85"
                        [attr.aria-label]="entryLabel(entry) + ', não feito'"
                      >
                        <i
                          class="bi bi-x text-xs text-brand-light-text-secondary dark:text-white/90"
                          aria-hidden="true"
                        ></i>
                      </span>
                    }
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <div class="border-t border-brand-light-border px-5 py-4 dark:border-brand-border">
          <button
            type="button"
            class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-surface dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-surface"
            (click)="dismissed.emit()"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DayHistoryModalComponent {
  readonly snapshot = input.required<DayHistorySnapshot>();

  readonly dismissed = output<void>();

  protected entryLabel(entry: DayHistoryEntry): string {
    return formatHabitCardTitle(entry.name, entry.meta);
  }
}
