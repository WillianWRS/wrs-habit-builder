import type { AppStorage } from '../models/app-storage.model';
import {
  IDB_DATABASE_NAME,
  IDB_DOCUMENT_KEY,
  IDB_OBJECT_STORE_NAME,
  StorageBackendError,
  type StorageBackend,
} from './storage-backend.model';

const IDB_SCHEMA_VERSION = 1;

export class IndexedDbStorageBackend implements StorageBackend {
  private dbPromise: Promise<IDBDatabase> | null = null;

  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  async read(): Promise<AppStorage | null> {
    this.assertAvailable();

    const db = await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_OBJECT_STORE_NAME, 'readonly');
      const store = transaction.objectStore(IDB_OBJECT_STORE_NAME);
      const request = store.get(IDB_DOCUMENT_KEY);

      request.onsuccess = () => {
        resolve((request.result as AppStorage | undefined) ?? null);
      };

      request.onerror = () => {
        reject(request.error ?? new StorageBackendError('Falha ao ler dados.', 'unknown'));
      };
    });
  }

  async write(payload: AppStorage): Promise<void> {
    this.assertAvailable();

    const db = await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_OBJECT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(IDB_OBJECT_STORE_NAME);
      const request = store.put(payload, IDB_DOCUMENT_KEY);

      request.onsuccess = () => resolve();

      request.onerror = () => {
        reject(request.error ?? new StorageBackendError('Falha ao gravar dados.', 'unknown'));
      };
    });
  }

  private assertAvailable(): void {
    if (!this.isAvailable()) {
      throw new StorageBackendError(
        'Armazenamento local indisponível neste navegador.',
        'unavailable',
      );
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_DATABASE_NAME, IDB_SCHEMA_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;

          if (!db.objectStoreNames.contains(IDB_OBJECT_STORE_NAME)) {
            db.createObjectStore(IDB_OBJECT_STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => {
          reject(
            request.error ??
              new StorageBackendError(
                'Não foi possível abrir o banco de dados local.',
                'blocked',
              ),
          );
        };

        request.onblocked = () => {
          reject(
            new StorageBackendError(
              'Armazenamento local bloqueado. Feche outras abas deste app.',
              'blocked',
            ),
          );
        };
      });
    }

    return this.dbPromise;
  }
}
