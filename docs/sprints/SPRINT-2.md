# Sprint 2 — Feedback UX + confiança

> Projeto: **WRS Habit Builder** (nome oficial a definir — pendência para o fim do alfa, imediatamente antes do lançamento)  
> Marco: **Alfa (1/3)** · Sprint anterior: **Sprint 1 (concluída)** · Capacidade: ~1 semana dev solo  
> Objetivo: fechar o gap de confiança na UX (toasts, modais, a11y) e limpar dívidas restantes da Sprint 1.

---

## Visão geral

| # | ID | Tarefa | Prioridade | Esforço |
|---|-----|--------|------------|---------|
| 1 | S2-01 | Toast service + undo (arquivar/excluir) + feedbacks | P0 | M |
| 2 | S2-02 | Limpezas restantes Sprint 1 (item 8) + rename `optionalReminder` → `time` | P1 | M |
| 3 | S2-03 | `formPreviewVersion` → `toSignal` | P1 | S |
| 4 | S2-04 | Confirmar descarte ao fechar modal com alterações | P1 | S |
| 5 | S2-05 | Focus trap nos modais + a11y na marcação do dia | P1 | M |
| 6 | S2-06 | Trocar localStorage por IndexedDB (dados de hábitos) | P1 | L |

**Ordem sugerida:** Tarefa 1 → 2 → 4 → 5 → 6 → (3 em paralelo ou por último). A Tarefa 6 por último: depende do import com toast (1 e 2) e mexe na base de persistência — melhor com o resto estável.

**Fora de escopo:** tela de métricas/detalhe (`/habits/:id`), taxa de adesão 7d/30d (vai junto da tela de métricas na Sprint 3), PWA, templates de onboarding, monetização, decisão de nome oficial/marca.

**Referências:** doc 02 itens 5, 9 e 13 · doc 01 item 8 · `habit-builder-ui` · `habit-builder-screens`

---

## Definition of Done da Sprint 2

| Critério | Tarefa |
|----------|--------|
| Toast + undo de arquivar e exclusão permanente | S2-01 |
| Barra de progresso + botão fechar (X) nos toasts com timeout | S2-01 |
| Feedback em criar/editar/import hábito | S2-01 |
| Import JSON sem delay artificial | S2-02 |
| Campo de horário renomeado para `time`, de fato opcional, card exibe `--:--` quando vazio | S2-02 |
| Preview do form sem hack `formPreviewVersion` | S2-03 |
| Modal não descarta formulário sujo sem confirmação | S2-04 |
| Focus trap e retorno de foco nos modais | S2-05 |
| `aria-live` ao marcar hábito + progressbar semântica | S2-05 |
| Dados de hábitos persistidos em IndexedDB; app não lê mais a chave `wrs-habit-builder` do localStorage | S2-06 |
| Roundtrip export JSON → import restaura dados perfeitamente no IndexedDB | S2-06 |
| `npm test` + `npm run lint` + CI verdes | todas |

---

# Tarefa 1 — Toast service + undo e feedbacks

## Título (Trello)

**Toast global com undo (arquivar e excluir), barra de progresso e fechar rápido**

## Contexto

Hoje arquivar remove o card sem confirmação nem desfazer; criar/editar/excluir fecham o modal sem feedback. O doc 02 prioriza isso como alto ROI e pré-requisito de confiança antes do alfa.

`archiveHabit` / `restoreHabit` e `permanentlyDeleteHabit` já existem em `habit-storage.service.ts` — falta a camada de UX e o padrão visual do toast (tempo restante visível + dispensar sem esperar).

**Exclusão permanente com undo:** após confirmar no modal, a exclusão efetiva no storage deve ser **adiada** até o fim da janela de undo (ou até o usuário fechar o toast com X). Se clicar em Desfazer dentro do prazo, nada é apagado. Implementação sugerida: enfileirar delete pendente no service ou snapshot temporário do hábito + completions + freezes até commit.

## Escopo IN

### Componente e service

- [ ] `ToastService` singleton (signal ou Subject) + componente `app-toast` no root
- [ ] API do toast: `message`, ação opcional `Desfazer`, `durationMs` (~5–8s para undo), tipo (`success` | `undo`)
- [ ] **Barra de progresso na borda superior** do toast: preenchimento decrescente (100% → 0%) sincronizado com o tempo até sumir — feedback visual do tempo restante para desfazer
- [ ] **Botão X** no canto do toast: fecha imediatamente; se for toast com undo e o usuário não desfez, **confirma/commita** a ação pendente na hora (não obriga esperar o timer)
- [ ] Respeitar `prefers-reduced-motion` (barra pode ser estática ou pulsar uma vez, sem animação contínua agressiva)
- [ ] Posição fixa (bottom mobile / top desktop)
- [ ] `aria-live="polite"` no container; botão X com `aria-label="Fechar"`

### Integrações por ação

- [ ] **Arquivar:** toast "Hábito arquivado · Desfazer" → `restoreHabit(id)`; barra + X
- [ ] **Excluir permanente:** após confirmar no modal, toast "Hábito excluído · Desfazer" com janela de undo; só persiste `permanentlyDeleteHabit` ao expirar timer ou ao fechar com X; Desfazer cancela e restaura estado
- [ ] **Criar/editar hábito:** toast de sucesso ao fechar modal com save (sem undo; barra opcional curta ou só auto-dismiss ~3s + X)
- [ ] **Import JSON:** toast de sucesso com contagem (ex.: "6 hábitos e 128 conclusões importados") — integra com Tarefa 2; X para dispensar

## Escopo OUT

- ❌ Notificações push/PWA
- ❌ Taxa de adesão / métricas (Sprint 3)
- ❌ Undo de import JSON (operação em massa — só feedback de sucesso)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/services/toast.service.ts` | Criar |
| `src/app/shared/components/app-toast/app-toast.component.ts` | Criar |
| `src/app/shared/components/app-toast/app-toast.component.html` | Criar (barra topo + X + ações) |
| `src/app/app.ts` / `app.html` | Editar |
| `src/app/core/services/habit-storage.service.ts` | Editar (delete pendente / restore snapshot, se necessário) |
| `src/app/features/habits/pages/habits-page/habits-page.component.ts` | Editar |
| `src/app/shared/components/habit-form-modal/habit-form-modal.component.ts` | Editar |
| `src/app/shared/components/habit-delete-confirm-modal/...` | Editar |

## Critérios de aceite (Definition of Done)

1. Arquivar mostra toast com Desfazer funcional (hábito volta ao filtro Ativos)
2. Excluir permanente: após confirmar, hábito some da UI mas **pode ser restaurado** via Desfazer dentro da janela; após timer ou X sem desfazer, exclusão é definitiva no storage
3. Barra superior do toast reflete tempo restante de forma contínua e legível
4. Botão X fecha o toast na hora; em toasts de undo, equivale a encerrar a janela e commitar a ação
5. Criar, editar e import mostram confirmação breve com X para dispensar
6. Múltiplos toasts não quebram layout (fila ou substituição)
7. `npm test` + `npm run lint` verdes
8. Validação manual em mobile e desktop (touch no X e no Desfazer)

## Dependências

- **Bloqueia:** sensação de produto confiável no alfa
- **Paralelo:** Tarefas 3, 4, 5
- **Skills:** `habit-builder-ui`, `habit-builder-screens`, `habit-builder-localstorage` (se alterar fluxo de delete)

## Ordem de implementação

1. Service + componente toast (mensagem, barra de progresso, X, timer)
2. Integrar arquivar + undo
3. Integrar exclusão permanente com delete adiado + undo + testes no storage
4. Integrar form modal, delete confirm e import
5. A11y e polish visual (`prefers-reduced-motion`)

---

# Tarefa 2 — Limpezas restantes Sprint 1 (item 8) + rename do campo de horário

## Título (Trello)

**Renomear optionalReminder para time (opcional, card mantém --:--), remover import fake e corrigir asset**

## Contexto

A Sprint 1 deixou três itens do checklist 8 **parciais**. São dívidas pequenas mas alinhadas à tese do produto: import que simula trabalho mina confiança; `optionalReminder` obrigatório contradiz o nome e o domínio; asset com espaço no nome é risco de cache/encoding.

**Decisão (12/06):** em vez de só remover o `Validators.required`, o campo será **renomeado de `optionalReminder` para `time`** em todo o app (modelo, DTOs, form, normalizer, storage). Semântica: `time` é o horário do hábito, **opcional**; quando vazio, o card continua exibindo o placeholder `--:--` (comportamento já existente em `previewTimeOrPlaceholder` e `reminderDisplay`).

Como o campo é persistido no localStorage e aceito no import JSON, o rename exige **migração de schema (v8 → v9)** copiando `optionalReminder` → `time`, e o normalizer deve aceitar a chave legada em imports antigos.

## Escopo IN

- [ ] Remover `randomStepDelay` e etapas fictícias em `data-management-page.component.ts` — import imediato + toast de sucesso (Tarefa 1)
- [ ] **Renomear `optionalReminder` → `time`** em: `habit.model.ts`, `habit-weekday-goal.model.ts`, `create-habit.dto.ts`, `update-habit.dto.ts`, `habit-storage.service.ts`, `habit-normalizer.ts`, `habit-meta.utils.ts`, form modal (TS + HTML), preview, demo pool/mapper, factories e specs
- [ ] Campo `time` **sem `Validators.required`** no form (global e metas por dia) — hábito criável sem horário
- [ ] Card/preview/histórico exibem `--:--` quando `time` vazio (não regredir comportamento atual)
- [ ] Migração `migrate-v8-to-v9`: renomear chave nos hábitos e nos `weekdayGoals` persistidos + spec
- [ ] Normalizer de import JSON aceita `time` e a chave legada `optionalReminder` (fallback)
- [ ] Renomear `public/habit builder icon.png` (ou consolidar com `habit-builder-icon.png`) e atualizar referências
- [ ] Atualizar copy do lembrete (placeholder "Opcional")

## Escopo OUT

- ❌ Refactor completo do form em camadas (Sprint 4)
- ❌ IndexedDB (virou Tarefa 6 — fazer depois desta)
- ❌ Mudança visual no card além do placeholder `--:--` já existente

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/data/pages/data-management-page/data-management-page.component.ts` | Editar |
| `src/app/core/models/habit.model.ts` + `habit-weekday-goal.model.ts` + DTOs | Editar (rename) |
| `src/app/core/services/habit-storage.service.ts` | Editar (rename) |
| `src/app/core/utils/habit-normalizer.ts` | Editar (rename + fallback legado) |
| `src/app/core/utils/habit-meta.utils.ts` + `day-history.utils.ts` | Editar (rename) |
| `src/app/core/migrations/migrate-v8-to-v9.ts` (+ spec) | Criar |
| `src/app/shared/components/habit-form-modal/habit-form-modal.component.ts/.html` | Editar |
| `src/app/shared/components/habit-card-preview/...` | Editar (rename) |
| `public/habit builder icon.png` | Renomear/remover |
| `src/index.html` ou refs ao asset | Editar |

## Critérios de aceite (Definition of Done)

1. Import JSON conclui em &lt; 1s perceptível, sem delays artificiais
2. Nenhuma ocorrência de `optionalReminder` no código-fonte (exceto migração e fallback do normalizer)
3. Hábito criável sem preencher horário; card e preview exibem `--:--`
4. Dados v8 existentes migram para v9 sem perda (horários preservados)
5. Import de JSON antigo (com `optionalReminder`) continua funcionando
6. Nenhuma referência a arquivo com espaço no nome em `public/`
7. `npm test` + lint verdes

## Dependências

- **Depende de:** Tarefa 1 (toast no import)
- **Paralelo:** Tarefas 3, 4, 5
- **Skills:** `habit-builder-product`, `habit-builder-ui`, `habit-builder-localstorage` (migração de schema)

## Ordem de implementação

1. Rename `optionalReminder` → `time` (modelo → storage → form → preview) com testes guiando
2. Migração v8 → v9 + fallback no normalizer de import
3. Validação: campo opcional + placeholder `--:--` + copy "Opcional"
4. Import fake → fluxo direto + toast
5. Asset rename + grep refs

---

# Tarefa 3 — Form preview com `toSignal`

## Título (Trello)

**Substituir hack formPreviewVersion por toSignal(valueChanges)**

## Contexto

O `habit-form-modal` usa um signal-contador incrementado manualmente em vários pontos para alimentar o preview. O Angular oferece `toSignal(this.form.valueChanges)` — menos frágil e sem subscription solta. Dívida técnica da Sprint 1 (doc 01).

## Escopo IN

- [ ] Remover `formPreviewVersion` e increments manuais
- [ ] Usar `toSignal` + `computed` para `previewFormState`
- [ ] Garantir preview reativo em todos os campos (incl. FormArray triggers/motivations)

## Escopo OUT

- ❌ Refactor do form em camadas
- ❌ Extrair mais subcomponentes

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/shared/components/habit-form-modal/habit-form-modal.component.ts` | Editar |

## Critérios de aceite (Definition of Done)

1. Preview do card no modal atualiza em tempo real sem contador hack
2. Sem memory leak (`takeUntilDestroyed` / `toSignal` com cleanup)
3. Comportamento idêntico ao anterior (smoke manual criar + editar)
4. `npm test` verde

## Dependências

- **Paralelo:** Tarefas 1, 2, 4, 5
- **Skills:** refactor técnico

---

# Tarefa 4 — Confirmar descarte ao fechar modal

## Título (Trello)

**Interceptar fechamento do formulário com alterações não salvas**

## Contexto

Clicar no backdrop ou fechar o modal de criar/editar hábito **descarta tudo sem confirmação** (`onBackdropClick` → `close()` → `resetForm()`). O doc 02 item 5 classifica isso como risco real de perda de dados e atrito em mobile.

`Esc` já fecha alguns modais, mas o form modal precisa distinguir fechamento intencional com form limpo vs. sujo.

## Escopo IN

- [ ] Detectar formulário "sujo" (`form.dirty` ou comparação com estado inicial)
- [ ] Ao fechar via backdrop, botão X ou `Esc`: se sujo, exibir confirmação "Descartar alterações?"
- [ ] Se confirmar: `resetForm()` + fechar; se cancelar: manter modal aberto
- [ ] Fechamento após save bem-sucedido não exige confirmação
- [ ] Mesmo padrão aplicável ao modal de edição (reutilizar lógica)

## Escopo OUT

- ❌ Promover create/edit para rotas dedicadas (Sprint 4+)
- ❌ Interceptar botão voltar do navegador (complexidade extra — documentar como melhoria futura)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/shared/components/habit-form-modal/habit-form-modal.component.ts` | Editar |
| `src/app/shared/components/habit-form-modal/habit-form-modal.component.html` | Editar |
| `src/app/core/services/habit-form-modal.service.ts` | Editar (se centralizar close) |

## Critérios de aceite (Definition of Done)

1. Form com alterações não salvas não fecha sem confirmação explícita
2. Form intacto ou após save fecha normalmente
3. Copy em PT-BR, tom neutro ("Descartar alterações?" / "Continuar editando")
4. `npm test` + lint verdes
5. Smoke manual: criar hábito, preencher metade, clicar fora → confirmação aparece

## Dependências

- **Paralelo:** Tarefas 1, 3, 5
- **Skills:** `habit-builder-screens`, `habit-builder-product`

## Ordem de implementação

1. Flag/helper `isFormDirty` confiável (incl. FormArrays)
2. Interceptar `close()` e backdrop
3. Dialog de confirmação inline ou mini-modal
4. Smoke criar + editar

---

# Tarefa 5 — Focus trap nos modais + a11y na marcação

## Título (Trello)

**Focus trap nos modais e feedback acessível ao marcar hábitos**

## Contexto

Modais têm `Esc` em alguns casos, mas **sem focus trap**: o foco não entra no modal ao abrir nem volta ao elemento que abriu ao fechar (doc 02 item 13). Na tela Hoje, marcar hábito comunica só por cor/animação — leitores de tela não recebem feedback; a barra de progresso do dia pode faltar `role="progressbar"`.

## Escopo IN

- [ ] **Focus trap** em: `habit-form-modal`, `habit-delete-confirm-modal`, `day-history-modal`
- [ ] Ao abrir: mover foco para o primeiro elemento interativo do modal
- [ ] Ao fechar: restaurar foco no elemento que disparou a abertura
- [ ] Tab cicla apenas dentro do modal enquanto aberto
- [ ] **`day-progress`:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` descritivo
- [ ] **Marcar hábito em Hoje:** região `aria-live="polite"` anunciando conclusão (ex.: "Leitura marcada, 3 de 5 concluídos")
- [ ] Respeitar `prefers-reduced-motion` (já existente — não regredir)

## Escopo OUT

- ❌ Focus trap em dropdowns de nav (fora dos modais)
- ❌ Refactor completo de marquee/gatilhos (Sprint 4)
- ❌ Auditoria WCAG completa do app

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/shared/components/habit-form-modal/...` | Editar |
| `src/app/shared/components/habit-delete-confirm-modal/...` | Editar |
| `src/app/features/historico/components/day-history-modal/...` | Editar |
| `src/app/features/today/components/day-progress/day-progress.component.ts` | Editar |
| `src/app/features/today/pages/today-page/today-page.component.ts` | Editar |
| `src/app/core/utils/` ou directive compartilhada | Criar (focus trap reutilizável, opcional) |

## Critérios de aceite (Definition of Done)

1. Tab não escapa do modal enquanto aberto (teste manual nos 3 modais)
2. Foco retorna ao botão/link que abriu o modal ao fechar
3. Barra de progresso exposta corretamente para leitor de tela
4. Marcar/desmarcar hábito gera anúncio em `aria-live`
5. `npm test` + lint verdes

## Dependências

- **Paralelo:** Tarefas 1–4
- **Complementa:** Tarefa 4 (ambas melhoram modais)
- **Skills:** `habit-builder-ui`, `habit-builder-screens`

## Ordem de implementação

1. `day-progress` semântica (rápido, isolado)
2. `aria-live` na Today ao toggle completion
3. Focus trap no delete confirm (menor)
4. Focus trap no form modal e day-history
5. Teste manual com teclado apenas

---

# Tarefa 6 — Trocar localStorage por IndexedDB

## Título (Trello)

**Migrar persistência de hábitos do localStorage para IndexedDB**

## Contexto

Toda a persistência de hábitos vive hoje na chave única `wrs-habit-builder` do localStorage (`app-storage.model.ts`), lida e gravada de forma **síncrona** pelo `habit-storage.service.ts` (load no construtor, persist a cada mutação). localStorage tem limite de ~5MB, serialização síncrona na main thread e risco de `QuotaExceededError` conforme completions/histórico crescem. IndexedDB remove esses limites e prepara o terreno para PWA/offline (roadmap).

**Decisão de migração de dados (12/06): NÃO haverá migração automática** localStorage → IndexedDB. O fluxo combinado é manual, usando o export/import que já existe em `/data`:

1. Antes de atualizar, o usuário **exporta o JSON** com os dados atuais
2. Após a tarefa, o app lê **somente IndexedDB** — a listagem virá vazia (a chave antiga do localStorage é ignorada)
3. O usuário **importa o JSON** e os dados voltam perfeitamente, agora persistidos no IndexedDB

Esse roundtrip export → import é o critério central de aceite da tarefa. O formato do JSON exportado **não muda**.

**Atenção à natureza assíncrona:** IndexedDB é async; o service hoje assume load síncrono no construtor. Sugestão: inicializar via `provideAppInitializer` (app espera o load antes de renderizar) ou expor um signal `ready` — decidir na implementação a opção com menor impacto nos componentes.

**Implementação sugerida (menor risco):** manter o documento `AppStorage` versionado como registro único em um object store (swap 1:1 do backend de persistência) — assim `migrate-storage.ts` e todas as migrações v5→v9 continuam funcionando sem alteração, inclusive no import de JSONs antigos. Abstrair leitura/escrita atrás de uma interface (`StorageBackend` ou similar) para os testes usarem fake em memória. Avaliar lib `idb` (wrapper promise-based minimalista) vs. IndexedDB cru.

## Escopo IN

- [ ] Backend IndexedDB: database `wrs-habit-builder`, object store com o documento `AppStorage` versionado
- [ ] `habit-storage.service.ts` lê/grava via IndexedDB; **remover leitura/escrita da chave `wrs-habit-builder` do localStorage**
- [ ] Bootstrap async (`provideAppInitializer` ou signal `ready`) sem flash de estado vazio na Today/Habits
- [ ] Import JSON em `/data` grava no IndexedDB e restaura hábitos, completions e freezes integralmente (incl. JSONs de versões antigas, via normalizer/migrações)
- [ ] Export JSON continua gerando o mesmo formato atual
- [ ] Tratamento de erros: IndexedDB indisponível/bloqueado → mensagem clara (toast da Tarefa 1); manter guard SSR
- [ ] Testes: fake do backend em memória + roundtrip export/import + migrações sobre IndexedDB
- [ ] Atualizar skill `habit-builder-localstorage` (premissa "sem IndexedDB no MVP" deixa de valer)

## Escopo OUT

- ❌ Migração automática de dados localStorage → IndexedDB (fluxo manual via export/import, decisão acima)
- ❌ Mover `theme` e `accent` (chaves `wrs-habit-builder-theme` / `-accent`) — preferências leves ficam no localStorage
- ❌ Quebrar `AppStorage` em múltiplos object stores normalizados (otimização futura, se necessário)
- ❌ PWA/offline sync

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/services/indexed-db.service.ts` (ou `storage-backend.ts`) | Criar |
| `src/app/core/services/habit-storage.service.ts` | Editar (load/persist async via backend) |
| `src/app/core/models/app-storage.model.ts` | Editar (constantes do DB, se necessário) |
| `src/app/app.config.ts` | Editar (`provideAppInitializer`) |
| `src/app/features/data/pages/data-management-page/data-management-page.component.ts` | Editar (import/export sobre o novo backend) |
| `src/app/core/services/habit-storage.service.spec.ts` | Editar (fake IndexedDB em memória) |
| `.cursor/skills/habit-builder-localstorage/SKILL.md` | Editar |

## Critérios de aceite (Definition of Done)

1. App funciona 100% lendo/gravando apenas IndexedDB; nenhuma leitura/escrita da chave `wrs-habit-builder` no localStorage
2. Com localStorage antigo presente, a listagem inicia vazia (chave ignorada, não apagada)
3. **Roundtrip completo:** export do JSON atual antes da troca → import depois → hábitos, completions, freezes e horários idênticos, persistidos no IndexedDB
4. Dados sobrevivem a reload e a fechar/reabrir o navegador
5. Sem flash de estado vazio no boot (load async aguardado)
6. Import de JSON de versão antiga continua migrando corretamente (v5→v9)
7. `npm test` + `npm run lint` verdes
8. Validação manual: criar/editar/arquivar/excluir/marcar hábito e conferir persistência via DevTools → Application → IndexedDB

## Dependências

- **Depende de:** Tarefa 1 (toast para feedback de import/erros) e Tarefa 2 (import sem delay fake + rename `time` já aplicado ao schema)
- **Bloqueia:** PWA/offline (roadmap pós-alfa)
- **Skills:** `habit-builder-localstorage` (será atualizada), `habit-builder-product`

## Ordem de implementação

1. Interface `StorageBackend` + implementação IndexedDB + fake em memória para testes
2. `habit-storage.service.ts` async (load via initializer, persist no backend)
3. Remover acesso ao localStorage da chave de dados; validar boot sem flash
4. Import/export contra o novo backend + testes de roundtrip
5. Validação manual do fluxo combinado: export → listagem vazia → import → dados restaurados
6. Atualizar skill `habit-builder-localstorage`

---

# Próxima sprint — Sprint 3 (preview)

> Tema: **Tela de métricas do hábito** (`/habits/:id`) — heatmap, streak, freeze e **taxa de adesão 7d/30d implementadas juntas** nesta tela (não antecipadas na Sprint 2).

| ID | Tarefa | Descrição (1 frase) |
|----|--------|---------------------|
| S3-01 | Tela de métricas (`/habits/:id`) | Criar rota e página com heatmap individual, streak atual/recorde/total, adesão 7d/30d (cálculo + exibição progressiva) e inventário de freeze no mesmo entregável. |
| S3-02 | Utils de adesão | Implementar `habit-adherence.utils.ts` e specs como parte da tela de métricas, não como passo separado anterior. |
| S3-03 | Navegação lista → métricas | Permitir abrir a tela de métricas ao tocar no card da lista `/habits` (chevron ou área clicável). |
| S3-04 | Escudo no heatmap | Renderizar ícone de escudo nos dias protegidos por freeze, sem fingir conclusão. |
| S3-05 | Resumo no Histórico | Adicionar bloco de resumo com visão agregada de progresso na tela `/historico` (pode usar adesão quando a tela de métricas existir). |
| S3-06 | Chip de adesão na lista | Mostrar indicador resumido de adesão nos cards de `/habits` (opcional se couber escopo; senão empurrar para Sprint 4). |

**Fora de escopo Sprint 3:** PWA, rotas full-screen create/edit, notificações, monetização, nome oficial/marca.

**Pendência pré-alfa (não é sprint de dev):** decisão de nome oficial do produto — última etapa antes de abrir o alfa ao público.
