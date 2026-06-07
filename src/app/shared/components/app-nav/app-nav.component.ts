import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

export type AppNavTab = 'today' | 'habits' | 'create';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <!-- Mobile: theme toggle fixo no canto superior direito -->
    <div class="fixed top-4 right-4 z-30 md:hidden">
      <app-theme-toggle />
    </div>

    <!-- Desktop navbar -->
    <header
      class="sticky top-0 z-20 hidden border-b border-slate-200/80 bg-brand-light-bg/90 backdrop-blur dark:border-brand-surface/80 dark:bg-brand-bg/90 md:block"
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
            <a
              routerLink="/"
              class="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
              [class]="
                activeTab() === 'today'
                  ? 'bg-slate-100 text-brand-light-primary dark:bg-brand-surface/80 dark:text-brand-primary'
                  : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
              "
              [attr.aria-current]="activeTab() === 'today' ? 'page' : null"
            >
              Hoje
            </a>

            <a
              routerLink="/habits"
              class="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
              [class]="
                activeTab() === 'habits'
                  ? 'bg-slate-100 text-brand-light-primary dark:bg-brand-surface/80 dark:text-brand-primary'
                  : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
              "
            >
              Hábitos
            </a>

            <a
              routerLink="/habits/new"
              [class]="
                'ml-2 inline-flex items-center gap-2 rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg' +
                (activeTab() === 'create'
                  ? ' ring-2 ring-brand-light-primary/40 dark:ring-brand-primary/40'
                  : '')
              "
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
            </a>
          </nav>

          <app-theme-toggle />
        </div>
      </div>
    </header>

    <!-- Mobile bottom nav -->
    <nav
      class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-brand-light-bg/95 backdrop-blur dark:border-brand-surface dark:bg-brand-bg/95 md:hidden"
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

        <a
          routerLink="/habits/new"
          class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:text-brand-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-primary dark:focus-visible:ring-brand-primary"
          [class]="
            activeTab() === 'create'
              ? 'text-brand-light-primary dark:text-brand-primary'
              : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
          "
          aria-label="Criar novo hábito"
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
        </a>
      </div>
    </nav>
  `,
})
export class AppNavComponent {
  readonly activeTab = input<AppNavTab>('today');
}
