import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ActionIconTooltipVariant = 'primary' | 'danger';

@Component({
  selector: 'app-action-icon-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'group relative inline-flex',
  },
  template: `
    <ng-content />

    <span
      role="tooltip"
      class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      [class]="variantClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class ActionIconTooltipComponent {
  readonly label = input.required<string>();
  readonly variant = input<ActionIconTooltipVariant>('primary');

  protected readonly variantClass = computed(() =>
    this.variant() === 'danger'
      ? 'border-red-500/45 bg-brand-light-surface text-red-600 dark:border-red-400/45 dark:bg-brand-surface dark:text-red-400'
      : 'border-brand-light-primary/45 bg-brand-light-surface text-brand-light-primary dark:border-brand-primary/45 dark:bg-brand-surface dark:text-brand-primary',
  );
}
