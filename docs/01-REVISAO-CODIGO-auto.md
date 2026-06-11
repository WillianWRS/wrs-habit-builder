# Revisão de Código (auto) — WRS Habit Builder

> Avaliação técnica automatizada do código-fonte: boas práticas, implementações sólidas, código problemático e correções recomendadas. **Gerado em:** junho/2026.

---

## Resumo executivo

O projeto demonstra maturidade acima da média para um app Angular frontend-only: Angular 21 com standalone components, signals, `inject()`, control flow nativo, `OnPush` consistente, lazy loading e separação `core/features/shared`. A lógica de domínio está em funções puras testáveis e o storage centraliza mutações.

Porém, há **dois defeitos críticos de integridade de dados**, **componentes monolíticos** (1.000+ linhas), **testes parcialmente quebrados** e **dívida estrutural** no modelo de domínio e nas migrações de schema.

| Severidade | Qtd. | Destaques |
|------------|------|-----------|
| 🔴 Crítico | 2 | Reset destrutivo de histórico; patch pessoal hardcoded no bundle |
| 🟠 Alto | 5 | Componentes gigantes; modelo `trigger1/2/3`; specs quebrados; migração sem versionamento; `effect()` com efeito colateral destrutivo |
| 🟡 Médio | 7 | Hack form→signal; progresso fake; idioma misto; demo mode; campo "opcional" obrigatório |
| 🟢 Baixo | 6 | Performance menor, naming, higiene de repo, SSR desnecessário, ausência de lint |

---

## ✅ O que está bem implementado

### Arquitetura Angular moderna

- **Signals como fonte de verdade**: `HabitStorageService` expõe `habitsReadonly`/`completionsReadonly` e deriva `todayHabitCards`/`habitListCards` via `computed()`. Componentes não acessam `localStorage` diretamente.
- **Standalone + lazy loading**: rotas em `app.routes.ts` usam `loadComponent` para `today`, `habits`, `historico` e `data`.
- **`ChangeDetectionStrategy.OnPush`** em todos os componentes verificados — alinhado com signals.
- **`CurrentDayService`**: signal de "hoje" com timer para meia-noite e listeners `visibilitychange`/`focus`. Resolve o bug clássico de app aberto durante a virada do dia.
- **Guards de SSR**: `isPlatformBrowser` em `HabitStorageService` e demais pontos que tocam `localStorage`/`document`.

### Lógica de domínio e datas

- **Utils puros** em `core/utils/`: `date.utils`, `habit-streak.utils`, `month-heatmap.utils`, `habit-sort.utils`, etc., com specs cobrindo casos principais.
- **Datas em timezone local**: `toDateKey`/`parseDateKey` — correto para hábitos diários.
- **`scheduleDaySince`**: rastreia quando cada dia da semana passou a contar no hábito — evita falsas faltas retroativas ao editar frequência.

### Qualidade de implementação pontual

- FLIP animation na lista (`habit-list-flip.utils.ts`).
- `prefers-reduced-motion` respeitado nas animações de streak e progresso.
- Script inline de tema em `index.html` para evitar FOUC.
- Tratamento de `QuotaExceededError` no import com mensagem amigável.
- `day-progress` expõe `role="progressbar"` + `aria-valuenow` corretamente.

---

## 🔴 Problemas críticos

### 1. `reconcileStreakResets` apaga todo o histórico do hábito

**Arquivo:** `src/app/core/services/habit-storage.service.ts`

Um `effect()` no construtor observa `habits()` e `completions()` e chama `reconcileStreakResets()`. Quando `missCount >= STREAK_MISS_TOLERANCE` (7), **todas as completions daquele hábito são removidas** do `localStorage`:

```387:401:src/app/core/services/habit-storage.service.ts
  private reconcileStreakResets(referenceDate: Date): void {
    const habits = this.habits();
    const completions = this.completions();
    const habitIdsToReset = new Set(
      getHabitIdsToReset(habits, completions, referenceDate),
    );

    if (habitIdsToReset.size === 0) {
      return;
    }

    this.completions.update((list) =>
      list.filter((completion) => !habitIdsToReset.has(completion.habitId)),
    );
    this.persist();
  }
```

**Por que é grave:**

- Perda de dados **silenciosa, automática e irreversível** (exceto backup manual).
- Viola RN-05 e a tese do produto: *"Não zerar histórico ao falhar — streak pode pausar; heatmap e adesão permanecem"*.
- O heatmap em `/historico` perde dias que de fato foram concluídos.
- `dayCount` no card passa a ser contagem de completions restantes — após o reset, volta a zero mesmo com meses de esforço anteriores.

**Correção:** streak e `dayCount` devem ser **valores derivados** (`computeHabitStreakMetrics` já existe). Completions são append-only; "zerar sequência" é regra de cálculo, não mutação destrutiva.

### 2. `COMPLETION_RESTORE_PATCH` — dados pessoais no bundle de produção

**Arquivo:** `src/app/core/data/completion-restore.patch.ts`

```12:23:src/app/core/data/completion-restore.patch.ts
export const COMPLETION_RESTORE_PATCH: CompletionRestorePatch = {
  id: 'user-restore-2026-06-10',
  days: [
    {
      dateKey: '2026-06-09',
      habitNames: ['caminhada', 'muay thai', 'ingles', 'leitura'],
    },
    {
      dateKey: '2026-06-08',
      habitNames: ['musculação', 'caminhada'],
    },
  ],
};
```

Executado em **todo `load()` e todo import** via `applyCompletionRestoreIfNeeded()`, com matching "loose" por nome de hábito.

**Problemas:**

- Dados pessoais embarcados no bundle, aplicados a qualquer usuário com hábitos de nomes similares.
- Band-aid para o problema nº 1 — confirma que o reset destrutivo já causou perda real.
- Polui o domínio com lógica de restauração que não deveria existir em produção.

**Correção:** remover patch, `completion-restore.utils.ts` e `find-habit-by-loose-name.utils.ts`. Restauração pontual via import JSON (feature já existente em `/data`).

---

## 🟠 Alto impacto

### 3. Componentes monolíticos com template/CSS inline

| Arquivo | Linhas | Problema |
|---------|--------|----------|
| `habit-form-modal.component.ts` | **1.330** | Template (~590) + CSS (~330) + lógica (~410) num único arquivo |
| `habit-card.component.ts` | **1.054** | ~640 linhas de CSS de streak tiers; template duplicado desktop/mobile |
| `app-nav.component.ts` | **518** | Menu de settings duplicado (desktop + mobile) |

O `habit-card` repete marquee, streak e ações em blocos `hidden md:block` e `md:hidden` — qualquer ajuste exige duas edições. O `app-nav` repete 5+ itens de menu em dois contextos.

**Recomendação:** extrair subcomponentes (`HabitCardStreakStatus`, `HabitMarquee`, `SettingsMenu`, `TriggerSlotsFieldset`) e mover templates/styles para `.html`/`.css` quando passarem de ~100 linhas.

### 4. Modelo achatado `trigger1/2/3` + `motivation1/2/3`

O `Habit` em `habit.model.ts` usa 12 campos numerados + 6 booleanos de visibilidade. Isso se propaga para:

- `CreateHabitDto` / `UpdateHabitDto` (campos duplicados).
- `createHabit` / `updateHabit` (~30 linhas de cópia campo a campo).
- Form com `addTriggerSlot`/`removeTriggerSlot` + `syncTriggerMotivationValidators`.
- Template com 6 blocos quase idênticos de input.

**Recomendação:** `triggers: string[]` e `motivations: string[]` (máx. 3) + `FormArray`. Migração via `normalizeHabit` na próxima versão de schema.

### 5. Suíte de testes parcialmente quebrada

`habit-sort.utils.spec.ts` usa `describe`/`it`/`expect` **sem importar de `vitest`** — falha com `ReferenceError: describe is not defined`. `app.spec.ts` usa `TestBed` sem configuração completa de providers do app real (storage, tema, modal).

**Impacto:** `npm test` vermelho normaliza ignorar testes. Não há **nenhum teste** para `HabitStorageService` — a peça com o bug crítico nº 1.

**Recomendação:** imports explícitos de vitest em todos os specs; testes de storage (toggle idempotente, archive preserva completions, import roundtrip, **sem reset destrutivo**); CI bloqueando merge com testes falhando.

### 6. Versionamento de schema declarado mas ignorado

`CURRENT_STORAGE_VERSION = 6` em `app-storage.model.ts`, mas `migrate()` sempre chama `normalizeHabit` em todos os hábitos, **sem checar `data.version`**:

```457:473:src/app/core/services/habit-storage.service.ts
  private migrate(raw: unknown): AppStorage {
    // ...
    const habits = (data.habits ?? []).map((habit) => normalizeHabit(habit));
    return {
      version: CURRENT_STORAGE_VERSION,
      habits,
      completions: data.completions ?? [],
    };
  }
```

A migração trigger/motivation virou botão manual **"Atualizar JSON"** em `/data` — responsabilidade do app, não do usuário.

### 7. `effect()` com efeito colateral destrutivo no construtor

O padrão de usar `effect()` para reconciliar streak e **persistir deleções** é anti-pattern para dados do usuário:

- Roda em qualquer mudança de habits/completions (incluindo toggle, import, load).
- Mistura leitura reativa com mutação destrutiva no mesmo fluxo.
- Dificulta testar e raciocinar sobre estado.

**Recomendação:** remover o effect; métricas de streak são puramente derivadas no mapper (`today-habit.mapper.ts` já usa `computeHabitStreakMetrics`).

---

## 🟡 Impacto médio

### 8. Ponte forms→signals via contador

`habit-form-modal.component.ts` usa `formPreviewVersion` incrementado por `form.valueChanges.subscribe()` sem `takeUntilDestroyed`. O Angular oferece `toSignal(this.form.valueChanges)` — padrão mais idiomático e com cleanup automático.

### 9. Progresso de importação simulado (5–15 s)

`data-management-page.component.ts`: import real ocorre no passo 2 (`importStorage`), mas a UI encena 5 etapas com `randomStepDelay()` de 1–3 s cada. Operação síncrona disfarçada de processamento longo.

### 10. Mistura de idiomas no código

`metaGeral`, `metasDinamicas`, rota `historico` convivem com `name`, `scheduleDays`, `today`, `habits`, `data`. Recomendado: inglês no código, PT-BR apenas em copy/labels.

### 11. Demo mode acoplado e não documentado no produto

`DemoModeService` + ativação por duplo-clique no logo (`revealPreviewActions`) contradiz a skill de produto ("modo demo não existe"). `TodayPageComponent` e `AppNavComponent` espalham `@if (demoMode.isActive())` por dezenas de linhas.

### 12. `optionalReminder` com `Validators.required`

O campo se chama opcional mas é obrigatório no form principal e nas metas dinâmicas por dia. Contradição semântica e barreira de entrada desnecessária.

### 13. Campo `showOnToday` — complexidade extra

Além de `scheduleDays`, há `showOnToday: boolean` que filtra hábitos em "Hoje". Duas dimensões de "aparecer hoje" aumentam confusão de domínio e código no storage (`getTodayHabits`).

### 14. `HabitStorageService` com múltiplas responsabilidades

Repositório (localStorage) + regras de domínio (reset, normalização, restore patch) + view-models (mappers de cards) num único serviço de 418 linhas. Funciona no MVP, mas dificulta evolução.

---

## 🟢 Menores

1. **`filterCounts` na HabitsPage**: `isHabitOnToday` dentro de `filter` → O(n²). Computar Set de IDs de hoje uma vez resolve.
2. **Asset com espaço**: `public/habit builder.png` — renomear para `habit-builder.png` (versão com hífen já existe).
3. **`.firebase/` fora do `.gitignore`** — cache de deploy aparece como untracked.
4. **SSR + Express** para app 100% localStorage: servidor sempre renderiza casca vazia; custo de `server.ts`, hydration e guards sem benefício real de dados.
5. **Sem ESLint** — só Prettier. `angular-eslint` pegaria imports ausentes, subscriptions sem cleanup, etc.
6. **Budget de estilo**: `habit-card` com ~640 linhas de CSS inline provavelmente excede o budget de `anyComponentStyle` (16 kB) em produção.

---

## Matriz de prioridade

| # | Ação | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Remover reset destrutivo; streak derivado | M | 🔥 Crítico |
| 2 | Remover `COMPLETION_RESTORE_PATCH` e utils | S | 🔥 Crítico |
| 3 | Consertar specs + testes do `HabitStorageService` | M | Alto |
| 4 | Migração real por `version`; remover botão manual | M | Alto |
| 5 | Refatorar `trigger/motivation` → arrays + FormArray | L | Alto |
| 6 | Quebrar componentes gigantes em subcomponentes | L | Médio |
| 7 | ESLint + CI (lint, test, build) | S | Médio |
| 8 | Limpar: progresso fake, `optionalReminder`, demo mode, assets | S | Baixo |

---

## Conclusão

A base técnica é sólida e moderna — o time (ou autor) domina Angular contemporâneo e separação de camadas. Os problemas mais graves não são de estilo ou framework, mas de **regra de negócio implementada como mutação destrutiva** e de **dívida acumulada em componentes e modelo**. Corrigir os itens críticos (1 e 2) deve preceder qualquer feature nova; construir em cima do reset atual multiplica o risco de perda de dados a cada release.
