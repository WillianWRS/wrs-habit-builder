import { Injectable, signal } from '@angular/core';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { DemoHabitsData } from '../utils/demo-habits.data';

@Injectable({ providedIn: 'root' })
export class DemoModeService {
  readonly isActive = signal(false);
  readonly cards = signal<TodayHabitCard[]>(
    DemoHabitsData.getCards().map((card) => ({ ...card })),
  );

  toggle(): void {
    const next = !this.isActive();
    this.isActive.set(next);

    if (next) {
      this.resetCards();
    }
  }

  resetCards(): void {
    this.cards.set(DemoHabitsData.getCards().map((card) => ({ ...card })));
  }

  toggleHabit(id: string): void {
    this.cards.update((list) =>
      list.map((habit) => {
        if (habit.id !== id) {
          return habit;
        }

        const completed = !habit.completed;

        return {
          ...habit,
          completed,
          dayCount: completed ? habit.dayCount + 1 : Math.max(0, habit.dayCount - 1),
        };
      }),
    );
  }
}
