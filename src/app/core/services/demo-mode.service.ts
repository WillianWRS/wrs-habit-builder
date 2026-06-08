import { Injectable, computed, signal } from '@angular/core';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { DemoHabitsData } from '../utils/demo-habits.data';

export type DemoDataVariant = 'predefined' | 'random';

@Injectable({ providedIn: 'root' })
export class DemoModeService {
  readonly variant = signal<DemoDataVariant | null>(null);
  readonly isActive = computed(() => this.variant() !== null);
  readonly cards = signal<TodayHabitCard[]>([]);

  activatePredefined(): void {
    this.variant.set('predefined');
    this.cards.set(DemoHabitsData.getPredefinedCards().map((card) => ({ ...card })));
  }

  activateRandom(): void {
    this.variant.set('random');
    this.cards.set(DemoHabitsData.getRandomCards(5).map((card) => ({ ...card })));
  }

  deactivate(): void {
    this.variant.set(null);
    this.cards.set([]);
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
