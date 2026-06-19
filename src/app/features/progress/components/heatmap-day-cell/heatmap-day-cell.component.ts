import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { HabitCorrectionDayIntent } from '../../../../core/utils/month-heatmap.utils';
import type { MonthHeatmapCell } from '../../../../core/models/day-history.model';

@Component({
  selector: 'app-heatmap-day-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes heatmap-correction-eligible-pulse {
      0%,
      100% {
        background-color: rgb(161 161 170 / 0.4);
      }

      50% {
        background-color: rgb(248 113 113 / 0.55);
      }
    }

    @keyframes heatmap-correction-selected-pulse {
      0%,
      100% {
        background-color: rgb(var(--accent-rgb-light) / 0.28);
      }

      50% {
        background-color: var(--accent-light);
      }
    }

    @keyframes heatmap-correction-unmark-pulse {
      0%,
      100% {
        background-color: rgb(248 113 113 / 0.55);
      }

      50% {
        background-color: rgb(var(--accent-rgb-light) / 0.28);
      }
    }

    :host-context(.dark) .correction-eligible-pulse {
      animation-name: heatmap-correction-eligible-pulse-dark;
    }

    :host-context(.dark) .correction-selected-pulse {
      animation-name: heatmap-correction-selected-pulse-dark;
    }

    :host-context(.dark) .correction-unmark-pulse {
      animation-name: heatmap-correction-unmark-pulse-dark;
    }

    @keyframes heatmap-correction-eligible-pulse-dark {
      0%,
      100% {
        background-color: rgb(161 161 170 / 0.3);
      }

      50% {
        background-color: rgb(248 113 113 / 0.45);
      }
    }

    @keyframes heatmap-correction-selected-pulse-dark {
      0%,
      100% {
        background-color: rgb(var(--accent-rgb-dark) / 0.28);
      }

      50% {
        background-color: var(--accent-dark);
      }
    }

    @keyframes heatmap-correction-unmark-pulse-dark {
      0%,
      100% {
        background-color: rgb(248 113 113 / 0.45);
      }

      50% {
        background-color: rgb(var(--accent-rgb-dark) / 0.28);
      }
    }

    .correction-eligible-pulse,
    .correction-selected-pulse,
    .correction-unmark-pulse {
      animation-duration: 0.75s;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }

    .correction-eligible-pulse {
      animation-name: heatmap-correction-eligible-pulse;
    }

    .correction-selected-pulse {
      animation-name: heatmap-correction-selected-pulse;
    }

    .correction-unmark-pulse {
      animation-name: heatmap-correction-unmark-pulse;
    }

    @media (prefers-reduced-motion: reduce) {
      .correction-eligible-pulse,
      .correction-selected-pulse,
      .correction-unmark-pulse {
        animation: none;
      }

      .correction-eligible-pulse {
        background-color: rgb(248 113 113 / 0.4);
      }

      .correction-selected-pulse {
        background-color: var(--accent-light);
      }

      .correction-unmark-pulse {
        background-color: rgb(var(--accent-rgb-light) / 0.28);
      }

      :host-context(.dark) .correction-eligible-pulse {
        background-color: rgb(248 113 113 / 0.35);
      }

      :host-context(.dark) .correction-selected-pulse {
        background-color: var(--accent-dark);
      }

      :host-context(.dark) .correction-unmark-pulse {
        background-color: rgb(var(--accent-rgb-dark) / 0.28);
      }
    }
  `,
  template: `
    @if (!cell().inCurrentMonth) {
      <div
        class="relative flex aspect-square w-full items-center justify-center rounded-full text-sm font-medium text-brand-light-text-secondary/15 dark:text-brand-text-secondary/15"
        aria-hidden="true"
      >
        {{ cell().dayNumber }}
      </div>
    } @else {
      <button
        type="button"
        class="relative flex aspect-square w-full flex-col items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
        [class.cursor-default]="!isInteractive()"
        [class.opacity-40]="cell().isFuture && !correctionMode()"
        [class.text-brand-light-text-secondary]="
          cell().isFuture || (!cell().hasExpectedHabits && cell().intensity === 0)
        "
        [class.dark:text-brand-text-secondary]="
          cell().isFuture || (!cell().hasExpectedHabits && cell().intensity === 0)
        "
        [class.text-brand-light-text-primary]="
          !cell().isFuture && (cell().hasExpectedHabits || cell().intensity > 0)
        "
        [class.dark:text-brand-text-primary]="
          !cell().isFuture && (cell().hasExpectedHabits || cell().intensity > 0)
        "
        [class.hover:bg-brand-light-bg]="isInteractive()"
        [class.dark:hover:bg-brand-bg]="isInteractive()"
        [disabled]="!isInteractive()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-pressed]="correctionMode() && correctionIntent() ? correctionSelected() : null"
        (click)="onClick()"
      >
        @if (correctionMode() && correctionIntent() === 'mark' && correctionSelected()) {
          <span
            class="correction-selected-pulse absolute inset-1 rounded-full"
            [style.animation-delay]="correctionPulseDelay()"
            aria-hidden="true"
          ></span>
        } @else if (correctionMode() && correctionIntent() === 'mark') {
          <span
            class="correction-eligible-pulse absolute inset-1 rounded-full"
            [style.animation-delay]="correctionPulseDelay()"
            aria-hidden="true"
          ></span>
        } @else if (correctionMode() && correctionIntent() === 'unmark' && correctionSelected()) {
          <span
            class="correction-unmark-pulse absolute inset-1 rounded-full"
            [style.animation-delay]="correctionPulseDelay()"
            aria-hidden="true"
          ></span>
        } @else if (fillClass()) {
          <span
            class="absolute inset-1 rounded-full"
            [class]="fillClass()"
            aria-hidden="true"
          ></span>
        }

        <span
          class="relative z-[1]"
          [class.text-brand-bg]="useStrongText()"
          [class.dark:text-brand-bg]="useStrongText()"
        >
          {{ cell().dayNumber }}
        </span>
      </button>
    }
  `,
})
export class HeatmapDayCellComponent {
  readonly cell = input.required<MonthHeatmapCell>();
  readonly correctionMode = input(false);
  readonly correctionIntent = input<HabitCorrectionDayIntent | null>(null);
  readonly correctionSelected = input(false);
  readonly correctionPulseDelay = input('0ms');

  readonly dayClick = output<string>();

  protected readonly isInteractive = computed(() => {
    if (this.correctionMode()) {
      return this.correctionIntent() !== null;
    }

    return this.cell().isClickable;
  });

  protected readonly fillClass = computed(() => {
    switch (this.cell().status) {
      case 'done':
        return 'bg-brand-light-primary dark:bg-brand-primary';
      case 'protected':
        return 'bg-sky-500/45 dark:bg-sky-400/45';
      case 'missed':
        return 'bg-zinc-500/35 dark:bg-zinc-400/30';
      case 'skipped':
        return 'bg-brand-light-bg dark:bg-brand-bg';
      case 'future':
        return '';
      default:
        break;
    }

    switch (this.cell().intensity) {
      case 1:
        return 'bg-brand-light-primary/25 dark:bg-brand-primary/25';
      case 2:
        return 'bg-brand-light-primary/55 dark:bg-brand-primary/55';
      case 3:
        return 'bg-brand-light-primary dark:bg-brand-primary';
      default:
        return '';
    }
  });

  protected readonly useStrongText = computed(() => {
    if (this.correctionSelected() && this.correctionIntent() === 'unmark') {
      return false;
    }

    return (
      this.cell().status === 'done' ||
      this.cell().intensity === 3 ||
      (this.correctionSelected() && this.correctionIntent() === 'mark')
    );
  });

  protected ariaLabel(): string {
    const cell = this.cell();
    const intent = this.correctionIntent();

    if (this.correctionMode() && intent) {
      if (intent === 'mark') {
        return `${cell.dayNumber}, ${
          this.correctionSelected()
            ? 'selecionado para marcar'
            : 'disponível para marcar'
        }`;
      }

      return `${cell.dayNumber}, ${
        this.correctionSelected()
          ? 'selecionado para desmarcar'
          : 'disponível para desmarcar'
      }`;
    }

    if (cell.status) {
      const statusLabel: Record<NonNullable<MonthHeatmapCell['status']>, string> = {
        done: 'feito',
        protected: 'protegido',
        missed: 'perdido',
        skipped: 'não esperado',
        future: 'futuro',
      };

      return `${cell.dayNumber}, ${statusLabel[cell.status]}`;
    }

    const parts = [
      `${cell.dayNumber}`,
      cell.isFuture ? 'futuro' : null,
      cell.hasExpectedHabits
        ? `${cell.completionCount} de ${cell.expectedCount} hábitos concluídos`
        : 'sem hábitos esperados',
    ].filter(Boolean);

    return parts.join(', ');
  }

  protected onClick(): void {
    if (!this.isInteractive()) {
      return;
    }

    this.dayClick.emit(this.cell().dateKey);
  }
}
