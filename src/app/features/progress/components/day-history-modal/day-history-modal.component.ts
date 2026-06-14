import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  DayHistoryEntry,
  DayHistorySnapshot,
} from '../../../../core/models/day-history.model';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';
import { ModalFocusTrapDirective } from '../../../../shared/directives/modal-focus-trap.directive';

@Component({
  selector: 'app-day-history-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalFocusTrapDirective],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 pt-16 backdrop-blur-sm sm:items-center sm:p-4"
      appModalFocusTrap
      role="presentation"
      (click)="dismissed.emit()"
      (keydown.escape)="dismissed.emit()"
    >
      <div
        class="flex max-h-[min(80dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-brand-light-border bg-brand-light-surface shadow-xl dark:border-brand-border dark:bg-brand-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-history-title"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
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
                  <div class="flex items-center gap-1.5">
                    <p
                      class="text-xs italic tabular-nums text-brand-light-text-secondary dark:text-brand-text-secondary"
                    >
                      {{ entry.reminderDisplay }}
                    </p>

                    @if (hasNote(entry)) {
                      <button
                        type="button"
                        class="inline-flex size-4 shrink-0 items-center justify-center text-brand-light-primary transition-colors hover:text-brand-light-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-primary dark:hover:text-brand-primary/80 dark:focus-visible:ring-brand-primary"
                        [attr.aria-label]="'Ver nota do dia para ' + entry.name"
                        [attr.aria-expanded]="openNoteTooltip()?.habitId === entry.habitId"
                        (click)="toggleNoteTooltip(entry, $event)"
                      >
                        <i class="bi bi-sticky text-xs" aria-hidden="true"></i>
                      </button>
                    }
                  </div>

                  <div class="flex items-start gap-2.5">
                    <p
                      class="min-w-0 flex-1 text-sm leading-snug text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      {{ entryLabel(entry) }}
                    </p>

                    @if (entry.status === 'done') {
                      <span
                        class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-light-primary dark:bg-brand-primary"
                        [attr.aria-label]="entryLabel(entry) + ', feito'"
                      >
                        <svg
                          class="size-3 text-white dark:text-brand-bg"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </span>
                    } @else if (entry.status === 'protected') {
                      <span
                        class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-sky-500 dark:border-sky-400"
                        [attr.aria-label]="entryLabel(entry) + ', protegido'"
                      >
                        <i
                          class="bi bi-shield-fill text-[10px] leading-none text-sky-500 dark:text-sky-400"
                          aria-hidden="true"
                        ></i>
                      </span>
                    } @else {
                      <span
                        class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-light-text-secondary/45 dark:border-white/85"
                        [attr.aria-label]="entryLabel(entry) + ', não feito'"
                      >
                        <svg
                          class="size-3 text-brand-light-text-secondary dark:text-white/90"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 3L9 9M9 3L3 9"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                    }
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        @if (openNoteTooltip(); as tooltip) {
          <div
            role="tooltip"
            class="pointer-events-none fixed z-[60] max-w-[min(16rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-full rounded-md border border-brand-light-primary/45 bg-brand-light-surface px-3 py-2 text-xs font-medium leading-relaxed text-brand-light-primary shadow-lg dark:border-brand-primary/45 dark:bg-brand-surface dark:text-brand-primary"
            [style.left.px]="tooltip.x"
            [style.top.px]="tooltip.y"
          >
            {{ tooltip.note }}
          </div>
        }

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

  protected readonly openNoteTooltip = signal<{
    habitId: string;
    note: string;
    x: number;
    y: number;
  } | null>(null);

  protected entryLabel(entry: DayHistoryEntry): string {
    return formatHabitCardTitle(entry.name, entry.meta);
  }

  protected hasNote(entry: DayHistoryEntry): boolean {
    return entry.dailyNote.trim().length > 0;
  }

  protected toggleNoteTooltip(entry: DayHistoryEntry, event: MouseEvent): void {
    event.stopPropagation();

    if (this.openNoteTooltip()?.habitId === entry.habitId) {
      this.openNoteTooltip.set(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    this.openNoteTooltip.set({
      habitId: entry.habitId,
      note: entry.dailyNote,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }
}
