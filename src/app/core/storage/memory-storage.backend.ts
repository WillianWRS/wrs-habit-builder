import type { AppStorage } from '../models/app-storage.model';
import type { StorageBackend } from './storage-backend.model';

/** Backend em memória para testes e desenvolvimento. */
export class MemoryStorageBackend implements StorageBackend {
  private document: AppStorage | null = null;

  isAvailable(): boolean {
    return true;
  }

  async read(): Promise<AppStorage | null> {
    return this.document ? structuredClone(this.document) : null;
  }

  async write(payload: AppStorage): Promise<void> {
    this.document = structuredClone(payload);
  }

  /** Limpa o documento — apenas para testes. */
  clear(): void {
    this.document = null;
  }

  /** Leitura síncrona do documento — apenas para testes. */
  peek(): AppStorage | null {
    return this.document ? structuredClone(this.document) : null;
  }
}
