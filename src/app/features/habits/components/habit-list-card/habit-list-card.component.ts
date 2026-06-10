import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { HabitCardAccent } from '../../../../core/models/today-habit-card.model';
import type { MarqueeItem } from '../../../../core/utils/habit-trigger-motivation.utils';
import type { Weekday } from '../../../../core/models/weekday.model';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';
import { WeekdayScheduleComponent } from '../../../../shared/components/weekday-schedule/weekday-schedule.component';

@Component({
  selector: 'app-habit-list-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeekdayScheduleComponent],
  template: `
    <article
      class="rounded-xl border p-4 transition-colors"
      [class]="
        archived()
          ? 'border-dashed border-brand-light-border/70 bg-brand-light-bg/60 opacity-75 dark:border-brand-border/70 dark:bg-brand-bg/50'
          : 'border-brand-light-border bg-brand-light-surface shadow-sm dark:border-brand-border dark:bg-brand-surface'
      "
      [class.border-l-4]="!archived() && accent() === 'physical'"
      [class.border-l-brand-accent-orange]="!archived() && accent() === 'physical'"
      [class.border-l-brand-accent-purple]="!archived() && accent() === 'wellness'"
    >
      @if (archived()) {
        <p
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-light-border/80 bg-brand-light-surface/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-light-text-secondary dark:border-brand-border/80 dark:bg-brand-surface/60 dark:text-brand-text-secondary"
        >
          <i class="bi bi-archive text-[10px]" aria-hidden="true"></i>
          Arquivado
        </p>
      }

      <div class="flex items-start gap-3">
        <div class="flex shrink-0 flex-col items-center gap-1.5">
          <div
            class="flex flex-col items-center leading-none"
            [attr.aria-label]="dayCount() + ' dias de sequência'"
          >
            <span
              class="text-[10px] font-medium text-brand-light-text-secondary dark:text-brand-text-secondary"
              >dia</span
            >
            <span
              class="text-2xl font-bold tabular-nums"
              [class]="
                archived()
                  ? 'text-brand-light-text-secondary dark:text-brand-text-secondary'
                  : 'text-brand-light-primary dark:text-brand-primary'
              "
              >{{ dayCount() }}</span
            >
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h2
                  class="font-medium"
                  [class]="
                    archived()
                      ? 'text-brand-light-text-secondary line-through decoration-brand-light-border dark:text-brand-text-secondary dark:decoration-brand-border'
                      : 'text-brand-light-text-primary dark:text-brand-text-primary'
                  "
                >
                  {{ displayTitle() }}
                </h2>
                <span
                  class="shrink-0 text-xs italic text-brand-light-text-secondary dark:text-brand-text-secondary"
                  >{{ time() }} · {{ category() }}</span
                >
              </div>

              <app-weekday-schedule
                class="mt-2"
                [selectedDays]="scheduleDays()"
                [readonly]="true"
              />

              @if (marqueeItems().length > 0) {
                <ul
                  class="mt-2 space-y-1 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
                  role="list"
                >
                  @for (item of marqueeItems(); track item.text + item.type) {
                    <li class="flex items-start gap-1.5">
                      <i
                        class="bi mt-0.5 shrink-0 text-xs"
                        [class.bi-lightning-charge]="item.type === 'trigger'"
                        [class.bi-trophy]="item.type === 'motivation'"
                        [class]="
                          archived()
                            ? 'text-brand-light-text-secondary/70 dark:text-brand-text-secondary/70'
                            : 'text-brand-light-primary dark:text-brand-primary'
                        "
                        aria-hidden="true"
                      ></i>
                      <span>{{ item.text }}</span>
                    </li>
                  }
                </ul>
              }

              <p
                class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
              >
                Mínimo: {{ minimumAction() }}
              </p>
            </div>

            <div class="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                class="rounded-lg border border-brand-light-border p-2 text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:bg-brand-light-bg hover:text-brand-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:bg-brand-bg dark:hover:text-brand-primary dark:focus-visible:ring-brand-primary"
                [attr.aria-label]="'Editar ' + name()"
                (click)="edit.emit()"
              >
                <i class="bi bi-pencil text-sm" aria-hidden="true"></i>
              </button>

              @if (!archived()) {
                <button
                  type="button"
                  class="rounded-lg border border-brand-light-border p-2 text-brand-light-text-secondary transition-colors hover:border-red-400/50 hover:bg-red-500/5 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-red-400/50 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:focus-visible:ring-red-400"
                  [attr.aria-label]="'Arquivar ' + name()"
                  (click)="archive.emit()"
                >
                  <i class="bi bi-archive text-sm" aria-hidden="true"></i>
                </button>
              } @else {
                <button
                  type="button"
                  class="rounded-lg border border-brand-light-border p-2 text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:bg-brand-light-primary/10 hover:text-brand-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:bg-brand-primary/10 dark:hover:text-brand-primary dark:focus-visible:ring-brand-primary"
                  [attr.aria-label]="'Recuperar ' + name()"
                  (click)="restore.emit()"
                >
                  <i class="bi bi-arrow-counterclockwise text-sm" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-brand-light-border p-2 text-brand-light-text-secondary transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-red-400/50 dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:focus-visible:ring-red-400"
                  [attr.aria-label]="'Excluir permanentemente ' + name()"
                  (click)="deletePermanently.emit()"
                >
                  <i class="bi bi-trash text-sm" aria-hidden="true"></i>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </article>
  `,
})
export class HabitListCardComponent {
  readonly name = input.required<string>();
  readonly displayMeta = input('');
  readonly scheduleDays = input.required<Weekday[]>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly marqueeItems = input.required<MarqueeItem[]>();
  readonly minimumAction = input.required<string>();
  readonly dayCount = input<number>(0);
  readonly accent = input<HabitCardAccent>('default');
  readonly archived = input(false);

  readonly edit = output<void>();
  readonly archive = output<void>();
  readonly restore = output<void>();
  readonly deletePermanently = output<void>();

  protected readonly displayTitle = computed(() =>
    formatHabitCardTitle(this.name(), this.displayMeta()),
  );
}
