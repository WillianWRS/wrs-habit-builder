import { describe, expect, it } from 'vitest';
import { DEFAULT_HABIT_CATEGORIES } from '../constants/habit-categories.constants';
import { migrateV10ToV11 } from './migrate-v10-to-v11';

describe('migrateV10ToV11', () => {
  it('adiciona categorias base e preserva categorias dos hábitos', () => {
    const result = migrateV10ToV11({
      version: 10,
      habits: [
        {
          category: 'Mente',
        },
        {
          category: 'Saúde',
        },
      ],
      completions: [],
      freezeUsed: [],
      habitNotes: [],
    } as unknown as Parameters<typeof migrateV10ToV11>[0]);

    expect(result.version).toBe(11);
    expect(result.categories).toContain('Mente');
    expect(result.categories).toContain('Saúde');

    for (const category of DEFAULT_HABIT_CATEGORIES) {
      expect(result.categories).toContain(category);
    }
  });

  it('não duplica categorias com diferença de caixa', () => {
    const result = migrateV10ToV11({
      version: 10,
      habits: [{ category: 'saúde' }],
      completions: [],
      freezeUsed: [],
      habitNotes: [],
      categories: ['Saúde'],
    } as unknown as Parameters<typeof migrateV10ToV11>[0]);

    expect(result.categories?.filter((category) => category.toLowerCase() === 'saúde')).toHaveLength(1);
  });
});
