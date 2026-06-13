import { describe, expect, it } from 'vitest';
import { buildHabitNewLink } from './habit-form-return-url.utils';

describe('buildHabitNewLink', () => {
  it('inclui template na query quando informado', () => {
    expect(buildHabitNewLink('/habits', { template: 'reading' }).queryParams).toEqual({
      returnUrl: '/habits',
      template: 'reading',
    });
  });
});
