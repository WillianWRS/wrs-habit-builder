import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

export type ActionIconTooltipVariant = 'primary' | 'danger' | 'success' | 'info';
export type ActionIconTooltipDirection = 'top' | 'bottom';

@Component({
  selector: 'app-action-icon-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'group relative inline-flex',
    '(mouseenter)': 'updatePosition()',
    '(focusin)': 'updatePosition()',
  },
  template: `
    <ng-content />

    <span
      role="tooltip"
      class="pointer-events-none fixed z-[100] hidden -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none md:block"
      [class]="tooltipClass()"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
    >
      {{ label() }}
    </span>
  `,
})
export class ActionIconTooltipComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly label = input.required<string>();
  readonly variant = input<ActionIconTooltipVariant>('primary');
  readonly direction = input<ActionIconTooltipDirection>('top');

  protected readonly position = signal({ x: 0, y: 0 });

  protected readonly tooltipClass = computed(
    () =>
      `${this.direction() === 'top' ? '-translate-y-full' : ''} ${this.variantClass()}`.trim(),
  );

  protected updatePosition(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const gap = 8;

    this.position.set({
      x: rect.left + rect.width / 2,
      y: this.direction() === 'top' ? rect.top - gap : rect.bottom + gap,
    });
  }

  private readonly variantClass = computed(() => {
    switch (this.variant()) {
      case 'danger':
        return 'border-red-500/45 bg-brand-light-surface text-red-600 dark:border-red-400/45 dark:bg-brand-surface dark:text-red-400';
      case 'success':
        return 'border-action-activate-border/45 bg-brand-light-surface text-action-activate dark:border-action-activate-border/45 dark:bg-brand-surface dark:text-action-activate';
      case 'info':
        return 'border-sky-500/45 bg-brand-light-surface text-sky-600 dark:border-sky-400/45 dark:bg-brand-surface dark:text-sky-400';
      default:
        return 'border-brand-light-primary/45 bg-brand-light-surface text-brand-light-primary dark:border-brand-primary/45 dark:bg-brand-surface dark:text-brand-primary';
    }
  });
}
