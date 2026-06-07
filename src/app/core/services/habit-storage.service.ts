import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import {
  CURRENT_STORAGE_VERSION,
  STORAGE_KEY,
  type AppStorage,
} from '../models/app-storage.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { getWeekday, toDateKey } from '../utils/date.utils';
import { mapHabitToTodayCard } from '../utils/today-habit.mapper';

@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);

  readonly habitsReadonly = this.habits.asReadonly();
  readonly completionsReadonly = this.completions.asReadonly();

  readonly todayHabitCards = computed(() => this.buildTodayCards());

  constructor() {
    this.load();
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        this.habits.set([]);
        this.completions.set([]);
        return;
      }

      const migrated = this.migrate(JSON.parse(raw));
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
    } catch (error) {
      console.warn('[HabitStorage] load failed, starting empty', error);
      this.habits.set([]);
      this.completions.set([]);
    }
  }

  getTodayHabits(date: Date = new Date()): Habit[] {
    const weekday = getWeekday(date);

    return this.habits().filter(
      (habit) =>
        !habit.archived &&
        habit.showOnToday &&
        habit.scheduleDays.includes(weekday),
    );
  }

  isCompleted(habitId: string, date: string = toDateKey()): boolean {
    return this.completions().some(
      (completion) =>
        completion.habitId === habitId && completion.completedOn === date,
    );
  }

  toggleCompletion(habitId: string, date: string = toDateKey()): void {
    const exists = this.isCompleted(habitId, date);

    if (exists) {
      this.completions.update((list) =>
        list.filter(
          (completion) =>
            !(completion.habitId === habitId && completion.completedOn === date),
        ),
      );
    } else {
      this.completions.update((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          habitId,
          completedOn: date,
        },
      ]);
    }

    this.persist();
  }

  private buildTodayCards(date: Date = new Date()): TodayHabitCard[] {
    const completions = this.completions();

    return this.getTodayHabits(date).map((habit) =>
      mapHabitToTodayCard(habit, completions, date),
    );
  }

  private migrate(raw: unknown): AppStorage {
    if (!raw || typeof raw !== 'object') {
      return {
        version: CURRENT_STORAGE_VERSION,
        habits: [],
        completions: [],
      };
    }

    const data = raw as Partial<AppStorage>;
    const habits = (data.habits ?? []).map((habit) => ({
      ...habit,
      showOnToday: habit.showOnToday ?? true,
    }));

    if ((data.version ?? 0) < 1) {
      return {
        version: CURRENT_STORAGE_VERSION,
        habits,
        completions: data.completions ?? [],
      };
    }

    return {
      version: CURRENT_STORAGE_VERSION,
      habits,
      completions: data.completions ?? [],
    };
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const payload: AppStorage = {
        version: CURRENT_STORAGE_VERSION,
        habits: this.habits(),
        completions: this.completions(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[HabitStorage] persist failed', error);
    }
  }
}
