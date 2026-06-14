import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

export type SettingsMenuPlacement = 'dropdown' | 'dropup';

@Component({
  selector: 'app-settings-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './settings-menu.component.html',
  styleUrl: './settings-menu.component.scss',
})
export class SettingsMenuComponent {
  readonly placement = input<SettingsMenuPlacement>('dropdown');

  readonly closed = output<void>();
  readonly openSettings = output<void>();
  readonly openProgress = output<void>();
  readonly openSubscription = output<void>();

  protected onOpenSettings(): void {
    this.openSettings.emit();
  }

  protected onOpenProgress(): void {
    this.openProgress.emit();
  }

  protected onOpenSubscription(): void {
    this.openSubscription.emit();
  }
}
