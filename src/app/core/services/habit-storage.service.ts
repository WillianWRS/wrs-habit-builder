import { isPlatformBrowser } from '@angular/common';
import {
  effect,
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  CURRENT_STORAGE_VERSION,
  STORAGE_KEY,
  type AppStorage,
} from '../models/app-storage.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { CreateHabitDto } from '../models/create-habit.dto';
import type { UpdateHabitDto } from '../models/update-habit.dto';
import type { Habit } from '../models/habit.model';
import type {
  HabitListCardView,
  TodayHabitCard,
} from '../models/today-habit-card.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { normalizeHabit } from '../utils/habit-normalizer';
import { getWeekday, toDateKey } from '../utils/date.utils';
import {
  buildInitialScheduleDaySince,
  getHabitIdsToReset,
  mergeScheduleDaySince,
} from '../utils/habit-streak.utils';
import { mapHabitToListCard, mapHabitToTodayCard } from '../utils/today-habit.mapper';

@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);

  readonly habitsReadonly = this.habits.asReadonly();
  readonly completionsReadonly = this.completions.asReadonly();

  readonly todayHabitCards = computed(() => this.buildTodayCards());
  readonly habitListCards = computed(() => this.buildAllHabitListCards());

  constructor() {
    this.load();

    effect(() => {
      this.habits();
      this.completions();

      untracked(() => this.reconcileStreakResets());
    });
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

  getHabitById(id: string): Habit | undefined {
    return this.habits().find((habit) => habit.id === id);
  }

  getActiveHabits(): Habit[] {
    return this.habits().filter((habit) => !habit.archived);
  }

  getArchivedHabits(): Habit[] {
    return this.habits().filter((habit) => habit.archived);
  }

  isHabitOnToday(habitId: string, date: Date = new Date()): boolean {
    return this.getTodayHabits(date).some((habit) => habit.id === habitId);
  }

  archiveHabit(id: string): void {
    const habit = this.getHabitById(id);

    if (!habit || habit.archived) {
      return;
    }

    this.habits.update((list) =>
      list.map((item) =>
        item.id === id ? { ...item, archived: true } : item,
      ),
    );
    this.persist();
  }

  restoreHabit(id: string): void {
    const habit = this.getHabitById(id);

    if (!habit || !habit.archived) {
      return;
    }

    this.habits.update((list) =>
      list.map((item) =>
        item.id === id ? { ...item, archived: false } : item,
      ),
    );
    this.persist();
  }

  permanentlyDeleteHabit(id: string): void {
    const habit = this.getHabitById(id);

    if (!habit || !habit.archived) {
      return;
    }

    this.habits.update((list) => list.filter((item) => item.id !== id));
    this.completions.update((list) =>
      list.filter((completion) => completion.habitId !== id),
    );
    this.persist();
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

  updateHabit(id: string, dto: UpdateHabitDto): Habit | undefined {
    const existing = this.getHabitById(id);

    if (!existing) {
      return undefined;
    }

    const nextScheduleDays =
      dto.scheduleDays.length > 0 ? [...dto.scheduleDays] : [...ALL_WEEKDAYS];
    const todayKey = toDateKey();

    const updated: Habit = {
      ...existing,
      name: dto.name.trim(),
      metaGeral: dto.metaGeral.trim(),
      metasDinamicas: dto.metasDinamicas,
      weekdayGoals: dto.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta.trim(),
        minimumAction: entry.minimumAction.trim(),
        optionalReminder: entry.optionalReminder.trim(),
      })),
      category: dto.category.trim(),
      trigger1: dto.trigger1.trim(),
      trigger2: dto.trigger2.trim(),
      motivation1: dto.motivation1.trim(),
      motivation2: dto.motivation2.trim(),
      minimumAction: dto.minimumAction.trim(),
      scheduleDays: nextScheduleDays,
      scheduleDaySince: mergeScheduleDaySince(
        existing.scheduleDaySince,
        existing.scheduleDays,
        nextScheduleDays,
        todayKey,
      ),
      optionalReminder: dto.optionalReminder.trim(),
      showOnToday: dto.showOnToday ?? existing.showOnToday,
    };

    this.habits.update((list) =>
      list.map((habit) => (habit.id === id ? updated : habit)),
    );
    this.persist();

    return updated;
  }

  createHabit(dto: CreateHabitDto): Habit {
    const scheduleDays =
      dto.scheduleDays.length > 0 ? [...dto.scheduleDays] : [...ALL_WEEKDAYS];
    const createdDateKey = toDateKey();

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      metaGeral: dto.metaGeral.trim(),
      metasDinamicas: dto.metasDinamicas,
      weekdayGoals: dto.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta.trim(),
        minimumAction: entry.minimumAction.trim(),
        optionalReminder: entry.optionalReminder.trim(),
      })),
      category: dto.category.trim(),
      trigger1: dto.trigger1.trim(),
      trigger2: dto.trigger2.trim(),
      motivation1: dto.motivation1.trim(),
      motivation2: dto.motivation2.trim(),
      minimumAction: dto.minimumAction.trim(),
      scheduleDays,
      scheduleDaySince: buildInitialScheduleDaySince(scheduleDays, createdDateKey),
      optionalReminder: dto.optionalReminder.trim(),
      archived: false,
      createdAt: new Date().toISOString(),
      showOnToday: dto.showOnToday ?? true,
    };

    this.habits.update((list) => [...list, habit]);
    this.persist();

    return habit;
  }

  exportStorage(): AppStorage {
    return {
      version: CURRENT_STORAGE_VERSION,
      habits: this.habits(),
      completions: this.completions(),
    };
  }

  importStorage(raw: unknown): { ok: true } | { ok: false; message: string } {
    if (!isPlatformBrowser(this.platformId)) {
      return { ok: false, message: 'Importação indisponível neste ambiente.' };
    }

    const migrated = this.migrate(raw);
    const payload: AppStorage = {
      version: CURRENT_STORAGE_VERSION,
      habits: migrated.habits,
      completions: migrated.completions,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      return { ok: true };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return { ok: false, message: 'Espaço insuficiente no navegador.' };
      }

      console.error('[HabitStorage] import failed', error);
      return { ok: false, message: 'Não foi possível importar os dados.' };
    }
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

  private reconcileStreakResets(referenceDate: Date = new Date()): void {
    const habits = this.habits();
    const completions = this.completions();
    const habitIdsToReset = new Set(
      getHabitIdsToReset(habits, completions, referenceDate),
    );

    if (habitIdsToReset.size === 0) {
      return;
    }

    this.completions.update((list) =>
      list.filter((completion) => !habitIdsToReset.has(completion.habitId)),
    );
    this.persist();
  }

  private buildTodayCards(date: Date = new Date()): TodayHabitCard[] {
    const completions = this.completions();

    return this.getTodayHabits(date).map((habit) =>
      mapHabitToTodayCard(habit, completions, date),
    );
  }

  private buildAllHabitListCards(date: Date = new Date()): HabitListCardView[] {
    const completions = this.completions();

    return this.habits().map((habit) =>
      mapHabitToListCard(habit, completions, date),
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
