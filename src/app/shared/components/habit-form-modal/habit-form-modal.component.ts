import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../core/services/habit-storage.service';

const MINIMUM_ACTION_MAX = 140;

@Component({
  selector: 'app-habit-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    @if (modal.isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-8 pt-20 backdrop-blur-sm md:px-6 md:pt-24"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <div
          class="mx-auto flex w-full max-w-5xl gap-6 lg:px-8"
          role="presentation"
        >
          <div
            class="hidden w-[7.5rem] shrink-0 md:block"
            aria-hidden="true"
          ></div>

          <div
            class="min-w-0 flex-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-form-title"
            (click)="$event.stopPropagation()"
          >
            <form
              class="rounded-2xl border border-brand-light-border bg-brand-light-surface shadow-xl dark:border-brand-border dark:bg-brand-surface"
              [formGroup]="form"
              (ngSubmit)="submit()"
            >
              <div
                class="flex items-center justify-between border-b border-brand-light-border px-5 py-4 dark:border-brand-border md:px-6"
              >
                <h2
                  id="habit-form-title"
                  class="font-display text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
                >
                  Novo hábito
                </h2>
                <button
                  type="button"
                  class="rounded-lg p-2 text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                  aria-label="Fechar"
                  (click)="close()"
                >
                  <i class="bi bi-x-lg text-sm" aria-hidden="true"></i>
                </button>
              </div>

              <div class="space-y-5 px-5 py-5 md:px-6">
                <div>
                  <label
                    for="habit-name"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Nome
                  </label>
                  <input
                    id="habit-name"
                    type="text"
                    formControlName="name"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Treinar musculação"
                  />
                  @if (showError('name', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe o nome do hábito.</p>
                  }
                </div>

                <div>
                  <label
                    for="habit-category"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Categoria
                  </label>
                  <input
                    id="habit-category"
                    type="text"
                    formControlName="category"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Corpo"
                  />
                  @if (showError('category', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe a categoria.</p>
                  }
                </div>

                <div>
                  <label
                    for="habit-trigger1"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Gatilho 1
                  </label>
                  <input
                    id="habit-trigger1"
                    type="text"
                    formControlName="trigger1"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Ao vestir o tênis de treino"
                  />
                  @if (showError('trigger1', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe o gatilho 1.</p>
                  }
                </div>

                <div>
                  <label
                    for="habit-trigger2"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Gatilho 2
                  </label>
                  <input
                    id="habit-trigger2"
                    type="text"
                    formControlName="trigger2"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Depois do alongamento"
                  />
                  @if (showError('trigger2', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe o gatilho 2.</p>
                  }
                </div>

                <div>
                  <label
                    for="habit-motivation1"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Motivação 1
                  </label>
                  <input
                    id="habit-motivation1"
                    type="text"
                    formControlName="motivation1"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Corpo mais forte"
                  />
                  @if (showError('motivation1', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe a motivação 1.</p>
                  }
                </div>

                <div>
                  <label
                    for="habit-motivation2"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Motivação 2
                  </label>
                  <input
                    id="habit-motivation2"
                    type="text"
                    formControlName="motivation2"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Disciplina diária"
                  />
                  @if (showError('motivation2', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe a motivação 2.</p>
                  }
                </div>

                <div>
                  <div class="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      for="habit-minimum-action"
                      class="text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      Ação mínima
                    </label>
                    <span class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                      {{ minimumActionLength() }}/{{ minimumActionMax }}
                    </span>
                  </div>
                  <input
                    id="habit-minimum-action"
                    type="text"
                    formControlName="minimumAction"
                    maxlength="140"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Fazer 1 série de qualquer exercício"
                  />
                  @if (showError('minimumAction', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe a ação mínima.</p>
                  }
                  @if (showError('minimumAction', 'maxlength')) {
                    <p class="mt-1 text-xs text-red-500">
                      Máximo de {{ minimumActionMax }} caracteres.
                    </p>
                  }
                </div>

                <div>
                  <label
                    for="habit-reminder"
                    class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Horário
                  </label>
                  <input
                    id="habit-reminder"
                    type="time"
                    formControlName="optionalReminder"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                  />
                  @if (showError('optionalReminder', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe o horário.</p>
                  }
                </div>

                <label
                  class="flex cursor-pointer items-center gap-3 rounded-lg border border-brand-light-border px-3 py-2.5 dark:border-brand-border"
                >
                  <input
                    type="checkbox"
                    formControlName="showOnToday"
                    class="size-4 rounded border-brand-light-border text-brand-light-primary focus:ring-brand-light-primary dark:border-brand-border dark:text-brand-primary dark:focus:ring-brand-primary"
                  />
                  <span class="text-sm text-brand-light-text-primary dark:text-brand-text-primary">
                    Exibir na tela Hoje
                  </span>
                </label>
              </div>

              <div
                class="flex justify-end gap-3 border-t border-brand-light-border px-5 py-4 dark:border-brand-border md:px-6"
              >
                <button
                  type="button"
                  class="rounded-lg border border-brand-light-border px-4 py-2 text-sm font-medium text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                  (click)="close()"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
                  [disabled]="form.invalid"
                >
                  Salvar hábito
                </button>
              </div>
            </form>
          </div>

          <div
            class="hidden w-[4.5rem] shrink-0 md:block"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    }
  `,
})
export class HabitFormModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly storage = inject(HabitStorageService);

  protected readonly modal = inject(HabitFormModalService);
  protected readonly minimumActionMax = MINIMUM_ACTION_MAX;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    category: ['', [Validators.required, Validators.minLength(1)]],
    trigger1: ['', [Validators.required, Validators.minLength(1)]],
    trigger2: ['', [Validators.required, Validators.minLength(1)]],
    motivation1: ['', [Validators.required, Validators.minLength(1)]],
    motivation2: ['', [Validators.required, Validators.minLength(1)]],
    minimumAction: [
      '',
      [Validators.required, Validators.maxLength(MINIMUM_ACTION_MAX)],
    ],
    optionalReminder: ['', Validators.required],
    showOnToday: [true],
  });

  constructor() {
    effect((onCleanup) => {
      if (!this.modal.isOpen()) {
        return;
      }

      document.body.style.overflow = 'hidden';
      onCleanup(() => {
        document.body.style.overflow = '';
      });
    });
  }

  protected minimumActionLength(): number {
    return this.form.controls.minimumAction.value.length;
  }

  protected showError(
    controlName: keyof typeof this.form.controls,
    errorCode: string,
  ): boolean {
    const control = this.form.controls[controlName];

    return control.touched && control.hasError(errorCode);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.modal.close();
    this.resetForm();
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    this.storage.createHabit({
      name: value.name,
      category: value.category,
      trigger1: value.trigger1,
      trigger2: value.trigger2,
      motivation1: value.motivation1,
      motivation2: value.motivation2,
      minimumAction: value.minimumAction,
      optionalReminder: value.optionalReminder,
      showOnToday: value.showOnToday,
    });

    this.close();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      category: '',
      trigger1: '',
      trigger2: '',
      motivation1: '',
      motivation2: '',
      minimumAction: '',
      optionalReminder: '',
      showOnToday: true,
    });
  }
}
