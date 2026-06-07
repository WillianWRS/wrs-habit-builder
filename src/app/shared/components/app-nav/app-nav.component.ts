import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoModeService } from '../../../core/services/demo-mode.service';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AccentThemeToggleComponent } from '../accent-theme-toggle/accent-theme-toggle.component';

export type AppNavTab = 'today' | 'habits' | 'create';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ThemeToggleComponent, AccentThemeToggleComponent],
  template: `
    <!-- Mobile: toggles fixos no topo -->
    <div class="fixed top-4 right-4 z-30 flex items-center gap-2 md:hidden">
      <app-accent-theme-toggle />
      <app-theme-toggle />
    </div>

    <div class="fixed top-4 left-4 z-30 md:hidden">
      <button
        type="button"
        class="rounded-lg border border-brand-light-nav-border bg-brand-light-nav/95 px-3 py-1.5 text-xs font-medium text-brand-light-text-secondary shadow-sm backdrop-blur-md transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-nav-border dark:bg-brand-nav/95 dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
        (click)="toggleDemoMode()"
      >
        {{ demoModeLabel() }}
      </button>
    </div>

    <!-- Desktop navbar -->
    <header
      class="sticky top-0 z-20 hidden border-b border-brand-light-nav-border bg-brand-light-nav/95 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-md backdrop-saturate-150 dark:border-brand-nav-border dark:bg-brand-nav/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.45)] md:block"
    >
      <div
        class="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-3 lg:px-8"
      >
        <a
          routerLink="/"
          class="shrink-0 rounded-[20%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
        >
          <img
            src="/habit builder.png"
            alt="Habit Builder"
            class="h-11 w-auto rounded-[20%] object-contain lg:h-12"
            width="120"
            height="48"
          />
        </a>

        <div class="flex items-center gap-3">
          <nav class="flex items-center gap-1" aria-label="Navegação principal">
            <button
              type="button"
              class="rounded-lg border border-brand-light-border px-3 py-2 text-sm font-medium text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
              (click)="toggleDemoMode()"
            >
              {{ demoModeLabel() }}
            </button>

            <a
              routerLink="/"
              class="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
              [class]="
                activeTab() === 'today'
                  ? 'bg-brand-light-bg/80 text-brand-light-primary dark:bg-brand-bg/60 dark:text-brand-primary'
                  : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
              "
              [attr.aria-current]="activeTab() === 'today' ? 'page' : null"
            >
              Hoje
            </a>

            @if (demoMode.isActive()) {
              <span
                class="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium text-brand-light-text-secondary/40 dark:text-brand-text-secondary/40"
                aria-disabled="true"
                title="Indisponível no modo demonstrativo"
              >
                Hábitos
              </span>
            } @else {
              <a
                routerLink="/habits"
                class="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                [class]="
                  activeTab() === 'habits'
                    ? 'bg-brand-light-bg/80 text-brand-light-primary dark:bg-brand-bg/60 dark:text-brand-primary'
                    : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
                "
              >
                Hábitos
              </a>
            }

            @if (demoMode.isActive()) {
              <span
                class="ml-2 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-brand-light-primary/40 px-4 py-2 text-sm font-semibold text-white/70 dark:bg-brand-primary/40 dark:text-brand-bg/70"
                aria-disabled="true"
                title="Indisponível no modo demonstrativo"
              >
                <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                Novo hábito
              </span>
            } @else if (!hideNewHabit()) {
              <button
                type="button"
                class="ml-2 inline-flex items-center gap-2 rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
                (click)="openHabitForm()"
              >
                <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                Novo hábito
              </button>
            }
          </nav>

          <app-accent-theme-toggle />
          <app-theme-toggle />
        </div>
      </div>
    </header>

    <!-- Mobile bottom nav -->
    <nav
      class="fixed inset-x-0 bottom-0 z-10 border-t border-brand-light-nav-border bg-brand-light-nav/98 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.1)] backdrop-blur-md backdrop-saturate-150 dark:border-brand-nav-border dark:bg-brand-nav/98 dark:shadow-[0_-1px_0_rgba(255,255,255,0.06),0_-8px_32px_-8px_rgba(0,0,0,0.55)] md:hidden"
      aria-label="Navegação principal"
    >
      <div
        class="mx-auto flex max-w-lg items-center justify-around px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      >
        <a
          routerLink="/"
          class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
          [class]="
            activeTab() === 'today'
              ? 'text-brand-light-primary dark:text-brand-primary'
              : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
          "
          [attr.aria-current]="activeTab() === 'today' ? 'page' : null"
        >
          <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
          Hoje
        </a>

        @if (demoMode.isActive()) {
          <span
            class="flex cursor-not-allowed flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-brand-light-text-secondary/40 dark:text-brand-text-secondary/40"
            aria-disabled="true"
          >
            <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Hábitos
          </span>
        } @else {
          <a
            routerLink="/habits"
            class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            [class]="
              activeTab() === 'habits'
                ? 'text-brand-light-primary dark:text-brand-primary'
                : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
            "
          >
            <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Hábitos
          </a>
        }

        @if (demoMode.isActive()) {
          <span
            class="flex cursor-not-allowed flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-brand-light-text-secondary/40 dark:text-brand-text-secondary/40"
            aria-disabled="true"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-brand-light-primary/40 text-white/70 dark:bg-brand-primary/40 dark:text-brand-bg/70"
            >
              <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </span>
        } @else if (!hideNewHabit()) {
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-brand-light-text-secondary transition-colors hover:text-brand-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-primary dark:focus-visible:ring-brand-primary"
            aria-label="Criar novo hábito"
            (click)="openHabitForm()"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-brand-light-primary text-white transition-transform hover:scale-105 motion-reduce:transform-none dark:bg-brand-primary dark:text-brand-bg"
            >
              <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </button>
        }
      </div>
    </nav>
  `,
})
export class AppNavComponent {
  private readonly demoModeService = inject(DemoModeService);
  private readonly habitFormModal = inject(HabitFormModalService);

  readonly activeTab = input<AppNavTab>('today');
  readonly hideNewHabit = input(false);
  protected readonly demoMode = this.demoModeService;

  protected demoModeLabel(): string {
    return this.demoMode.isActive() ? 'Dados reais' : 'Dados demonstrativos';
  }

  protected toggleDemoMode(): void {
    this.demoMode.toggle();
  }

  protected openHabitForm(): void {
    this.habitFormModal.open();
  }
}
