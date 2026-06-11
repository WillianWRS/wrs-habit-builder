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
import { normalizeHabit } from '../utils/habit-normalizer';
import { isLegacyTriggerMotivationHabit } from '../utils/habit-trigger-motivation.utils';
import { getWeekday } from '../utils/date.utils';
import {
  buildInitialScheduleDaySince,
  detectAutomaticFreezesNeeded,
  mergeScheduleDaySince,
} from '../utils/habit-streak.utils';
import { mapHabitToListCard, mapHabitToTodayCard } from '../utils/today-habit.mapper';
import { CurrentDayService } from './current-day.service';

@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentDay = inject(CurrentDayService);

  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);
  private readonly freezeUsed = signal<HabitFreezeUsed[]>([]);

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

      const migrated = this.migrate(JSON.parse(raw));
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      this.freezeUsed.set(migrated.freezeUsed);
      this.applyAutomaticFreezes(this.currentDay.today(), { persist: false });
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

    this.habits.update((list) => list.filter((item) => item.id !== id));
    this.completions.update((list) =>
      list.filter((completion) => completion.habitId !== id),
    );
    this.freezeUsed.update((list) =>
      list.filter((event) => event.habitId !== id),
    );
    this.persist();
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
      trigger3: dto.trigger3.trim(),
      trigger1Visible: dto.trigger1Visible,
      trigger2Visible: dto.trigger2Visible,
      trigger3Visible: dto.trigger3Visible,
      motivation1: dto.motivation1.trim(),
      motivation2: dto.motivation2.trim(),
      motivation3: dto.motivation3.trim(),
      motivation1Visible: dto.motivation1Visible,
      motivation2Visible: dto.motivation2Visible,
      motivation3Visible: dto.motivation3Visible,
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
    const createdDateKey = this.currentDay.todayKey();

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
      trigger3: dto.trigger3.trim(),
      trigger1Visible: dto.trigger1Visible,
      trigger2Visible: dto.trigger2Visible,
      trigger3Visible: dto.trigger3Visible,
      motivation1: dto.motivation1.trim(),
      motivation2: dto.motivation2.trim(),
      motivation3: dto.motivation3.trim(),
      motivation1Visible: dto.motivation1Visible,
      motivation2Visible: dto.motivation2Visible,
      motivation3Visible: dto.motivation3Visible,
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
      freezeUsed: this.freezeUsed(),
    };
  }

  needsTriggerMotivationSchemaUpgrade(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return false;
      }

      const data = JSON.parse(raw) as Partial<AppStorage>;

      return (data.habits ?? []).some((habit) =>
        isLegacyTriggerMotivationHabit(habit),
      );
    } catch {
      return false;
    }
  }

  upgradeTriggerMotivationSchema(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return false;
      }

      const data = JSON.parse(raw) as Partial<AppStorage>;
      const habits = (data.habits ?? []).map((habit) => normalizeHabit(habit));

      this.habits.set(habits);
      this.completions.set(data.completions ?? []);
      this.freezeUsed.set(data.freezeUsed ?? []);
      this.persist();

      return true;
    } catch (error) {
      console.error('[HabitStorage] trigger/motivation upgrade failed', error);
      return false;
    }
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
      freezeUsed: migrated.freezeUsed,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      this.freezeUsed.set(migrated.freezeUsed);
      return { ok: true };
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

  private migrate(raw: unknown): AppStorage {
    if (!raw || typeof raw !== 'object') {
      return {
        version: CURRENT_STORAGE_VERSION,
        habits: [],
        completions: [],
        freezeUsed: [],
      };
    }

    const data = raw as Partial<AppStorage>;
    const habits = (data.habits ?? []).map((habit) => normalizeHabit(habit));
    const version = data.version ?? 0;

    return {
      version: CURRENT_STORAGE_VERSION,
      habits,
      completions: data.completions ?? [],
      freezeUsed: version >= 7 ? (data.freezeUsed ?? []) : [],
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
        freezeUsed: this.freezeUsed(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[HabitStorage] persist failed', error);
    }
  }
}
