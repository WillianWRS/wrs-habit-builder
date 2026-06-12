import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { ToastService } from '../../../../core/services/toast.service';
import { toDateKey } from '../../../../core/utils/date.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';

interface ImportFeedback { type: 'error'; message: string }

@Component({
  selector: 'app-data-management-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent],
  template: `
    <app-nav />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header class="mb-6 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Gerenciar dados
        </h1>
        <p
          class="mt-2 max-w-2xl text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          Exporte um backup dos hábitos e conclusões ou importe um arquivo JSON
          exportado anteriormente para restaurar ou transferir seus dados.
        </p>
      </header>

      <section
        class="rounded-2xl border border-brand-light-border bg-brand-light-surface p-6 dark:border-brand-border dark:bg-brand-surface"
        aria-labelledby="data-actions-title"
      >
        <h2
          id="data-actions-title"
          class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
        >
          Backup
        </h2>

        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            [disabled]="isImporting()"
            (click)="exportJson()"
          >
            <i class="bi bi-download text-base" aria-hidden="true"></i>
            Exportar JSON
          </button>

          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-light-border px-4 text-sm font-semibold text-brand-light-text-primary transition-colors hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-border dark:text-brand-text-primary dark:hover:bg-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            [disabled]="isImporting()"
            (click)="triggerImport()"
          >
            <i class="bi bi-upload text-base" aria-hidden="true"></i>
            Importar JSON
          </button>
        </div>

        <input
          #fileInput
          type="file"
          accept="application/json,.json"
          class="hidden"
          (change)="onImportFile($event)"
        />

        @if (feedback(); as message) {
          <p
            class="mt-4 text-center text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {{ message.message }}
          </p>
        }
      </section>
    </main>
  `,
})
export class DataManagementPageComponent {
  private readonly storage = inject(HabitStorageService);
  private readonly toast = inject(ToastService);

  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly feedback = signal<ImportFeedback | null>(null);
  protected readonly isImporting = signal(false);

  protected exportJson(): void {
    const payload = this.storage.exportStorage();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `wrs-habit-builder-${toDateKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected triggerImport(): void {
    if (this.isImporting()) {
      return;
    }

    this.fileInput()?.nativeElement.click();
  }

  protected onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      void this.handleImportFile(String(reader.result), input);
    };

    reader.onerror = () => {
      this.isImporting.set(false);
      this.feedback.set({
        type: 'error',
        message: 'Não foi possível ler o arquivo.',
      });
      input.value = '';
    };

    reader.readAsText(file);
  }

  private async handleImportFile(
    content: string,
    input: HTMLInputElement,
  ): Promise<void> {
    let raw: unknown;

    try {
      raw = JSON.parse(content);
    } catch {
      this.isImporting.set(false);
      this.feedback.set({
        type: 'error',
        message: 'Arquivo JSON inválido.',
      });
      input.value = '';
      return;
    }

    this.feedback.set(null);
    this.isImporting.set(true);

    const result = await this.storage.importStorage(raw);

    this.isImporting.set(false);
    input.value = '';

    if (!result.ok) {
      this.feedback.set({
        type: 'error',
        message: result.message,
      });
      return;
    }

    this.toast.showSuccess(
      formatImportSuccessMessage(result.habitCount, result.completionCount),
    );
  }
}

function formatImportSuccessMessage(
  habitCount: number,
  completionCount: number,
): string {
  const habitsLabel =
    habitCount === 1 ? '1 hábito' : `${habitCount} hábitos`;
  const completionsLabel =
    completionCount === 1
      ? '1 conclusão'
      : `${completionCount} conclusões`;

  return `${habitsLabel} e ${completionsLabel} importados`;
}
