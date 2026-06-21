import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { HabitStorageService } from '../../../core/services/habit-storage.service';
import {
  findCategoryMatch,
  normalizeCategoryName,
} from '../../../core/utils/habit-categories.utils';

@Component({
  selector: 'app-habit-category-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HabitCategorySelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="relative">
      <button
        #triggerButton
        type="button"
        class="habit-form-field flex w-full items-center justify-between gap-2 text-left"
        [id]="controlId()"
        [disabled]="disabled()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId()"
        aria-haspopup="listbox"
        (click)="toggle($event)"
      >
        <span
          class="min-w-0 truncate"
          [class.text-brand-light-text-secondary]="!selectedLabel()"
          [class.dark:text-brand-text-secondary]="!selectedLabel()"
        >
          {{ selectedLabel() || placeholder() }}
        </span>
        <i
          class="bi bi-chevron-down shrink-0 text-xs text-brand-light-text-secondary transition-transform duration-200 dark:text-brand-text-secondary"
          [class.rotate-180]="open()"
          aria-hidden="true"
        ></i>
      </button>

      @if (open()) {
        <div
          animate.enter="ui-dropdown-enter"
          animate.leave="ui-dropdown-leave"
          class="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-brand-light-border bg-brand-light-surface shadow-lg dark:border-brand-border dark:bg-brand-surface"
        >
          <div class="border-b border-brand-light-border p-2 dark:border-brand-border">
            <input
              #searchInput
              type="search"
              class="habit-form-field"
              placeholder="Buscar categoria..."
              autocomplete="off"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              (keydown.enter.prevent)="selectHighlighted($event)"
              (keydown.escape.prevent)="close()"
              (keydown.arrowDown.prevent)="moveHighlight(1)"
              (keydown.arrowUp.prevent)="moveHighlight(-1)"
            />
          </div>

          <div
            [id]="listboxId()"
            class="max-h-52 overflow-y-auto py-1"
            role="listbox"
            [attr.aria-labelledby]="controlId()"
          >
            @for (option of filteredCategories(); track option; let index = $index) {
              <button
                type="button"
                class="flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:bg-brand-light-bg dark:hover:bg-brand-bg dark:focus-visible:bg-brand-bg"
                role="option"
                [attr.aria-selected]="value() === option"
                [class.font-semibold]="value() === option"
                [class.text-brand-light-primary]="value() === option || highlightIndex() === index"
                [class.dark:text-brand-primary]="value() === option || highlightIndex() === index"
                [class.text-brand-light-text-primary]="value() !== option && highlightIndex() !== index"
                [class.dark:text-brand-text-primary]="value() !== option && highlightIndex() !== index"
                (click)="selectCategory(option, $event)"
              >
                {{ option }}
              </button>
            } @empty {
              <p class="px-3 py-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
                Nenhuma categoria encontrada.
              </p>
            }

            @if (canCreateCategory()) {
              <button
                type="button"
                class="flex w-full border-t border-brand-light-border px-3 py-2 text-left text-sm font-medium text-brand-light-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:bg-brand-light-bg dark:border-brand-border dark:text-brand-primary dark:hover:bg-brand-bg dark:focus-visible:bg-brand-bg"
                role="option"
                [attr.aria-selected]="false"
                (click)="createCategory($event)"
              >
                Criar "{{ createCandidate() }}"
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './habit-category-select.component.scss',
})
export class HabitCategorySelectComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly storage = inject(HabitStorageService);

  private readonly triggerButton =
    viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly controlId = input('habit-category');
  readonly placeholder = input('Selecione uma categoria');

  protected readonly open = signal(false);
  protected readonly disabled = signal(false);
  protected readonly value = signal('');
  protected readonly searchQuery = signal('');
  protected readonly highlightIndex = signal(0);

  protected readonly listboxId = computed(() => `${this.controlId()}-listbox`);

  protected readonly categories = computed(() => {
    const list = [...this.storage.categoriesReadonly()];
    list.sort((left, right) => left.localeCompare(right, 'pt-BR'));
    return list;
  });

  protected readonly filteredCategories = computed(() => {
    const query = normalizeCategoryName(this.searchQuery()).toLowerCase();

    if (!query) {
      return this.categories();
    }

    return this.categories().filter((category) =>
      category.toLowerCase().includes(query),
    );
  });

  protected readonly createCandidate = computed(() =>
    normalizeCategoryName(this.searchQuery()),
  );

  protected readonly canCreateCategory = computed(() => {
    const candidate = this.createCandidate();

    if (!candidate) {
      return false;
    }

    return !findCategoryMatch(this.categories(), candidate);
  });

  protected readonly selectedLabel = computed(() => {
    const current = normalizeCategoryName(this.value());

    if (!current) {
      return '';
    }

    return findCategoryMatch(this.categories(), current) ?? current;
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }

      queueMicrotask(() => {
        this.searchInput()?.nativeElement.focus();
        this.searchInput()?.nativeElement.select();
      });
    });

    effect(() => {
      this.filteredCategories();
      this.canCreateCategory();
      this.highlightIndex.set(0);
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggle(event: Event): void {
    event.stopPropagation();

    if (this.disabled()) {
      return;
    }

    if (this.open()) {
      this.close();
      return;
    }

    this.searchQuery.set('');
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
    this.searchQuery.set('');
    this.onTouched();
    this.triggerButton()?.nativeElement.focus();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected selectCategory(category: string, event: Event): void {
    event.stopPropagation();
    this.applyValue(category);
    this.close();
  }

  protected createCategory(event: Event): void {
    event.stopPropagation();
    const created = this.storage.ensureCategory(this.createCandidate());
    this.applyValue(created);
    this.close();
  }

  protected selectHighlighted(event: Event): void {
    event.stopPropagation();

    if (this.canCreateCategory()) {
      this.createCategory(event);
      return;
    }

    const options = this.filteredCategories();
    const highlighted = options[this.highlightIndex()];

    if (highlighted) {
      this.selectCategory(highlighted, event);
    }
  }

  protected moveHighlight(delta: number): void {
    const options = this.filteredCategories();
    const extra = this.canCreateCategory() ? 1 : 0;
    const total = options.length + extra;

    if (total === 0) {
      return;
    }

    this.highlightIndex.update(
      (index) => (((index + delta) % total) + total) % total,
    );
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }

    if (this.host.nativeElement.contains(event.target as Node)) {
      return;
    }

    this.close();
  }

  private applyValue(category: string): void {
    this.value.set(category);
    this.onChange(category);
  }
}
