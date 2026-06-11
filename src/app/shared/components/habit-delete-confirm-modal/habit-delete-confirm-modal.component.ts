import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-habit-delete-confirm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      role="presentation"
      (click)="dismissed.emit()"
      (keydown.escape)="dismissed.emit()"
    >
      <div
        class="w-full max-w-sm rounded-2xl border border-brand-light-border bg-brand-light-surface p-5 shadow-xl dark:border-brand-border dark:bg-brand-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-delete-title"
        aria-describedby="habit-delete-description"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
      >
        <h2
          id="habit-delete-title"
          class="font-display text-lg font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
        >
          Excluir permanentemente?
        </h2>

        <p
          id="habit-delete-description"
          class="mt-3 text-sm leading-relaxed text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          O hábito
          <span class="font-medium text-brand-light-text-primary dark:text-brand-text-primary">
            {{ habitName() }}
          </span>
          e todo o histórico de conclusões serão apagados. Essa ação é
          irreversível.
        </p>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-surface dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-surface"
            (click)="dismissed.emit()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-lg bg-brand-light-primary px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-surface dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-surface"
            (click)="confirmed.emit()"
          >
            Excluir permanentemente
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HabitDeleteConfirmModalComponent {
  readonly habitName = input.required<string>();

  readonly confirmed = output<void>();
  readonly dismissed = output<void>();
}
