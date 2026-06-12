import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { IndexedDbStorageBackend } from './indexed-db-storage.backend';
import { MemoryStorageBackend } from './memory-storage.backend';
import { STORAGE_BACKEND, type StorageBackend } from './storage-backend.model';

export function provideAppStorageBackend() {
  return {
    provide: STORAGE_BACKEND,
    useFactory: (platformId: object): StorageBackend => {
      if (!isPlatformBrowser(platformId)) {
        return new MemoryStorageBackend();
      }

      return new IndexedDbStorageBackend();
    },
    deps: [PLATFORM_ID],
  };
}
