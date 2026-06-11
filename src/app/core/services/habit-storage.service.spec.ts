import { PLATFORM_ID, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CURRENT_STORAGE_VERSION,
  STORAGE_KEY,
  type AppStorage,
} from '../models/app-storage.model';
import type { CreateHabitDto } from '../models/create-habit.dto';
import type { HabitCompletion } from '../models/habit-completion.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { padSlots } from '../models/habit-slot.model';
import { parseDateKey } from '../utils/date.utils';
import storageV5 from '../migrations/fixtures/storage-v5.json';
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
    optionalReminder: '',
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
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  function configureTestBed(): void {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
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

  function createService(): HabitStorageService {
    return TestBed.inject(HabitStorageService);
  }

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
    configureTestBed();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  describe('RN-01 — toggleCompletion idempotente', () => {
    it('cria no máximo uma completion por habitId + completedOn', () => {
      const service = createService();
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

    it('segundo toggle no mesmo dia remove a completion em vez de duplicar', () => {
      const service = createService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id);
      expect(service.isCompleted(habit.id)).toBe(true);
      expect(
        completionsForHabitOnDate(
          service.completionsReadonly(),
          habit.id,
          FIXED_DATE_KEY,
        ),
      ).toHaveLength(1);

      service.toggleCompletion(habit.id);
      expect(service.isCompleted(habit.id)).toBe(false);
      expect(
        completionsForHabitOnDate(
          service.completionsReadonly(),
          habit.id,
          FIXED_DATE_KEY,
        ),
      ).toHaveLength(0);
    });

    it('persiste o estado após load()', () => {
      const service = createService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id);

      TestBed.resetTestingModule();
      configureTestBed();
      const reloaded = createService();

      expect(reloaded.isCompleted(habit.id)).toBe(true);
      expect(
        completionsForHabitOnDate(
          reloaded.completionsReadonly(),
          habit.id,
          FIXED_DATE_KEY,
        ),
      ).toHaveLength(1);
    });
  });

  describe('RN-05 — archiveHabit preserva completions', () => {
    it('marca archived=true sem remover nem alterar completions', () => {
      const service = createService();
      const habit = service.createHabit(createMinimalHabitDto());

      service.toggleCompletion(habit.id, '2026-06-01');
      service.toggleCompletion(habit.id, '2026-06-02');
      service.toggleCompletion(habit.id, '2026-06-03');

      const completionsBefore = structuredClone(service.completionsReadonly());

      service.archiveHabit(habit.id);

      expect(service.getHabitById(habit.id)?.archived).toBe(true);
      expect(service.completionsReadonly()).toHaveLength(completionsBefore.length);
      expect(service.completionsReadonly()).toEqual(completionsBefore);
    });
  });

  describe('exportStorage / importStorage roundtrip', () => {
    it('restaura habits e completions de forma fiel', () => {
      const service = createService();
      const habitA = service.createHabit(createMinimalHabitDto());
      const habitB = service.createHabit({
        ...createMinimalHabitDto(),
        name: 'Segundo hábito',
      });

      service.toggleCompletion(habitA.id, '2026-06-01');
      service.toggleCompletion(habitA.id, '2026-06-05');
      service.toggleCompletion(habitB.id, FIXED_DATE_KEY);

      const exported = service.exportStorage();

      localStorageMock.clearStore();
      TestBed.resetTestingModule();
      configureTestBed();

      const fresh = createService();
      expect(fresh.habitsReadonly()).toEqual([]);
      expect(fresh.completionsReadonly()).toEqual([]);

      const result = fresh.importStorage(exported);

      expect(result).toEqual({ ok: true });
      expect(fresh.completionsReadonly()).toEqual(exported.completions);
      expect(fresh.habitsReadonly()).toHaveLength(exported.habits.length);
      for (const habit of fresh.habitsReadonly()) {
        const original = exported.habits.find((entry) => entry.id === habit.id);
        expect(original).toBeDefined();
        expect(habit.name).toBe(original!.name);
        expect(habit.archived).toBe(original!.archived);
        expect(habit.scheduleDays).toEqual(original!.scheduleDays);
      }

      const stored = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY)!,
      ) as AppStorage;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
      expect(stored.completions).toEqual(exported.completions);
      expect(stored.habits).toHaveLength(exported.habits.length);
    });
  });

  describe('load()', () => {
    it('inicia arrays vazios quando localStorage não tem a chave', () => {
      localStorageMock.clearStore();

      const service = createService();

      expect(service.habitsReadonly()).toEqual([]);
      expect(service.completionsReadonly()).toEqual([]);
      expect(service.freezeUsedReadonly()).toEqual([]);
    });

    it('inicia arrays vazios quando o valor armazenado é null literal', () => {
      localStorageMock.setItem(STORAGE_KEY, 'null');

      const service = createService();

      expect(service.habitsReadonly()).toEqual([]);
      expect(service.completionsReadonly()).toEqual([]);
      expect(service.freezeUsedReadonly()).toEqual([]);
    });

    it('inicia estado vazio com JSON inválido sem lançar exceção', () => {
      localStorageMock.setItem(STORAGE_KEY, '{ invalid json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

      let service: HabitStorageService | undefined;
      expect(() => {
        service = createService();
      }).not.toThrow();

      expect(service!.habitsReadonly()).toEqual([]);
      expect(service!.completionsReadonly()).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('inicia estado vazio com estrutura incompatível sem lançar exceção', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify('apenas uma string'));

      let service: HabitStorageService | undefined;
      expect(() => {
        service = createService();
      }).not.toThrow();

      expect(service!.habitsReadonly()).toEqual([]);
      expect(service!.completionsReadonly()).toEqual([]);
    });

    it('migra automaticamente JSON v5 e persiste na versão atual', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storageV5));

      const service = createService();

      expect(service.completionsReadonly()).toEqual(storageV5.completions);
      expect(service.habitsReadonly()).toHaveLength(storageV5.habits.length);
      expect(service.habitsReadonly()[0]?.triggers[0]?.text).toBe('Após o café');
      expect(service.habitsReadonly()[0]?.generalGoal).toBe('30 minutos por dia');

      const stored = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY)!,
      ) as AppStorage;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
      expect(stored.completions).toEqual(storageV5.completions);
      expect(Array.isArray(stored.freezeUsed)).toBe(true);
    });
  });

  describe('importStorage — JSON legado', () => {
    it('importa payload v5 na versão atual', () => {
      const service = createService();

      const result = service.importStorage(storageV5);

      expect(result).toEqual({ ok: true });
      expect(service.completionsReadonly()).toEqual(storageV5.completions);

      const stored = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY)!,
      ) as AppStorage;
      expect(stored.version).toBe(CURRENT_STORAGE_VERSION);
    });
  });
});
