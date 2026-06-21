import { describe, expect, it } from 'vitest';
import {
  findCategoryMatch,
  mergeUniqueCategories,
  normalizeCategoryName,
} from './habit-categories.utils';

describe('habit-categories.utils', () => {
  it('normaliza espaços em branco', () => {
    expect(normalizeCategoryName('  Saúde   mental  ')).toBe('Saúde mental');
  });

  it('mescla listas sem duplicar por caixa', () => {
    expect(mergeUniqueCategories(['Saúde'], ['saúde', 'Estudo'])).toEqual([
      'Saúde',
      'Estudo',
    ]);
  });

  it('encontra correspondência ignorando caixa', () => {
    expect(findCategoryMatch(['Saúde', 'Estudo'], 'saúde')).toBe('Saúde');
  });
});
