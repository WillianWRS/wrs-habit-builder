import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-day-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          class="h-full rounded-full bg-brand-light-primary transition-all duration-300 motion-reduce:transition-none dark:bg-brand-primary"
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
}
