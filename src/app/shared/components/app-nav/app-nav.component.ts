import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoModeService } from '../../../core/services/demo-mode.service';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';

export type AppNavTab = 'today' | 'habits' | 'historico' | 'create';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SettingsMenuComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.scss',
})
export class AppNavComponent {
  private readonly demoModeService = inject(DemoModeService);
  private readonly habitFormModal = inject(HabitFormModalService);

  readonly activeTab = input<AppNavTab>('today');
  readonly hideNewHabit = input(false);

  protected readonly demoMode = this.demoModeService;
  protected readonly showSettingsMenu = signal(false);
  protected readonly showPreviewActions = signal(false);

  private readonly settingsAnchor =
    viewChild<ElementRef<HTMLElement>>('settingsAnchor');
  private readonly mobileSettingsAnchor = viewChild<ElementRef<HTMLElement>>(
    'mobileSettingsAnchor',
  );

  protected toggleSettingsMenu(event: Event): void {
    event.stopPropagation();
    this.showSettingsMenu.update((open) => !open);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.showSettingsMenu()) {
      return;
    }

    const target = event.target as Node;
    const desktopHost = this.settingsAnchor()?.nativeElement;
    const mobileHost = this.mobileSettingsAnchor()?.nativeElement;

    if (desktopHost?.contains(target) || mobileHost?.contains(target)) {
      return;
    }

    this.closeSettingsMenu();
  }

  protected revealPreviewActions(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPreviewActions.set(true);
  }

  protected openHabitForm(): void {
    this.habitFormModal.open();
  }

  protected closeSettingsMenu(): void {
    this.showSettingsMenu.set(false);
  }
}
