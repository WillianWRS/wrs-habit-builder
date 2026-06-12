---
name: habit-builder-localstorage
description: >-
  IndexedDB persistence layer for WRS Habit Builder: schema, keys, repository
  service, migrations, and date handling. Use when reading/writing habits, completions,
  seeding data, or implementing HabitStore/StorageService.
---

# Habit Builder — persistência (IndexedDB)

Persistência **única** do app. Sem API. Dados de hábitos vivem no **IndexedDB**; preferências leves (tema, accent) permanecem no `localStorage`.

## Backend e chaves

| Item | Valor |
|------|-------|
| Database IndexedDB | `wrs-habit-builder` |
| Object store | `app-storage` |
| Documento único | chave `current` → `AppStorage` versionado |
| Chave legada localStorage | `wrs-habit-builder` — **não é mais lida** (fluxo manual export/import) |
| Tema / accent | `wrs-habit-builder-theme`, `wrs-habit-builder-accent` (localStorage) |

```typescript
interface AppStorage {
  version: number;
  habits: Habit[];
  completions: HabitCompletion[];
  freezeUsed: HabitFreezeUsed[];
}
```

## Arquitetura

- **`StorageBackend`** — interface (`read` / `write` assíncronos)
- **`IndexedDbStorageBackend`** — produção (browser)
- **`MemoryStorageBackend`** — testes
- **`HabitStorageService`** — único ponto de mutação; signals + `persist()` assíncrono

```typescript
@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  readonly ready = signal(false);

  async initialize(): Promise<void> { /* APP_INITIALIZER */ }
}
```

**Regra:** toda mutação passa pelo serviço → atualiza signals → `persist()`. Componentes **não** acessam IndexedDB diretamente.

Bootstrap: `APP_INITIALIZER` chama `initialize()` **antes** da UI renderizar (sem flash de estado vazio).

## Migração localStorage → IndexedDB

**Não há migração automática.** Fluxo manual:

1. Usuário exporta JSON em `/data` (antes de atualizar)
2. App novo ignora chave legada no localStorage; listagem vazia
3. Usuário importa JSON → dados gravados no IndexedDB

Import aceita JSONs antigos (v5+) via `migrateStorage()`.

## Operações obrigatórias

| Método | Comportamento |
|--------|---------------|
| `getHabits(activeOnly?)` | Filtra `archived === false` se `activeOnly` |
| `getHabitById(id)` | Habit ou undefined |
| `createHabit(dto)` | Gera `id` (crypto.randomUUID), `createdAt`, persiste |
| `updateHabit(id, patch)` | Merge parcial, persiste |
| `archiveHabit(id)` | `archived: true`, **não** remove completions |
| `getCompletionsForHabit(habitId)` | Lista filtrada |
| `toggleCompletion(habitId, date)` | RN-01: idempotente por dia |
| `isCompleted(habitId, date)` | boolean |
| `getTodayHabits(date?)` | Ativos + weekday ∈ scheduleDays |
| `exportStorage()` / `importStorage(raw)` | Backup JSON (formato inalterado) |

### toggleCompletion (RN-01)

Idempotente por `habitId` + `completedOn` (data local YYYY-MM-DD).

## Datas — sempre local

Usar **data local do usuário** via `toDateKey()` / `parseDateKey()` em `src/app/core/utils/date.utils.ts`.

## Migrações de schema

`migrate-storage.ts` encadeia v5→…→`CURRENT_STORAGE_VERSION`. Incrementar versão ao mudar schema; import e load aplicam a cadeia automaticamente.

## Tratamento de erros

| Cenário | Ação |
|---------|------|
| IndexedDB indisponível/bloqueado | Toast com mensagem clara; estado vazio |
| Falha ao persistir | Toast + log |
| SSR (`typeof window === 'undefined'`) | `initialize()` no-op; `persist()` guard |

## Testes

Injetar `MemoryStorageBackend` via token `STORAGE_BACKEND`:

```typescript
providers: [
  { provide: STORAGE_BACKEND, useValue: new MemoryStorageBackend() },
]
```

Chamar `await service.initialize()` antes dos asserts.

## Anti-patterns

- ❌ Ler/gravar `wrs-habit-builder` no localStorage para dados de hábitos
- ❌ Migração automática localStorage → IndexedDB
- ❌ Múltiplas chaves soltas para habits/completions
- ❌ Seed de dados demo no `load()`
- ❌ Salvar em cada keystroke do formulário

## Skills relacionadas

- Tipos e RN: `habit-builder-product`
- Onde consumir na UI: `habit-builder-screens`
