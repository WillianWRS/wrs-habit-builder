import { describe, expect, it } from 'vitest';
import {
  buildMarqueeItems,
  buildMarqueeItemsFromSlots,
  mapStorageSlotsToVisibleForm,
  mapVisibleFormSlotsToStorage,
  resolveTriggerMotivationFields,
} from './habit-trigger-motivation.utils';
import { createTestHabit } from '../testing/test-habit.factory';

describe('habit-trigger-motivation.utils', () => {
  it('resolveTriggerMotivationFields — legado numerado para migração', () => {
    const fields = resolveTriggerMotivationFields({
      trigger1: 'Gatilho 1',
      trigger2: 'Gatilho 2',
      motivation1: 'Motivação 1',
      motivation2: 'Motivação 2',
    });

    expect(fields).toMatchObject({
      trigger3: '',
      motivation3: '',
      trigger1Visible: true,
      trigger2Visible: true,
      trigger3Visible: false,
      motivation1Visible: true,
      motivation2Visible: true,
      motivation3Visible: false,
    });
  });

  it('buildMarqueeItems — apenas slots visíveis com texto', () => {
    const habit = createTestHabit({
      triggers: [
        { text: 'Apenas faça', visible: true },
        { text: 'Oculto', visible: false },
        { text: '', visible: false },
      ],
      motivations: [
        { text: 'Realização pessoal', visible: true },
        { text: '', visible: false },
        { text: 'Extra', visible: true },
      ],
    });

    expect(buildMarqueeItems(habit)).toEqual([
      { type: 'trigger', text: 'Apenas faça' },
      { type: 'motivation', text: 'Realização pessoal' },
      { type: 'motivation', text: 'Extra' },
    ]);
  });

  it('mapVisibleFormSlotsToStorage mantém slots invisíveis com visible: false', () => {
    expect(
      mapVisibleFormSlotsToStorage([
        { text: 'Gatilho', visible: true },
        { text: 'Segundo', visible: true },
      ]),
    ).toEqual([
      { text: 'Gatilho', visible: true },
      { text: 'Segundo', visible: true },
      { text: '', visible: false },
    ]);
  });

  it('mapStorageSlotsToVisibleForm retorna apenas slots visíveis', () => {
    expect(
      mapStorageSlotsToVisibleForm([
        { text: 'A', visible: true },
        { text: 'B', visible: true },
        { text: '', visible: false },
      ]),
    ).toEqual([
      { text: 'A', visible: true },
      { text: 'B', visible: true },
    ]);
  });

  it('buildMarqueeItemsFromSlots delega para buildMarqueeItems', () => {
    const items = buildMarqueeItemsFromSlots(
      [{ text: 'T1', visible: true }],
      [{ text: 'M1', visible: true }],
    );

    expect(items).toEqual([
      { type: 'trigger', text: 'T1' },
      { type: 'motivation', text: 'M1' },
    ]);
  });
});
