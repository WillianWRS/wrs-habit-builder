import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  HABIT_SORT_OPTIONS,
  type HabitSort,
} from '../../../core/utils/habit-sort.utils';

@Component({
  selector: 'app-habit-sort-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div
      class="inline-flex overflow-hidden rounded-lg border border-brand-light-border bg-brand-light-bg transition-colors focus-within:border-brand-light-primary focus-within:ring-1 focus-within:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:focus-within:border-brand-primary dark:focus-within:ring-brand-primary"
      role="group"
    >
      <span
        [id]="labelId()"
        class="flex shrink-0 items-center self-stretch border-r border-brand-light-border px-2.5 text-xs font-medium text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary"
      >
        Ordenado por
      </span>

      <button
        type="button"
        class="inline-flex min-w-[11rem] items-center justify-between gap-2 bg-transparent px-3 py-1.5 text-left text-xs text-brand-light-text-primary outline-none transition-colors hover:text-brand-light-primary focus-visible:text-brand-light-primary dark:text-brand-text-primary dark:hover:text-brand-primary dark:focus-visible:text-brand-primary"
        [id]="controlId()"
        [attr.aria-expanded]="open()"
        [attr.aria-labelledby]="labelId() + ' ' + controlId()"
        aria-haspopup="listbox"
        (click)="toggle($event)"
      >
        <span class="truncate">{{ selectedLabel() }}</span>
        <i
          class="bi bi-chevron-down shrink-0 text-[10px] text-brand-light-text-secondary transition-transform duration-200 dark:text-brand-text-secondary"
          [class.rotate-180]="open()"
          aria-hidden="true"
        ></i>
      </button>
    </div>

    @if (open()) {
      <div
        animate.enter="ui-dropdown-enter"
        animate.leave="ui-dropdown-leave"
        class="absolute right-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-brand-light-border bg-brand-light-surface py-1 shadow-lg dark:border-brand-border dark:bg-brand-surface"
        role="listbox"
        [attr.aria-labelledby]="labelId()"
      >
        @for (option of sortOptions; track option.id) {
          <button
            type="button"
            class="flex w-full px-3 py-2 text-left text-xs transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:bg-brand-light-bg dark:hover:bg-brand-bg dark:focus-visible:bg-brand-bg"
            role="option"
            [attr.aria-selected]="value() === option.id"
            [class.font-semibold]="value() === option.id"
            [class.text-brand-light-primary]="value() === option.id"
            [class.dark:text-brand-primary]="value() === option.id"
            [class.text-brand-light-text-primary]="value() !== option.id"
            [class.dark:text-brand-text-primary]="value() !== option.id"
            (click)="select(option.id, $event)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    }
  `,
})
export class HabitSortSelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly value = input.required<HabitSort>();
  readonly controlId = input('habit-sort');
  readonly valueChange = output<HabitSort>();

  protected readonly open = signal(false);
  protected readonly sortOptions = HABIT_SORT_OPTIONS;

  protected readonly labelId = computed(() => `${this.controlId()}-label`);

  protected readonly selectedLabel = computed(
    () =>
      HABIT_SORT_OPTIONS.find((option) => option.id === this.value())?.label ??
      '',
  );

  protected toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((isOpen) => !isOpen);
  }

  protected select(sort: HabitSort, event: Event): void {
    event.stopPropagation();
    this.valueChange.emit(sort);
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }

    if (this.host.nativeElement.contains(event.target as Node)) {
      return;
    }

    this.open.set(false);
  }
}
