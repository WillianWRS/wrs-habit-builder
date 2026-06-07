import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HabitFormModalService {
  readonly isOpen = signal(false);
  readonly editingHabitId = signal<string | null>(null);

  open(): void {
    this.editingHabitId.set(null);
    this.isOpen.set(true);
  }

  openForEdit(habitId: string): void {
    this.editingHabitId.set(habitId);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.editingHabitId.set(null);
  }
}
