import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HabitFormModalService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
