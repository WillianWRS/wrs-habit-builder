import { describe, expect, it } from 'vitest';
import { migrateV9ToV10 } from './migrate-v9-to-v10';

describe('migrateV9ToV10', () => {
  it('adiciona habitNotes vazio e incrementa versão', () => {
    const result = migrateV9ToV10({
      version: 9,
      habits: [],
      completions: [],
      freezeUsed: [],
    } as unknown as Parameters<typeof migrateV9ToV10>[0]);

    expect(result.version).toBe(10);
    expect(result.habitNotes).toEqual([]);
  });
});
