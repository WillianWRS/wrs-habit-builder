import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { MonthHeatmapCell } from '../../../../core/models/day-history.model';

@Component({
  selector: 'app-heatmap-day-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        [class.cursor-default]="!cell().isClickable"
        [class.opacity-40]="cell().isFuture"
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
        [class.hover:bg-brand-light-bg]="cell().isClickable"
        [class.dark:hover:bg-brand-bg]="cell().isClickable"
        [disabled]="!cell().isClickable"
        [attr.aria-label]="ariaLabel()"
        (click)="onClick()"
      >
        @if (fillClass()) {
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

  readonly dayClick = output<string>();

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

  protected readonly useStrongText = computed(
    () => this.cell().status === 'done' || this.cell().intensity === 3,
  );

  protected ariaLabel(): string {
    const cell = this.cell();

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
    if (!this.cell().isClickable) {
      return;
    }

    this.dayClick.emit(this.cell().dateKey);
  }
}
