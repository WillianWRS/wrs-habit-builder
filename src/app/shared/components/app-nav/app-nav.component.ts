import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, merge, of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';

export type AppNavTab = 'today' | 'habits';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, SettingsMenuComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.scss',
})
export class AppNavComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly activeTab = input<AppNavTab>('today');

  protected readonly showMenu = signal(false);

  private readonly currentPath = toSignal(
    merge(
      of(this.router.url),
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.router.url),
      ),
    ).pipe(map((url) => url.split('?')[0].split('#')[0])),
    { initialValue: this.router.url.split('?')[0].split('#')[0] },
  );

  private readonly menuAnchor = viewChild<ElementRef<HTMLElement>>('menuAnchor');
  private readonly mobileMenuAnchor = viewChild<ElementRef<HTMLElement>>(
    'mobileMenuAnchor',
  );

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.update((open) => !open);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.showMenu()) {
      return;
    }

    const target = event.target as Node;
    const desktopHost = this.menuAnchor()?.nativeElement;
    const mobileHost = this.mobileMenuAnchor()?.nativeElement;

    if (desktopHost?.contains(target) || mobileHost?.contains(target)) {
      return;
    }

    this.closeMenu();
  }

  protected closeMenu(): void {
    this.showMenu.set(false);
  }

  protected navigateFromMenu(path: string): void {
    this.closeMenu();
    void this.router.navigate([path]);
  }

  protected showSubscriptionPlaceholder(): void {
    this.closeMenu();
    this.toast.showSuccess('Em breve');
  }

  protected isActiveTab(tab: AppNavTab): boolean {
    return this.activeTab() === tab;
  }

  protected isTodayRouteActive(): boolean {
    return this.currentPath() === '/today';
  }

  protected isHabitsRouteActive(): boolean {
    const path = this.currentPath();
    return path === '/habits' || path.startsWith('/habits/');
  }
}
