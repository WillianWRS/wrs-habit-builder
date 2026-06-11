import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { AccentThemeService } from '../../../core/services/accent-theme.service';
import { DemoModeService } from '../../../core/services/demo-mode.service';
import { ThemeService } from '../../../core/services/theme.service';

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
  protected readonly themeService = inject(ThemeService);
  protected readonly accentThemeService = inject(AccentThemeService);

  readonly placement = input<SettingsMenuPlacement>('dropdown');
  readonly showPreviewActions = input(false);

  readonly closed = output<void>();

  protected readonly demoMode = this.demoModeService;

  protected toggleTheme(): void {
    this.themeService.toggle();
    this.closed.emit();
  }

  protected toggleAccentTheme(): void {
    this.accentThemeService.toggle();
    this.closed.emit();
  }

  protected exitDemoMode(): void {
    this.demoModeService.deactivate();
    this.closed.emit();
  }

  protected activatePredefinedDemo(): void {
    this.demoModeService.activatePredefined();
    this.closed.emit();
    this.navigateToTodayIfPreviewRoute();
  }

  protected activateRandomDemo(): void {
    this.demoModeService.activateRandom();
    this.closed.emit();
    this.navigateToTodayIfPreviewRoute();
  }

  protected openHistorico(): void {
    this.closed.emit();
    void this.router.navigate(['/historico']);
  }

  protected openDataManagement(): void {
    this.closed.emit();
    void this.router.navigate(['/data']);
  }

  private navigateToTodayIfPreviewRoute(): void {
    const path = this.router.url.split('?')[0].split('#')[0];

    if (path === '/habits' || path === '/data' || path === '/historico') {
      void this.router.navigate(['/']);
    }
  }
}
