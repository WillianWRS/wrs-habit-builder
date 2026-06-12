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
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { CreateHabitDto } from '../models/create-habit.dto';
import type { UpdateHabitDto } from '../models/update-habit.dto';
import type { Habit } from '../models/habit.model';
import type {
  HabitListCardView,
  TodayHabitCard,
} from '../models/today-habit-card.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { padSlots } from '../models/habit-slot.model';
import { getWeekday } from '../utils/date.utils';
import {
  buildInitialScheduleDaySince,
  detectAutomaticFreezesNeeded,
  mergeScheduleDaySince,
} from '../utils/habit-streak.utils';
import { migrateStorage } from '../migrations/migrate-storage';
import { mapHabitToListCard, mapHabitToTodayCard } from '../utils/today-habit.mapper';
import { CurrentDayService } from './current-day.service';

interface PendingDeleteSnapshot {
  habit: Habit;
  completions: HabitCompletion[];
  freezeUsed: HabitFreezeUsed[];
}

export type ImportStorageResult =
  | { ok: true; habitCount: number; completionCount: number }
  | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentDay = inject(CurrentDayService);

  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);
  private readonly freezeUsed = signal<HabitFreezeUsed[]>([]);
  private readonly pendingDeletes = new Map<string, PendingDeleteSnapshot>();

  readonly habitsReadonly = this.habits.asReadonly();
  readonly completionsReadonly = this.completions.asReadonly();
  readonly freezeUsedReadonly = this.freezeUsed.asReadonly();

  readonly todayHabitCards = computed(() => {
    const date = this.currentDay.today();
    return this.buildTodayCards(date);
  });
  readonly habitListCards = computed(() => {
    const date = this.currentDay.today();
    return this.buildAllHabitListCards(date);
  });

  constructor() {
    this.load();

    effect(() => {
      this.habits();
      this.completions();
      this.freezeUsed();
      const referenceDate = this.currentDay.today();

      untracked(() => this.applyAutomaticFreezes(referenceDate));
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
        this.freezeUsed.set([]);
        return;
      }

      const parsed = JSON.parse(raw);
      const { data: migrated, sourceVersion } = migrateStorage(parsed);

      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      this.freezeUsed.set(migrated.freezeUsed);
      this.applyAutomaticFreezes(this.currentDay.today(), { persist: false });

      if (sourceVersion < CURRENT_STORAGE_VERSION) {
        this.persist();
      }
    } catch (error) {
      console.warn('[HabitStorage] load failed, starting empty', error);
      this.habits.set([]);
      this.completions.set([]);
      this.freezeUsed.set([]);
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

  isHabitOnToday(habitId: string, date?: Date): boolean {
    const referenceDate = date ?? this.currentDay.today();
    return this.getTodayHabits(referenceDate).some((habit) => habit.id === habitId);
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

    this.removeHabitData(id);
    this.persist();
  }

  stagePermanentDelete(id: string): boolean {
    const habit = this.getHabitById(id);

    if (!habit || !habit.archived) {
      return false;
    }

    this.pendingDeletes.set(id, {
      habit: structuredClone(habit),
      completions: structuredClone(
        this.completions().filter((completion) => completion.habitId === id),
      ),
      freezeUsed: structuredClone(
        this.freezeUsed().filter((event) => event.habitId === id),
      ),
    });

    this.removeHabitData(id);
    this.persist();

    return true;
  }

  restorePendingDelete(id: string): boolean {
    const snapshot = this.pendingDeletes.get(id);

    if (!snapshot) {
      return false;
    }

    this.habits.update((list) => [...list, snapshot.habit]);
    this.completions.update((list) => [...list, ...snapshot.completions]);
    this.freezeUsed.update((list) => [...list, ...snapshot.freezeUsed]);
    this.pendingDeletes.delete(id);
    this.persist();

    return true;
  }

  commitPendingDelete(id: string): void {
    this.pendingDeletes.delete(id);
  }

  hasPendingDelete(id: string): boolean {
    return this.pendingDeletes.has(id);
  }

  getTodayHabits(date?: Date): Habit[] {
    const referenceDate = date ?? this.currentDay.today();
    const weekday = getWeekday(referenceDate);

    return this.habits().filter(
      (habit) =>
        !habit.archived &&
        habit.showOnToday &&
        habit.scheduleDays.includes(weekday),
    );
  }

  isCompleted(habitId: string, date?: string): boolean {
    const targetDate = date ?? this.currentDay.todayKey();
    return this.completions().some(
      (completion) =>
        completion.habitId === habitId && completion.completedOn === targetDate,
    );
  }

  updateHabit(id: string, dto: UpdateHabitDto): Habit | undefined {
    const existing = this.getHabitById(id);

    if (!existing) {
      return undefined;
    }

    const nextScheduleDays =
      dto.scheduleDays.length > 0 ? [...dto.scheduleDays] : [...ALL_WEEKDAYS];
    const todayKey = this.currentDay.todayKey();

    const updated: Habit = {
      ...existing,
      name: dto.name.trim(),
      generalGoal: dto.generalGoal.trim(),
      dynamicGoals: dto.dynamicGoals,
      weekdayGoals: dto.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta.trim(),
        minimumAction: entry.minimumAction.trim(),
        time: entry.time.trim(),
      })),
      category: dto.category.trim(),
      triggers: padSlots(
        dto.triggers.map((slot) => ({
          text: slot.text.trim(),
          visible: slot.visible,
        })),
      ),
      motivations: padSlots(
        dto.motivations.map((slot) => ({
          text: slot.text.trim(),
          visible: slot.visible,
        })),
      ),
      minimumAction: dto.minimumAction.trim(),
      scheduleDays: nextScheduleDays,
      scheduleDaySince: mergeScheduleDaySince(
        existing.scheduleDaySince,
        existing.scheduleDays,
        nextScheduleDays,
        todayKey,
      ),
      time: dto.time.trim(),
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
    const createdDateKey = this.currentDay.todayKey();

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      generalGoal: dto.generalGoal.trim(),
      dynamicGoals: dto.dynamicGoals,
      weekdayGoals: dto.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta.trim(),
        minimumAction: entry.minimumAction.trim(),
        time: entry.time.trim(),
      })),
      category: dto.category.trim(),
      triggers: padSlots(
        dto.triggers.map((slot) => ({
          text: slot.text.trim(),
          visible: slot.visible,
        })),
      ),
      motivations: padSlots(
        dto.motivations.map((slot) => ({
          text: slot.text.trim(),
          visible: slot.visible,
        })),
      ),
      minimumAction: dto.minimumAction.trim(),
      scheduleDays,
      scheduleDaySince: buildInitialScheduleDaySince(scheduleDays, createdDateKey),
      time: dto.time.trim(),
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
      freezeUsed: this.freezeUsed(),
    };
  }

  importStorage(raw: unknown): ImportStorageResult {
    if (!isPlatformBrowser(this.platformId)) {
      return { ok: false, message: 'Importação indisponível neste ambiente.' };
    }

    const { data: migrated } = migrateStorage(raw);
    const payload: AppStorage = {
      version: CURRENT_STORAGE_VERSION,
      habits: migrated.habits,
      completions: migrated.completions,
      freezeUsed: migrated.freezeUsed,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      this.freezeUsed.set(migrated.freezeUsed);
      return {
        ok: true,
        habitCount: migrated.habits.length,
        completionCount: migrated.completions.length,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return { ok: false, message: 'Espaço insuficiente no navegador.' };
      }

      console.error('[HabitStorage] import failed', error);
      return { ok: false, message: 'Não foi possível importar os dados.' };
    }
  }

  toggleCompletion(habitId: string, date?: string): void {
    const targetDate = date ?? this.currentDay.todayKey();
    const exists = this.isCompleted(habitId, targetDate);

    if (exists) {
      this.completions.update((list) =>
        list.filter(
          (completion) =>
            !(completion.habitId === habitId && completion.completedOn === targetDate),
        ),
      );
    } else {
      this.completions.update((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          habitId,
          completedOn: targetDate,
        },
      ]);
    }

    this.persist();
  }

  private applyAutomaticFreezes(
    referenceDate: Date,
    options: { persist?: boolean } = { persist: true },
  ): void {
    const habits = this.habits();
    const completions = this.completions();
    const existingFreezes = this.freezeUsed();
    const newEvents: HabitFreezeUsed[] = [];

    let allFreezes = existingFreezes;

    for (const habit of habits) {
      if (habit.archived) {
        continue;
      }

      const habitEvents = detectAutomaticFreezesNeeded(
        habit,
        completions,
        allFreezes,
        referenceDate,
      );

      newEvents.push(...habitEvents);
      allFreezes = [...allFreezes, ...habitEvents];
    }

    if (newEvents.length === 0) {
      return;
    }

    this.freezeUsed.update((list) => [...list, ...newEvents]);

    if (options.persist !== false) {
      this.persist();
    }
  }

  private buildTodayCards(date: Date): TodayHabitCard[] {
    const completions = this.completions();
    const freezeUsed = this.freezeUsed();

    return this.getTodayHabits(date).map((habit) =>
      mapHabitToTodayCard(habit, completions, freezeUsed, date),
    );
  }

  private buildAllHabitListCards(date: Date): HabitListCardView[] {
    const completions = this.completions();
    const freezeUsed = this.freezeUsed();

    return this.habits().map((habit) =>
      mapHabitToListCard(habit, completions, freezeUsed, date),
    );
  }

  private removeHabitData(id: string): void {
    this.habits.update((list) => list.filter((item) => item.id !== id));
    this.completions.update((list) =>
      list.filter((completion) => completion.habitId !== id),
    );
    this.freezeUsed.update((list) =>
      list.filter((event) => event.habitId !== id),
    );
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
        freezeUsed: this.freezeUsed(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[HabitStorage] persist failed', error);
    }
  }
}
