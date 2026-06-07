import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import {
  CURRENT_STORAGE_VERSION,
  STORAGE_KEY,
  type AppStorage,
} from '../models/app-storage.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { CreateHabitDto } from '../models/create-habit.dto';
import type { Habit } from '../models/habit.model';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { normalizeHabit } from '../utils/habit-normalizer';
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

  createHabit(dto: CreateHabitDto): Habit {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      category: dto.category.trim(),
      trigger1: dto.trigger1.trim(),
      trigger2: dto.trigger2.trim(),
      motivation1: dto.motivation1.trim(),
      motivation2: dto.motivation2.trim(),
      minimumAction: dto.minimumAction.trim(),
      scheduleDays: [...ALL_WEEKDAYS],
      optionalReminder: dto.optionalReminder.trim(),
      archived: false,
      createdAt: new Date().toISOString(),
      showOnToday: dto.showOnToday ?? true,
    };

    this.habits.update((list) => [...list, habit]);
    this.persist();

    return habit;
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
    const habits = (data.habits ?? []).map((habit) => normalizeHabit(habit));

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
