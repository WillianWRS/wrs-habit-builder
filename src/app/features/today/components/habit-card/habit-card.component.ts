import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export type HabitCardAccent = 'default' | 'physical' | 'wellness';

@Component({
  selector: 'app-habit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes habit-marquee-left {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    .habit-marquee-track {
      display: flex;
      width: max-content;
      animation: habit-marquee-left 28s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .habit-marquee-track {
        animation: none;
      }

      .habit-marquee-viewport {
        overflow-x: auto;
        scrollbar-width: none;
      }

      .habit-marquee-viewport::-webkit-scrollbar {
        display: none;
      }
    }
  `,
  template: `
    <article
      class="rounded-xl border p-4 transition-colors duration-200 motion-reduce:transition-none"
      [class]="
        completed()
          ? 'border-brand-light-primary/30 bg-brand-light-primary/10 dark:border-brand-primary/30 dark:bg-brand-primary/10'
          : 'border-slate-200 bg-white dark:border-brand-surface/80 dark:bg-brand-surface'
      "
      [class.border-l-4]="!completed()"
      [class.border-l-brand-accent-orange]="!completed() && accent() === 'physical'"
      [class.border-l-brand-accent-purple]="!completed() && accent() === 'wellness'"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-1 gap-3">
          <span
            class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 motion-reduce:transition-none"
            [class]="
              completed()
                ? 'border-brand-light-primary bg-brand-light-primary dark:border-brand-primary dark:bg-brand-primary'
                : 'border-brand-light-text-secondary/40 dark:border-brand-text-secondary/50'
            "
            aria-hidden="true"
          >
            @if (completed()) {
              <svg
                class="size-3 text-white transition-transform duration-200 motion-reduce:transition-none dark:text-brand-bg"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 6L5 8.5L9.5 3.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
              <h2
                class="font-medium text-brand-light-text-primary dark:text-brand-text-primary"
              >
                {{ name() }}
              </h2>
              <span
                class="shrink-0 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary"
                >{{ time() }} · {{ category() }}</span
              >
            </div>

            <div
              class="habit-marquee-viewport mt-1 overflow-hidden"
              [attr.aria-label]="marqueeLabel()"
            >
              <div class="habit-marquee-track text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
                @for (copy of [0, 1]; track copy) {
                  <span class="flex shrink-0 items-center gap-2 pr-8" [attr.aria-hidden]="copy === 1">
                    <span>{{ trigger1() }}</span>
                    <span class="leading-none opacity-50" aria-hidden="true">·</span>
                    <span>{{ trigger2() }}</span>
                    <span class="leading-none opacity-50" aria-hidden="true">·</span>
                    <span>{{ motivation1() }}</span>
                    <span class="leading-none opacity-50" aria-hidden="true">·</span>
                    <span>{{ motivation2() }}</span>
                  </span>
                }
              </div>
            </div>

            <p
              class="mt-1 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
            >
              Mínimo: {{ minimumAction() }}
            </p>
          </div>
        </div>

        @if (completed()) {
          <span
            class="shrink-0 text-sm font-medium text-brand-light-primary dark:text-brand-primary"
            >✓ Feito</span
          >
        } @else {
          <button
            type="button"
            class="shrink-0 rounded-lg bg-brand-light-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            [attr.aria-label]="'Marcar ' + name() + ' como feito'"
            (click)="markToggle.emit()"
          >
            Marcar ✓
          </button>
        }
      </div>

      @if (completed()) {
        <button
          type="button"
          class="mt-3 text-xs text-brand-light-text-secondary underline-offset-2 hover:text-brand-light-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
          [attr.aria-label]="'Desmarcar ' + name()"
          (click)="markToggle.emit()"
        >
          Desmarcar
        </button>
      }
    </article>
  `,
})
export class HabitCardComponent {
  readonly name = input.required<string>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly trigger1 = input.required<string>();
  readonly trigger2 = input.required<string>();
  readonly motivation1 = input.required<string>();
  readonly motivation2 = input.required<string>();
  readonly minimumAction = input.required<string>();
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();

  protected readonly marqueeLabel = computed(
    () =>
      `${this.trigger1()}. ${this.trigger2()}. ${this.motivation1()}. ${this.motivation2()}.`,
  );
}
