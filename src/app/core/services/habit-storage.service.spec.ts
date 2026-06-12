import { PLATFORM_ID, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CURRENT_STORAGE_VERSION,
  LEGACY_LOCAL_STORAGE_KEY,
  type AppStorage,
} from '../models/app-storage.model';
import type { CreateHabitDto } from '../models/create-habit.dto';
import type { HabitCompletion } from '../models/habit-completion.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { padSlots } from '../models/habit-slot.model';
import { parseDateKey } from '../utils/date.utils';
import storageV5 from '../migrations/fixtures/storage-v5.json';
import storageV8 from '../migrations/fixtures/storage-v8.json';
import { MemoryStorageBackend } from '../storage/memory-storage.backend';
import { STORAGE_BACKEND } from '../storage/storage-backend.model';
import { CurrentDayService } from './current-day.service';
import { HabitStorageService } from './habit-storage.service';

const FIXED_DATE = parseDateKey('2026-06-11');
const FIXED_DATE_KEY = '2026-06-11';

function createLocalStorageMock(): Storage & { clearStore: () => void } {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    clearStore() {
      store = {};
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
  };
}

function createMinimalHabitDto(): CreateHabitDto {
  return {
    name: 'Hábito de teste',
    generalGoal: 'Meta geral',
    dynamicGoals: false,
    weekdayGoals: [],
    category: 'saude',
    triggers: padSlots([{ text: 'Se acordar', visible: true }]),
    motivations: padSlots([{ text: 'Porque quero', visible: true }]),
    minimumAction: '1 passo',
    scheduleDays: [...ALL_WEEKDAYS],
    time: '',
    showOnToday: true,
  };
}

function completionsForHabitOnDate(
  completions: HabitCompletion[],
  habitId: string,
  completedOn: string,
): HabitCompletion[] {
  return completions.filter(
    (entry) => entry.habitId === habitId && entry.completedOn === completedOn,
  );
}

describe('HabitStorageService', () => {
  let memoryBackend: MemoryStorageBackend;
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  function configureTestBed(): void {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: STORAGE_BACKEND, useValue: memoryBackend },
        {
          provide: CurrentDayService,
          useValue: {
            today: signal(FIXED_DATE).asReadonly(),
            todayKey: computed(() => FIXED_DATE_KEY),
          },
        },
      ],
    });
  }

  async function createInitializedService(): Promise<HabitStorageService> {
    const service = TestBed.inject(HabitStorageService);
    await service.initialize();
    return service;
  }

  beforeEach(() => {
    memoryBackend = new MemoryStorageBackend();
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
    configureTestBed();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  describe('createHabit — horário opcional', () => {
    it('permite criar hábito sem time preenchido', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      expect(habit.time).toBe('');
    });

    it('persiste time quando informado', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit({
        ...createMinimalHabitDto(),
        time: '07:30',
      });

      expect(habit.time).toBe('07:30');

      TestBed.resetTestingModule();
      configureTestBed();
      const reloaded = await createInitializedService();

      expect(reloaded.getHabitById(habit.id)?.time).toBe('07:30');
    });
  });

  describe('RN-01 — toggleCompletion idempotente', () => {
    it('cria no máximo uma completion por habitId + completedOn', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id);
      service.toggleCompletion(habit.id);
      service.toggleCompletion(habit.id);

      expect(
        completionsForHabitOnDate(
          service.completionsReadonly(),
          habit.id,
          FIXED_DATE_KEY,
        ),
      ).toHaveLength(1);
    });

    it('segundo toggle no mesmo dia remove a completion em vez de duplicar', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id);
      expect(service.isCompleted(habit.id)).toBe(true);

      service.toggleCompletion(habit.id);
      expect(service.isCompleted(habit.id)).toBe(false);
    });

    it('persiste o estado após initialize()', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id);

      TestBed.resetTestingModule();
      configureTestBed();
      const reloaded = await createInitializedService();

      expect(reloaded.isCompleted(habit.id)).toBe(true);
    });
  });

  describe('RN-05 — archiveHabit preserva completions', () => {
    it('marca archived=true sem remover nem alterar completions', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id, '2026-06-01');
      service.toggleCompletion(habit.id, '2026-06-02');

      const completionsBefore = structuredClone(service.completionsReadonly());

      service.archiveHabit(habit.id);

      expect(service.getHabitById(habit.id)?.archived).toBe(true);
      expect(service.completionsReadonly()).toEqual(completionsBefore);
    });
  });

  describe('exportStorage / importStorage roundtrip', () => {
    it('restaura habits e completions de forma fiel via backend', async () => {
      const service = await createInitializedService();
      const habitA = service.createHabit(createMinimalHabitDto());
      const habitB = service.createHabit({
        ...createMinimalHabitDto(),
        name: 'Segundo hábito',
      });

      service.toggleCompletion(habitA.id, '2026-06-01');
      service.toggleCompletion(habitB.id, FIXED_DATE_KEY);

      const exported = service.exportStorage();

      memoryBackend.clear();
      TestBed.resetTestingModule();
      configureTestBed();

      const fresh = await createInitializedService();
      expect(fresh.habitsReadonly()).toEqual([]);
      expect(fresh.completionsReadonly()).toEqual([]);

      const result = await fresh.importStorage(exported);

      expect(result).toEqual({
        ok: true,
        habitCount: exported.habits.length,
        completionCount: exported.completions.length,
      });
      expect(fresh.completionsReadonly()).toEqual(exported.completions);
      expect(fresh.habitsReadonly()).toHaveLength(exported.habits.length);

      const stored = memoryBackend.peek()!;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
      expect(stored.completions).toEqual(exported.completions);
    });
  });

  describe('initialize()', () => {
    it('inicia arrays vazios quando o backend não tem documento', async () => {
      const service = await createInitializedService();

      expect(service.habitsReadonly()).toEqual([]);
      expect(service.completionsReadonly()).toEqual([]);
      expect(service.freezeUsedReadonly()).toEqual([]);
      expect(service.ready()).toBe(true);
    });

    it('ignora dados legados no localStorage e inicia vazio no IndexedDB', async () => {
      localStorageMock.setItem(
        LEGACY_LOCAL_STORAGE_KEY,
        JSON.stringify(storageV5),
      );

      const service = await createInitializedService();

      expect(service.habitsReadonly()).toEqual([]);
      expect(localStorageMock.getItem(LEGACY_LOCAL_STORAGE_KEY)).not.toBeNull();
      expect(memoryBackend.peek()).toBeNull();
    });

    it('migra automaticamente JSON v8 preservando horários', async () => {
      await memoryBackend.write(storageV8 as unknown as AppStorage);

      const service = await createInitializedService();

      expect(service.habitsReadonly()[0]?.time).toBe('08:00');
      expect(service.habitsReadonly()[0]?.weekdayGoals[1]?.time).toBe('07:30');

      const stored = memoryBackend.peek()!;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
      expect('optionalReminder' in (stored.habits[0] ?? {})).toBe(false);
    });

    it('migra automaticamente JSON v5 e persiste na versão atual', async () => {
      await memoryBackend.write(storageV5 as unknown as AppStorage);

      const service = await createInitializedService();

      expect(service.completionsReadonly()).toEqual(storageV5.completions);
      expect(service.habitsReadonly()).toHaveLength(storageV5.habits.length);
      expect(service.habitsReadonly()[0]?.triggers[0]?.text).toBe('Após o café');

      const stored = memoryBackend.peek()!;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
    });
  });

  describe('stagePermanentDelete / restorePendingDelete', () => {
    it('remove da UI imediatamente e restaura snapshot ao desfazer', async () => {
      const service = await createInitializedService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.archiveHabit(habit.id);
      service.toggleCompletion(habit.id, '2026-06-01');

      service.stagePermanentDelete(habit.id);

      expect(service.getHabitById(habit.id)).toBeUndefined();
      expect(service.hasPendingDelete(habit.id)).toBe(true);

      service.restorePendingDelete(habit.id);

      expect(service.getHabitById(habit.id)?.archived).toBe(true);
      expect(service.hasPendingDelete(habit.id)).toBe(false);
    });
  });

  describe('importStorage — JSON legado', () => {
    it('importa payload v5 na versão atual', async () => {
      const service = await createInitializedService();

      const result = await service.importStorage(storageV5);

      expect(result).toEqual({
        ok: true,
        habitCount: storageV5.habits.length,
        completionCount: storageV5.completions.length,
      });

      const stored = memoryBackend.peek()!;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
    });
  });
});
