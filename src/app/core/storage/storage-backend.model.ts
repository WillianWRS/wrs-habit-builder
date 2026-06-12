import { InjectionToken } from '@angular/core';
import type { AppStorage } from '../models/app-storage.model';

export const IDB_DATABASE_NAME = 'wrs-habit-builder';
export const IDB_OBJECT_STORE_NAME = 'app-storage';
export const IDB_DOCUMENT_KEY = 'current';

export type StorageBackendErrorCode = 'unavailable' | 'blocked' | 'unknown';

export class StorageBackendError extends Error {
  constructor(
    message: string,
    readonly code: StorageBackendErrorCode,
  ) {
    super(message);
    this.name = 'StorageBackendError';
  }
}

export interface StorageBackend {
  isAvailable(): boolean;
  read(): Promise<AppStorage | null>;
  write(payload: AppStorage): Promise<void>;
}

export const STORAGE_BACKEND = new InjectionToken<StorageBackend>('STORAGE_BACKEND');
