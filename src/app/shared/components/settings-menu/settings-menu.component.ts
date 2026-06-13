import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { DemoModeService } from '../../../core/services/demo-mode.service';

export type SettingsMenuPlacement = 'dropdown' | 'dropup';

@Component({
  selector: 'app-settings-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './settings-menu.component.html',
  styleUrl: './settings-menu.component.scss',
})
export class SettingsMenuComponent {
  private readonly demoModeService = inject(DemoModeService);
  private readonly router = inject(Router);

  readonly placement = input<SettingsMenuPlacement>('dropdown');
  readonly showPreviewActions = input(false);

  readonly closed = output<void>();
  readonly openSettings = output<void>();
  readonly openProgress = output<void>();
  readonly openSubscription = output<void>();

  protected readonly demoMode = this.demoModeService;

  protected exitDemoMode(): void {
    this.demoModeService.deactivate();
    this.closed.emit();
  }

  protected activatePredefinedDemo(): void {
    this.demoModeService.activatePredefined();
    this.closed.emit();
    this.navigateToTodayIfSecondaryRoute();
  }

  protected activateRandomDemo(): void {
    this.demoModeService.activateRandom();
    this.closed.emit();
    this.navigateToTodayIfSecondaryRoute();
  }

  protected onOpenSettings(): void {
    this.openSettings.emit();
  }

  protected onOpenProgress(): void {
    this.openProgress.emit();
  }

  protected onOpenSubscription(): void {
    this.openSubscription.emit();
  }

  private navigateToTodayIfSecondaryRoute(): void {
    const path = this.router.url.split('?')[0].split('#')[0];

    if (
      path === '/habits' ||
      path.startsWith('/habits/') ||
      path === '/settings' ||
      path === '/progress'
    ) {
      void this.router.navigate(['/today']);
    }
  }
}
