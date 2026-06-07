import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DayProgressTier = 'red' | 'orange' | 'yellow' | 'light-yellow' | 'complete';

@Component({
  selector: 'app-day-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes progress-complete-sweep {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .day-progress-fill {
      transition: width 300ms ease-out;
    }

    .day-progress-fill[data-tier='red'] {
      background-color: #dc2626;
    }

    :host-context(.dark) .day-progress-fill[data-tier='red'] {
      background-color: #ef4444;
    }

    .day-progress-fill[data-tier='orange'] {
      background-color: #ea580c;
    }

    :host-context(.dark) .day-progress-fill[data-tier='orange'] {
      background-color: #f97316;
    }

    .day-progress-fill[data-tier='yellow'] {
      background-color: #ca8a04;
    }

    :host-context(.dark) .day-progress-fill[data-tier='yellow'] {
      background-color: #eab308;
    }

    .day-progress-fill[data-tier='light-yellow'] {
      background-color: #facc15;
    }

    :host-context(.dark) .day-progress-fill[data-tier='light-yellow'] {
      background-color: #fde047;
    }

    /* 100% — verde fixo em qualquer accent; claro varre direita ↔ esquerda */
    .day-progress-fill[data-tier='complete'] {
      --progress-green: 0 200 83;
      --progress-green-light: 185 246 202;
      background: linear-gradient(
        90deg,
        rgb(var(--progress-green)) 0%,
        rgb(var(--progress-green)) 30%,
        rgb(var(--progress-green-light)) 50%,
        rgb(var(--progress-green)) 70%,
        rgb(var(--progress-green)) 100%
      );
      background-size: 220% 100%;
      animation: progress-complete-sweep 2.6s ease-in-out infinite alternate;
    }

    :host-context(.dark) .day-progress-fill[data-tier='complete'] {
      --progress-green: 0 230 118;
      --progress-green-light: 167 243 208;
    }

    @media (prefers-reduced-motion: reduce) {
      .day-progress-fill {
        transition: none;
      }

      .day-progress-fill[data-tier='complete'] {
        animation: none;
        background: rgb(var(--progress-green));
        background-size: auto;
      }
    }
  `,
  template: `
    <div class="space-y-2">
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-brand-light-border/60 ring-1 ring-brand-light-border dark:bg-brand-bg dark:ring-brand-border"
        role="progressbar"
        [attr.aria-valuenow]="done()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="total()"
        [attr.aria-label]="'Progresso do dia: ' + done() + ' de ' + total() + ' hábitos'"
      >
        <div
          class="day-progress-fill h-full rounded-full motion-reduce:transition-none"
          [attr.data-tier]="progressTier()"
          [style.width.%]="percent()"
        ></div>
      </div>
      <p class="text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
        {{ done() }}/{{ total() }} hábitos
      </p>
    </div>
  `,
})
export class DayProgressComponent {
  readonly done = input.required<number>();
  readonly total = input.required<number>();

  protected readonly percent = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.done() / total) * 100);
  });

  protected readonly progressTier = computed((): DayProgressTier => {
    const percent = this.percent();

    if (percent >= 100) {
      return 'complete';
    }
    if (percent < 20) {
      return 'red';
    }
    if (percent < 40) {
      return 'orange';
    }
    if (percent < 60) {
      return 'yellow';
    }

    return 'light-yellow';
  });
}
