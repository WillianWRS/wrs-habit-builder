import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { HabitCardComponent } from '../../../today/components/habit-card/habit-card.component';
import { ModalFocusTrapDirective } from '../../../../shared/directives/modal-focus-trap.directive';
import {
  STREAK_LEVELS_GUIDE_EXAMPLES,
  STREAK_LEVELS_GUIDE_INTRO,
} from '../../data/streak-levels-guide.data';

@Component({
  selector: 'app-streak-levels-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HabitCardComponent, ModalFocusTrapDirective],
  styles: `
    .streak-levels-modal-scroll {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .streak-levels-modal-scroll::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <div class="fixed inset-0 z-50">
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      ></div>

      <div
        class="streak-levels-modal-scroll fixed inset-0 overflow-y-auto overscroll-y-contain"
        appModalFocusTrap
        role="presentation"
        (click)="dismissed.emit()"
        (keydown.escape)="dismissed.emit()"
      >
        <div
          class="flex min-h-full items-end justify-center px-4 pb-6 pt-16 sm:items-center sm:p-4"
        >
          <div
            class="relative flex w-full max-w-lg flex-col rounded-2xl border border-brand-light-border bg-brand-light-surface shadow-xl md:max-w-2xl dark:border-brand-border dark:bg-brand-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="streak-levels-title"
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
          >
            <div class="border-b border-brand-light-border px-5 py-4 dark:border-brand-border">
              <h2
                id="streak-levels-title"
                class="font-display text-lg font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
              >
                Níveis de sequência
              </h2>
              <p
                class="mt-2 text-sm leading-relaxed text-brand-light-text-secondary dark:text-brand-text-secondary"
              >
                {{ intro }}
              </p>
            </div>

            <div class="space-y-5 px-5 py-4">
              @for (example of examples; track example.habitId) {
                <section class="space-y-2">
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary"
                  >
                    Nível {{ example.level }} · {{ example.title }} ·
                    {{ example.thresholdLabel }}
                  </p>

                  <div class="pointer-events-none select-none" aria-hidden="true">
                    <app-habit-card
                      [habitId]="example.habitId"
                      [name]="example.name"
                      [displayMeta]="example.displayMeta"
                      [scheduleDays]="example.scheduleDays"
                      [time]="example.time"
                      [category]="example.category"
                      [marqueeItems]="example.marqueeItems"
                      [minimumAction]="example.minimumAction"
                      [dayCount]="example.dayCount"
                      [completed]="true"
                    />
                  </div>
                </section>
              }
            </div>

            <div class="border-t border-brand-light-border px-5 py-4 dark:border-brand-border">
              <button
                type="button"
                class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-surface dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-surface"
                (click)="dismissed.emit()"
              >
                <i class="bi bi-x text-base leading-none" aria-hidden="true"></i>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StreakLevelsModalComponent {
  readonly dismissed = output<void>();

  protected readonly intro = STREAK_LEVELS_GUIDE_INTRO;
  protected readonly examples = STREAK_LEVELS_GUIDE_EXAMPLES;
}
