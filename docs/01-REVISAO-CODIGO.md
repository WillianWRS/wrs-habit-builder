# Revisão de Código — WRS Habit Builder

> Avaliação técnica do código-fonte: o que está bem implementado, o que é problemático e o que deve ser corrigido. Data da análise: junho/2026.

---

## Resumo executivo

O projeto está em um nível **acima da média** para um app frontend: usa Angular 21 moderno (standalone components, signals, `inject()`, control flow `@if/@for`, `ChangeDetectionStrategy.OnPush`, lazy loading de rotas), tem separação de camadas clara (`core/features/shared`), utils puros com testes unitários e tratamento consistente de SSR e erros de storage.

Porém, existem **2 problemas críticos** que comprometem a integridade dos dados do usuário, **componentes gigantes** que dificultam manutenção, e uma **suíte de testes parcialmente quebrada**.

| Severidade | Quantidade | Destaques |
|------------|-----------|-----------|
| 🔴 Crítico | 2 | Reset destrutivo de histórico; patch de dados pessoais hardcoded |
| 🟠 Alto | 4 | Componentes de 1000+ linhas; modelo `trigger1/2/3`; testes quebrados; migração sem versionamento |
| 🟡 Médio | 6 | Hack form→signal; progresso fake de import; mistura de idiomas; demo mode acoplado |
| 🟢 Baixo | 5 | Detalhes de performance, naming e organização |

---

## ✅ O que está bem feito

### Arquitetura e padrões Angular

- **Signals como fonte de verdade**: `HabitStorageService` expõe `habits`/`completions` como signals readonly e deriva `todayHabitCards`/`habitListCards` via `computed()`. Componentes nunca acessam `localStorage` diretamente — toda mutação passa pelo serviço e chama `persist()`.
- **Standalone + lazy loading**: todas as rotas usam `loadComponent`, sem NgModules.
- **OnPush em todos os componentes** — consistente com a abordagem signal-based.
- **`CurrentDayService` é uma ótima ideia**: signal de "hoje" que atualiza na meia-noite (timer agendado) e ao retomar a aba (`visibilitychange`/`focus`). Resolve o clássico bug de app aberto durante a virada do dia.
- **Guards de SSR** (`isPlatformBrowser`) aplicados corretamente em todos os pontos que tocam `localStorage`/`document`.
- **Utils puros e testáveis** em `core/utils/` (datas, streak, heatmap, sort), com specs cobrindo os casos principais.
- **Date handling correto**: `toDateKey`/`parseDateKey` usam timezone local (não UTC), exatamente como o domínio exige.
- **Tratamento de erros no storage**: try/catch no `load()`, detecção de `QuotaExceededError` no import com mensagem amigável.

### Detalhes que mostram cuidado

- FLIP animation na lista de hábitos com `captureListItemPositions`/`flipListItems` extraídos para util.
- `prefers-reduced-motion` respeitado em praticamente todas as animações.
- Theme inline script no `index.html` para evitar FOUC (flash de tema errado).
- Acessibilidade parcial: `aria-label`, `aria-modal`, `role="menu"`, `focus-visible:ring`.

---

## 🔴 Críticos

### 1. `reconcileStreakResets` apaga o histórico do usuário permanentemente

`src/app/core/services/habit-storage.service.ts` (linhas 387–402) + `habit-streak.utils.ts`:

```typescript
private reconcileStreakResets(referenceDate: Date): void {
  // ...
  this.completions.update((list) =>
    list.filter((completion) => !habitIdsToReset.has(completion.habitId)),
  );
  this.persist();
}
```

Quando um hábito acumula **7 faltas** em dias agendados (`STREAK_MISS_TOLERANCE`), um `effect()` no construtor do serviço **deleta TODAS as completions do hábito do localStorage**, de forma automática, silenciosa e irreversível.

Por que isso é grave:

- **Perda de dados real e sem confirmação**: o usuário abre o app depois de uma semana de férias e todo o histórico (meses de conclusões) sumiu.
- **Viola a regra de negócio do próprio produto** (skill `habit-builder-product`): *"Não zerar histórico ao falhar — streak pode pausar; heatmap e adesão permanecem"* e RN-05.
- **Quebra a tela Histórico**: o heatmap mensal passa a mostrar dias vazios que de fato foram concluídos.
- **A prova do dano está no próprio repositório**: o arquivo `completion-restore.patch.ts` existe exatamente para restaurar dados que esse mecanismo apagou.

**Correção recomendada** (implementação: Sprint 1, Tarefa 1): streak derivada + freeze semanal automático. Spec oficial: `docs/07-REGRAS-STREAK-E-FREEZE.md` e `docs/SPRINT-1-TAREFA-01.md`. Completions permanecem imutáveis/append-only; quebra na 1ª falta não coberta; recorde e total preservados.

### 2. `COMPLETION_RESTORE_PATCH` — dados pessoais hardcoded no bundle

`src/app/core/data/completion-restore.patch.ts`:

```typescript
export const COMPLETION_RESTORE_PATCH: CompletionRestorePatch = {
  id: 'user-restore-2026-06-10',
  days: [
    { dateKey: '2026-06-09', habitNames: ['caminhada', 'muay thai', 'ingles', 'leitura'] },
    { dateKey: '2026-06-08', habitNames: ['musculação', 'caminhada'] },
  ],
};
```

Problemas:

- **Dados pessoais de um usuário específico embarcados no bundle de produção** e aplicados a **qualquer pessoa** que tenha hábitos com nomes parecidos (matching "loose" por nome via `findHabitByLooseName`). Qualquer visitante com um hábito chamado "caminhada" ganha completions falsas nos dias 08–09/06/2026.
- Roda em **todo `load()` e todo import** (`applyCompletionRestoreIfNeeded`), para sempre.
- É um band-aid para o problema crítico nº 1 — confirma que o reset destrutivo já causou perda de dados.

**Correção recomendada**: remover o patch (e `completion-restore.utils.ts` + `find-habit-by-loose-name.utils.ts`). Se restauração pontual for necessária, fazer via import de JSON (a feature já existe em `/data`).

---

## 🟠 Alto impacto

### 3. Componentes gigantes com template inline

| Arquivo | Linhas | Problema |
|---------|--------|----------|
| `habit-form-modal.component.ts` | 1.330 | ~330 linhas de CSS + ~590 de template + ~410 de classe num único arquivo |
| `habit-card.component.ts` | 1.054 | ~640 linhas de CSS de streak tiers + template duplicado desktop/mobile |
| `app-nav.component.ts` | 518 | Menu de settings duplicado integralmente (desktop + mobile) |

- O `habit-card` repete o **mesmo marquee e a mesma área de streak duas vezes** (bloco `hidden md:block` e bloco `md:hidden`). Qualquer ajuste precisa ser feito em dois lugares — já há divergência sutil entre eles (o desktop trata `isDayOne`, o mobile delega a `mobileSequenceTitle`).
- O `app-nav` repete os 5 itens do menu de configurações em dois templates. Extrair um `SettingsMenuComponent` eliminaria ~150 linhas.

**Recomendação**: mover templates/styles para arquivos `.html`/`.css` próprios quando passarem de ~100 linhas e extrair subcomponentes (`HabitCardStreakStatus`, `HabitMarquee`, `SettingsMenu`, `TriggerSlotsFieldset`).

### 4. Modelo de domínio com campos numerados em vez de arrays

`habit.model.ts` define `trigger1/trigger2/trigger3`, `motivation1/2/3` e seis booleanos `*Visible`. Esse design "achatado" se propaga e multiplica código por todo o app:

- `CreateHabitDto`/`UpdateHabitDto` repetem os 12 campos.
- `createHabit`/`updateHabit` copiam campo a campo (~30 linhas duplicadas entre si).
- O form precisa de `addTriggerSlot`/`removeTriggerSlot`/`addMotivationSlot`/`removeMotivationSlot` + `syncTriggerMotivationValidators` com 6 entradas manuais.
- O template repete o bloco de input 6 vezes (trigger 1/2/3 + motivation 1/2/3, quase idênticos).

**Recomendação**: modelar como `triggers: string[]` e `motivations: string[]` (máx. 3), com `FormArray` no formulário. Reduziria centenas de linhas e eliminaria a classe de bugs "esqueci de atualizar o slot 3". A migração do localStorage já tem infraestrutura (`normalizeHabit`).

### 5. Suíte de testes parcialmente quebrada

```
FAIL  src/app/core/utils/habit-sort.utils.spec.ts — ReferenceError: describe is not defined
Test Files  2 failed | 7 passed (9)
```

Dois spec files não importam `describe/it/expect` de `vitest` (ou o config não habilita `globals: true`), então **falham antes de rodar**. Quem roda `npm test` hoje vê a suíte vermelha — o que treina a equipe a ignorar testes falhando.

**Recomendação**: padronizar imports explícitos (`import { describe, it, expect } from 'vitest'`) em todos os specs, ou habilitar `globals: true` no config do Vitest, e adicionar CI para impedir regressão. Notar também que **não há testes para o `HabitStorageService`** — justamente a peça com o bug crítico nº 1 (toggle idempotente, archive preservando completions, migração).

### 6. Versionamento de schema declarado mas nunca usado

`app-storage.model.ts` define `CURRENT_STORAGE_VERSION` e o payload grava `version`, mas `migrate()` em `habit-storage.service.ts` **ignora completamente `data.version`** — sempre normaliza tudo via `normalizeHabit`. Consequências:

- O campo `version` é peso morto; não existe caminho `if (version < 2)`.
- A migração trigger/motivation virou um **botão manual** ("Atualizar JSON" em `/data`) que o usuário precisa descobrir e clicar — migração de schema é responsabilidade do app, não do usuário.

**Recomendação**: implementar migração encadeada por versão no `load()` (v1 → v2 → …) e remover o botão manual.

---

## 🟡 Impacto médio

### 7. Ponte forms→signals via contador hackeado

`habit-form-modal.component.ts`:

```typescript
private readonly formPreviewVersion = signal(0);
// ...
this.form.valueChanges.subscribe(() => {
  this.formPreviewVersion.update((version) => version + 1);
});
```

O `computed(previewFormState)` depende de um signal-contador que é incrementado por uma subscription de `valueChanges` **nunca cancelada** (sem `takeUntilDestroyed`). Como o componente é singleton no `app.html`, não vaza na prática, mas é um padrão frágil. O Angular oferece `toSignal(this.form.valueChanges)` para isso.

### 8. Progresso de importação fake

`data-management-page.component.ts`: o import real acontece no passo 2, mas a UI mostra 5 etapas fictícias ("Validando JSON", "Organizando hábitos"…) com `randomStepDelay()` de **1–3 segundos cada** — o usuário espera de 5 a 15 segundos por uma operação que é síncrona e instantânea. Além de UX questionável (ver relatório 02), é código que simula trabalho que não existe.

### 9. Mistura de idiomas no domínio e nas pastas

`metaGeral`, `metasDinamicas` convivem com `name`, `scheduleDays`, `minimumAction`; a feature `historico` convive com `today`, `habits`, `data`. Escolher um idioma para código (recomendado: inglês) e manter PT-BR apenas em copy/labels.

### 10. Demo mode acoplado às páginas

`TodayPageComponent` decide em cada `computed` se a fonte é `demoMode.cards()` ou `storage.todayHabitCards()`, e `AppNavComponent` espalha `@if (demoMode.isActive())` por dezenas de linhas. Uma fachada (`TodayCardsFacade`) que resolve a fonte internamente removeria o branching das páginas. Observação: a skill do produto diz "modo demo não existe" — se ele é um recurso de portfólio (preview de níveis visuais), vale documentar a decisão.

### 11. Form com `optionalReminder` obrigatório

O campo se chama `optionalReminder` mas tem `Validators.required` — contradição semântica entre nome e regra (e contra o modelo de domínio original, onde lembrete é opcional). Renomear ou remover o required.

### 12. `app.spec.ts` desatualizado

O spec padrão do CLI provavelmente não reflete o app real (componente root só renderiza `router-outlet` + modal). Um dos 2 arquivos falhando é esse.

---

## 🟢 Menores

1. **`filterCounts`/`habits` na HabitsPage** chamam `storage.isHabitOnToday(habit.id)` dentro de `filter`, que internamente refaz `getTodayHabits()` — O(n²). Irrelevante para dezenas de hábitos, mas é fácil computar o Set de IDs de hoje uma vez.
2. **Asset com espaço no nome**: `public/habit builder.png` referenciado como `src="/habit builder.png"`. Funciona, mas convida a problemas de encoding/cache — renomear para `habit-builder.png` (a versão com hífen já existe).
3. **`.firebase/` não está no `.gitignore`** — o cache de deploy aparece como arquivo untracked no git status.
4. **SSR/prerender + Express para um app 100% localStorage**: o servidor nunca tem dados, então toda página chega "vazia" e hidrata. O custo (bundle servidor, `provideClientHydration`, edge cases de `isPlatformBrowser`) não traz benefício real além de SEO da casca. Considerar prerender estático puro (sem `server.ts`/Express) — ver relatório 03.
5. **Sem ESLint**: o projeto tem Prettier, mas nenhuma config de lint (`eslint.config.js` ausente). `ng lint` + `angular-eslint` pegaria vários dos pontos acima automaticamente.

---

## Checklist de ação sugerido (ordem de prioridade)

1. [ ] Remover o reset destrutivo — streak como valor derivado, completions imutáveis
2. [ ] Remover `COMPLETION_RESTORE_PATCH` e utils associados
3. [ ] Consertar os 2 specs quebrados e adicionar testes do `HabitStorageService`
4. [ ] Refatorar `trigger1/2/3` + `motivation1/2/3` → arrays + `FormArray` (com migração v2)
5. [ ] Implementar migração real por `version`; remover botão "Atualizar JSON"
6. [ ] Quebrar `habit-form-modal`, `habit-card` e `app-nav` em subcomponentes
7. [ ] Adicionar ESLint + CI (lint, test, build)
8. [ ] Limpar: progresso fake do import, `optionalReminder` required, asset com espaço, `.gitignore`
