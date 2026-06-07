---
name: habit-builder-localstorage
description: >-
  localStorage persistence layer for WRS Habit Builder: schema, keys, repository
  service, migrations, and date handling. Use when reading/writing habits, completions,
  seeding data, or implementing HabitStore/StorageService.
---

# Habit Builder — localStorage

Persistência **única** do app. Sem API, sem IndexedDB no MVP, sem modo demo com seed fake.

## Chaves e schema versionado

```typescript
const STORAGE_KEY = 'wrs-habit-builder';
const CURRENT_VERSION = 1;

interface AppStorage {
  version: number;
  habits: Habit[];
  completions: HabitCompletion[];
}
```

Serialização: `JSON.stringify` / `JSON.parse` com try/catch.

## Serviço central

Um único serviço (`HabitStorageService` ou `StorageService`) em `src/app/core/`:

```typescript
@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly habits = signal<Habit[]>([]);
  private readonly completions = signal<HabitCompletion[]>([]);

  readonly habitsReadonly = this.habits.asReadonly();
  readonly completionsReadonly = this.completions.asReadonly();

  constructor() {
    this.load();
  }

  load(): void { /* read localStorage → signals */ }
  private persist(): void { /* signals → localStorage */ }
}
```

**Regra:** toda mutação passa pelo serviço → atualiza signals → `persist()`. Componentes **não** acessam `localStorage` diretamente.

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

### toggleCompletion (RN-01)

```typescript
toggleCompletion(habitId: string, date: string): void {
  const exists = this.completions().some(
    c => c.habitId === habitId && c.completedOn === date
  );
  if (exists) {
    this.completions.update(list =>
      list.filter(c => !(c.habitId === habitId && c.completedOn === date))
    );
  } else {
    this.completions.update(list => [
      ...list,
      { id: crypto.randomUUID(), habitId, completedOn: date },
    ]);
  }
  this.persist();
}
```

## Datas — sempre local

Usar **data local do usuário**, não UTC puro:

```typescript
/** "YYYY-MM-DD" na timezone local */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
```

Colocar utils em `src/app/core/date.utils.ts`.

## Migrações

```typescript
private migrate(raw: unknown): AppStorage {
  if (!raw || typeof raw !== 'object') {
    return { version: CURRENT_VERSION, habits: [], completions: [] };
  }
  const data = raw as Partial<AppStorage>;
  if ((data.version ?? 0) < 1) {
    return { version: 1, habits: data.habits ?? [], completions: data.completions ?? [] };
  }
  return data as AppStorage;
}
```

Incrementar `CURRENT_VERSION` ao mudar schema; adicionar branch `if (version < 2)` etc.

## Tratamento de erros

| Cenário | Ação |
|---------|------|
| JSON inválido | Log warn, iniciar estado vazio |
| QuotaExceededError | Toast/mensagem: "Espaço insuficiente no navegador" |
| SSR (`typeof window === 'undefined'`) | No-op load; persist guard |

```typescript
private persist(): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: AppStorage = {
      version: CURRENT_VERSION,
      habits: this.habits(),
      completions: this.completions(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('[HabitStorage] persist failed', e);
  }
}
```

## Cálculos derivados (no serviço ou `HabitStatsService`)

Manter lógica de adesão **fora** dos componentes:

```typescript
adherencePercent(habitId: string, days: 7 | 30, endDate = new Date()): number {
  const habit = this.getHabitById(habitId);
  if (!habit) return 0;
  const expected = countExpectedDays(habit.scheduleDays, days, endDate);
  const done = countCompletionsInRange(habitId, days, endDate);
  return expected > 0 ? Math.round((done / expected) * 100) : 0;
}
```

Implementação de `countExpectedDays`: iterar N dias para trás; contar onde `weekday ∈ scheduleDays`.

## Heatmap data

```typescript
interface HeatmapCell {
  date: string;
  status: 'done' | 'missed' | 'skipped';
}

getHeatmap(habitId: string, dayCount = 66): HeatmapCell[] {
  // skipped = weekday ∉ scheduleDays
  // missed = expected but no completion
  // done = completion exists
}
```

## Testes (Vitest)

Testar sem browser real:

```typescript
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
});
```

Casos mínimos:

- create + load roundtrip
- toggle idempotente (RN-01)
- archive não remove completions (RN-05)
- getTodayHabits respeita scheduleDays (RN-03)

## Anti-patterns

- ❌ Múltiplas chaves soltas (`habits`, `completions` separados)
- ❌ Seed de dados demo no `load()`
- ❌ `sessionStorage` (dados devem persistir entre sessões)
- ❌ Salvar em cada keystroke do formulário (salvar no submit)

## Skills relacionadas

- Tipos e RN: `habit-builder-product`
- Onde consumir na UI: `habit-builder-screens`
