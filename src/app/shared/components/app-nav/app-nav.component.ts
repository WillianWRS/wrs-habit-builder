import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccentThemeService } from '../../../core/services/accent-theme.service';
import { DemoModeService } from '../../../core/services/demo-mode.service';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { ThemeService } from '../../../core/services/theme.service';

export type AppNavTab = 'today' | 'habits' | 'create';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <!-- Desktop navbar -->
    <header
      class="sticky top-0 z-20 hidden border-b border-brand-light-nav-border bg-brand-light-nav/95 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-md backdrop-saturate-150 dark:border-brand-nav-border dark:bg-brand-nav/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-4px_rgba(0,0,0,0.45)] md:block"
    >
      <div
        class="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 lg:px-8"
      >
        <div class="flex min-w-0 items-center gap-4 justify-self-start">
          <a
            routerLink="/"
            class="group shrink-0 rounded-[18%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            (dblclick)="revealPreviewActions($event)"
          >
            <img
              src="/habit builder.png"
              alt="Habit Builder"
              class="h-11 w-auto rounded-[18%] object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-[filter] duration-200 group-hover:drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] lg:h-12"
              width="120"
              height="48"
            />
          </a>

          @if (!demoMode.isActive()) {
            <a
              routerLink="/habits"
              class="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              [class]="
                activeTab() === 'habits'
                  ? 'border-brand-light-primary bg-brand-light-bg/80 text-brand-light-primary dark:border-brand-primary dark:bg-brand-bg/60 dark:text-brand-primary'
                  : 'border-brand-light-border text-brand-light-text-secondary hover:bg-brand-light-bg hover:text-brand-light-text-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary'
              "
            >
              <i class="bi bi-list-ul text-base" aria-hidden="true"></i>
              Hábitos
            </a>
          }
        </div>

        <nav
          class="justify-self-center"
          aria-label="Navegação principal"
        >
          <a
            routerLink="/"
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-light-primary px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            [attr.aria-current]="activeTab() === 'today' ? 'page' : null"
          >
            <i class="bi bi-calendar text-base" aria-hidden="true"></i>
            Hoje
          </a>
        </nav>

        <div class="flex items-center justify-end gap-2 justify-self-end">
          @if (demoMode.isActive()) {
            <span
              class="inline-flex size-10 cursor-not-allowed items-center justify-center rounded-lg border border-brand-light-border text-brand-light-text-secondary/40 dark:border-brand-border dark:text-brand-text-secondary/40"
              aria-disabled="true"
              title="Indisponível no modo demonstrativo"
            >
              <i class="bi bi-plus-lg text-lg" aria-hidden="true"></i>
            </span>
          } @else if (!hideNewHabit()) {
            <button
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-lg bg-brand-light-primary text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              aria-label="Criar novo hábito"
              (click)="openHabitForm()"
            >
              <i class="bi bi-plus-lg text-lg" aria-hidden="true"></i>
            </button>
          }

          <div #settingsAnchor class="relative">
            <button
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-lg border border-brand-light-border bg-brand-light-surface text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              [class.border-brand-light-primary]="showSettingsMenu()"
              [class.text-brand-light-primary]="showSettingsMenu()"
              [class.dark:border-brand-primary]="showSettingsMenu()"
              [class.dark:text-brand-primary]="showSettingsMenu()"
              aria-label="Configurações"
              [attr.aria-expanded]="showSettingsMenu()"
              aria-haspopup="menu"
              (click)="toggleSettingsMenu($event)"
            >
              <i class="bi bi-gear text-lg" aria-hidden="true"></i>
            </button>

            @if (showSettingsMenu()) {
              <div
                animate.enter="ui-dropdown-enter"
                animate.leave="ui-dropdown-leave"
                class="absolute right-0 top-full z-40 mt-2 min-w-[15rem] overflow-hidden rounded-xl border border-brand-light-border bg-brand-light-surface py-1 shadow-lg dark:border-brand-border dark:bg-brand-surface"
                role="menu"
                aria-label="Configurações"
              >
                @if (demoMode.isActive()) {
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                    role="menuitem"
                    (click)="exitDemoMode()"
                  >
                    <i
                      class="bi bi-arrow-counterclockwise shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                      aria-hidden="true"
                    ></i>
                    Sair do modo demonstrativo
                  </button>
                  <div
                    class="my-1 border-t border-brand-light-border dark:border-brand-border"
                    role="separator"
                  ></div>
                }

                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="toggleTheme()"
                >
                  <i
                    class="bi shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    [class.bi-sun]="themeService.theme() === 'dark'"
                    [class.bi-moon-stars]="themeService.theme() === 'light'"
                    aria-hidden="true"
                  ></i>
                  {{
                    themeService.theme() === 'dark'
                      ? 'Modo claro'
                      : 'Modo escuro'
                  }}
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="toggleAccentTheme()"
                >
                  <i
                    class="bi bi-palette shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    aria-hidden="true"
                  ></i>
                  Alterar tema
                </button>

                @if (showPreviewActions()) {
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                    role="menuitem"
                    (click)="activatePredefinedDemo()"
                  >
                    <i
                      class="bi bi-layers shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                      aria-hidden="true"
                    ></i>
                    Preview levels
                  </button>

                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                    role="menuitem"
                    (click)="activateRandomDemo()"
                  >
                    <i
                      class="bi bi-shuffle shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                      aria-hidden="true"
                    ></i>
                    Preview random
                  </button>
                }

                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="openDataManagement()"
                >
                  <i
                    class="bi bi-database shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    aria-hidden="true"
                  ></i>
                  Gerenciar dados
                </button>
              </div>
            }
          </div>
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
          <i class="bi bi-calendar text-xl" aria-hidden="true"></i>
          Hoje
        </a>

        @if (demoMode.isActive()) {
          <span
            class="flex cursor-not-allowed flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-brand-light-text-secondary/40 dark:text-brand-text-secondary/40"
            aria-disabled="true"
          >
            <i class="bi bi-list-ul text-xl" aria-hidden="true"></i>
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
            <i class="bi bi-list-ul text-xl" aria-hidden="true"></i>
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
              <i class="bi bi-plus-lg text-lg" aria-hidden="true"></i>
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
              <i class="bi bi-plus-lg text-lg" aria-hidden="true"></i>
            </span>
          </button>
        }

        <div #mobileSettingsAnchor class="relative">
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
            [class]="
              showMobileSettingsMenu()
                ? 'text-brand-light-primary dark:text-brand-primary'
                : 'text-brand-light-text-secondary dark:text-brand-text-secondary'
            "
            aria-label="Configurações"
            [attr.aria-expanded]="showMobileSettingsMenu()"
            aria-haspopup="menu"
            (click)="toggleMobileSettingsMenu($event)"
          >
            <i class="bi bi-gear text-xl" aria-hidden="true"></i>
            Ajustes
          </button>

          @if (showMobileSettingsMenu()) {
            <div
              animate.enter="ui-dropdown-up-enter"
              animate.leave="ui-dropdown-up-leave"
              class="absolute bottom-full right-0 z-40 mb-2 min-w-[15rem] overflow-hidden rounded-xl border border-brand-light-border bg-brand-light-surface py-1 shadow-lg dark:border-brand-border dark:bg-brand-surface"
              role="menu"
              aria-label="Configurações"
            >
              @if (demoMode.isActive()) {
                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="exitDemoMode()"
                >
                  <i
                    class="bi bi-arrow-counterclockwise shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    aria-hidden="true"
                  ></i>
                  Sair do modo demonstrativo
                </button>
                <div
                  class="my-1 border-t border-brand-light-border dark:border-brand-border"
                  role="separator"
                ></div>
              }

              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                role="menuitem"
                (click)="toggleTheme()"
              >
                <i
                  class="bi shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                  [class.bi-sun]="themeService.theme() === 'dark'"
                  [class.bi-moon-stars]="themeService.theme() === 'light'"
                  aria-hidden="true"
                ></i>
                {{
                  themeService.theme() === 'dark' ? 'Modo claro' : 'Modo escuro'
                }}
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                role="menuitem"
                (click)="toggleAccentTheme()"
              >
                <i
                  class="bi bi-palette shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                  aria-hidden="true"
                ></i>
                Alterar tema
              </button>

              @if (showPreviewActions()) {
                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="activatePredefinedDemo()"
                >
                  <i
                    class="bi bi-layers shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    aria-hidden="true"
                  ></i>
                  Preview levels
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                  role="menuitem"
                  (click)="activateRandomDemo()"
                >
                  <i
                    class="bi bi-shuffle shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                    aria-hidden="true"
                  ></i>
                  Preview random
                </button>
              }

              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:bg-brand-light-bg dark:text-brand-text-primary dark:hover:bg-brand-bg"
                role="menuitem"
                (click)="openDataManagement()"
              >
                <i
                  class="bi bi-database shrink-0 text-base text-brand-light-primary dark:text-brand-primary"
                  aria-hidden="true"
                ></i>
                Gerenciar dados
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class AppNavComponent {
  private readonly demoModeService = inject(DemoModeService);
  private readonly habitFormModal = inject(HabitFormModalService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);
  protected readonly accentThemeService = inject(AccentThemeService);

  readonly activeTab = input<AppNavTab>('today');
  readonly hideNewHabit = input(false);

  protected readonly demoMode = this.demoModeService;
  protected readonly showSettingsMenu = signal(false);
  protected readonly showMobileSettingsMenu = signal(false);
  protected readonly showPreviewActions = signal(false);

  private readonly settingsAnchor =
    viewChild<ElementRef<HTMLElement>>('settingsAnchor');
  private readonly mobileSettingsAnchor = viewChild<ElementRef<HTMLElement>>(
    'mobileSettingsAnchor',
  );

  protected toggleSettingsMenu(event: Event): void {
    event.stopPropagation();
    this.showSettingsMenu.update((open) => !open);
    this.showMobileSettingsMenu.set(false);
  }

  protected toggleMobileSettingsMenu(event: Event): void {
    event.stopPropagation();
    this.showMobileSettingsMenu.update((open) => !open);
    this.showSettingsMenu.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (!this.showSettingsMenu() && !this.showMobileSettingsMenu()) {
      return;
    }

    const desktopHost = this.settingsAnchor()?.nativeElement;
    const mobileHost = this.mobileSettingsAnchor()?.nativeElement;

    if (desktopHost?.contains(target) || mobileHost?.contains(target)) {
      return;
    }

    this.closeSettingsMenus();
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
    this.closeSettingsMenus();
  }

  protected toggleAccentTheme(): void {
    this.accentThemeService.toggle();
    this.closeSettingsMenus();
  }

  protected revealPreviewActions(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPreviewActions.set(true);
  }

  protected activatePredefinedDemo(): void {
    this.demoModeService.activatePredefined();
    this.closeSettingsMenus();
    this.navigateToTodayIfPreviewRoute();
  }

  protected activateRandomDemo(): void {
    this.demoModeService.activateRandom();
    this.closeSettingsMenus();
    this.navigateToTodayIfPreviewRoute();
  }

  protected exitDemoMode(): void {
    this.demoModeService.deactivate();
    this.closeSettingsMenus();
  }

  protected openDataManagement(): void {
    this.closeSettingsMenus();
    void this.router.navigate(['/data']);
  }

  protected openHabitForm(): void {
    this.habitFormModal.open();
  }

  private closeSettingsMenus(): void {
    this.showSettingsMenu.set(false);
    this.showMobileSettingsMenu.set(false);
  }

  private navigateToTodayIfPreviewRoute(): void {
    const path = this.router.url.split('?')[0].split('#')[0];

    if (path === '/habits' || path === '/data') {
      void this.router.navigate(['/']);
    }
  }
}
