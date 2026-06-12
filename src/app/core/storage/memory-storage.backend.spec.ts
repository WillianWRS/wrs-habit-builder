import { describe, expect, it } from 'vitest';
import { CURRENT_STORAGE_VERSION } from '../models/app-storage.model';
import { MemoryStorageBackend } from './memory-storage.backend';

describe('MemoryStorageBackend', () => {
  it('persiste e lê o documento AppStorage', async () => {
    const backend = new MemoryStorageBackend();
    const payload = {
      version: CURRENT_STORAGE_VERSION,
      habits: [],
      completions: [],
      freezeUsed: [],
    };

    await backend.write(payload);

    expect(await backend.read()).toEqual(payload);
    expect(backend.peek()).toEqual(payload);
  });

  it('retorna null quando vazio', async () => {
    const backend = new MemoryStorageBackend();

    expect(await backend.read()).toBeNull();
  });
});
