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
import { CURRENT_STORAGE_VERSION, type AppStorage } from '../models/app-storage.model';
import { DEFAULT_HABIT_CATEGORIES } from '../constants/habit-categories.constants';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitDailyNote } from '../models/habit-daily-note.model';
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
import { STORAGE_BACKEND, StorageBackendError } from '../storage/storage-backend.model';
import { CurrentDayService } from './current-day.service';
import { ToastService } from './toast.service';
import {
  findCategoryMatch,
  normalizeCategoryName,
} from '../utils/habit-categories.utils';

interface PendingDeleteSnapshot {
  habit: Habit;
  completions: HabitCompletion[];
  freezeUsed: HabitFreezeUsed[];
  habitNotes: HabitDailyNote[];
}

export type ImportStorageResult =
  | { ok: true; habitCount: number; completionCount: number }
  | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentDay = inject(CurrentDayService);
  private readonly backend = inject(STORAGE_BACKEND);
  private readonly toast = inject(ToastService);

  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);
  private readonly freezeUsed = signal<HabitFreezeUsed[]>([]);
  private readonly habitNotes = signal<HabitDailyNote[]>([]);
  private readonly categories = signal<string[]>([...DEFAULT_HABIT_CATEGORIES]);
  private readonly pendingDeletes = new Map<string, PendingDeleteSnapshot>();

  /** true após initialize() concluir — evita flash de estado vazio no boot. */
  readonly ready = signal(false);

  readonly habitsReadonly = this.habits.asReadonly();
  readonly completionsReadonly = this.completions.asReadonly();
  readonly freezeUsedReadonly = this.freezeUsed.asReadonly();
  readonly habitNotesReadonly = this.habitNotes.asReadonly();
  readonly categoriesReadonly = this.categories.asReadonly();

  readonly todayHabitCards = computed(() => {
    const date = this.currentDay.today();
    this.habitNotes();
    return this.buildTodayCards(date);
  });
  readonly habitListCards = computed(() => {
    const date = this.currentDay.today();
    return this.buildAllHabitListCards(date);
  });

  constructor() {
    effect(() => {
      if (!this.ready()) {
        return;
      }

      this.habits();
      this.completions();
      this.freezeUsed();
      this.habitNotes();
      this.categories();
      const referenceDate = this.currentDay.today();

      untracked(() => this.applyAutomaticFreezes(referenceDate));
    });
  }

  /** Chamado via APP_INITIALIZER antes do bootstrap da UI. */
  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.setEmptyState();
      this.ready.set(true);
      return;
    }

    try {
      await this.loadFromBackend();
    } catch (error) {
      console.warn('[HabitStorage] initialize failed, starting empty', error);
      this.setEmptyState();
      this.notifyStorageError(
        error instanceof StorageBackendError
          ? error.message
          : 'Não foi possível carregar seus dados.',
      );
    }

    this.ready.set(true);
  }

  getHabitById(id: string): Habit | undefined {
    return this.habits().find((habit) => habit.id === id);
  }

  getCategories(): readonly string[] {
    return this.categories();
  }

  ensureCategory(name: string): string {
    const normalized = normalizeCategoryName(name);

    if (!normalized) {
      return '';
    }

    const existing = findCategoryMatch(this.categories(), normalized);

    if (existing) {
      return existing;
    }

    this.categories.update((list) => [...list, normalized]);
    this.persist();

    return normalized;
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
      habitNotes: structuredClone(
        this.habitNotes().filter((entry) => entry.habitId === id),
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
    this.habitNotes.update((list) => [...list, ...snapshot.habitNotes]);
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

  getDailyNote(habitId: string, dateKey: string): string {
    return (
      this.habitNotes().find(
        (entry) => entry.habitId === habitId && entry.dateKey === dateKey,
      )?.note ?? ''
    );
  }

  upsertDailyNote(habitId: string, dateKey: string, note: string): void {
    const normalized = note.trim().slice(0, 140);
    const existing = this.habitNotes().find(
      (entry) => entry.habitId === habitId && entry.dateKey === dateKey,
    );

    if (!normalized) {
      if (!existing) {
        return;
      }

      this.habitNotes.update((list) =>
        list.filter((entry) => entry.id !== existing.id),
      );
      this.persist();
      return;
    }

    if (existing) {
      this.habitNotes.update((list) =>
        list.map((entry) =>
          entry.id === existing.id
            ? { ...entry, note: normalized, updatedAt: new Date().toISOString() }
            : entry,
        ),
      );
    } else {
      this.habitNotes.update((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          habitId,
          dateKey,
          note: normalized,
          updatedAt: new Date().toISOString(),
        },
      ]);
    }

    this.persist();
  }

  updateHabit(id: string, dto: UpdateHabitDto): Habit | undefined {
    const existing = this.getHabitById(id);

    if (!existing) {
      return undefined;
    }

    const nextScheduleDays =
      dto.scheduleDays.length > 0 ? [...dto.scheduleDays] : [...ALL_WEEKDAYS];
    const todayKey = this.currentDay.todayKey();

    const category = this.ensureCategory(dto.category.trim());

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
      category,
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

    const category = this.ensureCategory(dto.category.trim());

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
      category,
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
      habitNotes: this.habitNotes(),
      categories: this.categories(),
    };
  }

  async importStorage(raw: unknown): Promise<ImportStorageResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return { ok: false, message: 'Importação indisponível neste ambiente.' };
    }

    const { data: migrated } = migrateStorage(raw);
    const payload: AppStorage = {
      version: CURRENT_STORAGE_VERSION,
      habits: migrated.habits,
      completions: migrated.completions,
      freezeUsed: migrated.freezeUsed,
      habitNotes: migrated.habitNotes,
      categories: migrated.categories,
    };

    try {
      await this.backend.write(payload);
      this.habits.set(migrated.habits);
      this.completions.set(migrated.completions);
      this.freezeUsed.set(migrated.freezeUsed);
      this.habitNotes.set(migrated.habitNotes);
      this.categories.set(migrated.categories);
      return {
        ok: true,
        habitCount: migrated.habits.length,
        completionCount: migrated.completions.length,
      };
    } catch (error) {
      if (error instanceof StorageBackendError) {
        return { ok: false, message: error.message };
      }

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

  private async loadFromBackend(): Promise<void> {
    const raw = await this.backend.read();

    if (!raw) {
      this.setEmptyState();
      return;
    }

    const { data: migrated, sourceVersion } = migrateStorage(raw);

    this.habits.set(migrated.habits);
    this.completions.set(migrated.completions);
    this.freezeUsed.set(migrated.freezeUsed);
    this.habitNotes.set(migrated.habitNotes);
    this.categories.set(migrated.categories);
    this.applyAutomaticFreezes(this.currentDay.today(), { persist: false });

    if (sourceVersion < CURRENT_STORAGE_VERSION) {
      await this.persistAsync();
    }
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
    const notes = this.habitNotes();

    return this.getTodayHabits(date).map((habit) =>
      mapHabitToTodayCard(habit, completions, freezeUsed, notes, date),
    );
  }

  private buildAllHabitListCards(date: Date): HabitListCardView[] {
    const completions = this.completions();
    const freezeUsed = this.freezeUsed();
    const notes = this.habitNotes();

    return this.habits().map((habit) =>
      mapHabitToListCard(habit, completions, freezeUsed, notes, date),
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
    this.habitNotes.update((list) => list.filter((entry) => entry.habitId !== id));
  }

  private setEmptyState(): void {
    this.habits.set([]);
    this.completions.set([]);
    this.freezeUsed.set([]);
    this.habitNotes.set([]);
    this.categories.set([...DEFAULT_HABIT_CATEGORIES]);
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.persistAsync().catch((error) => {
      console.error('[HabitStorage] persist failed', error);
      this.notifyStorageError('Não foi possível salvar suas alterações.');
    });
  }

  private async persistAsync(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const payload: AppStorage = {
      version: CURRENT_STORAGE_VERSION,
      habits: this.habits(),
      completions: this.completions(),
      freezeUsed: this.freezeUsed(),
      habitNotes: this.habitNotes(),
      categories: this.categories(),
    };

    await this.backend.write(payload);
  }

  private notifyStorageError(message: string): void {
    this.toast.show({
      message,
      type: 'success',
      icon: 'archive',
      durationMs: 5000,
    });
  }
}
