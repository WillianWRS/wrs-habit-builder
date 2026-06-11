# Arquitetura e Roadmap — WRS Habit Builder

> Visão de arquiteto de software: estado atual da arquitetura, decisões a tomar, próximos passos técnicos e features que o produto comporta. Data da análise: junho/2026.

---

## 1. Fotografia da arquitetura atual

```
Angular 21 (standalone + signals) · Tailwind 4 · SSR/prerender (Express) · Firebase Hosting
└── src/app/
    ├── core/        # modelos, serviços singleton (storage, dia atual, temas, demo), utils puros
    ├── features/    # today · habits · historico · data (lazy-loaded por rota)
    └── shared/      # nav, modais, selects, preview
Persistência: localStorage (chave única "wrs-habit-builder", schema versionado)
Estado: signals no HabitStorageService → computed views (todayHabitCards, habitListCards)
```

**Pontos fortes estruturais:**

- Camadas bem separadas; componentes não tocam storage diretamente.
- Lógica de negócio em funções puras (`core/utils`) — barata de testar e de portar.
- Estado reativo unidirecional: mutação → signal → computed → UI.
- `CurrentDayService` centraliza a noção de "hoje" (vital num domínio baseado em data).

**Dívidas estruturais (detalhadas no relatório 01):**

- Efeito colateral destrutivo dentro do storage (reset de streak apaga completions).
- Patch de dados hardcoded acoplado ao `load()`.
- Modelo de domínio achatado (`trigger1/2/3`) que multiplica código.
- Versionamento de schema declarado mas não implementado.
- Sem CI, sem lint, suíte de testes parcialmente quebrada.

---

## 2. Decisões arquiteturais a tomar agora

### D1. Completions como event log imutável (append-only)

A decisão mais importante. Tratar `HabitCompletion[]` como **fatos históricos imutáveis**:

- Nenhuma feature pode deletar completions (exceto exclusão permanente do hábito pelo usuário).
- Streak, adesão, recorde, heatmap = **projeções derivadas** (computed) sobre o log.
- "Zerar sequência" vira regra da função de cálculo (janela desde a última quebra), não mutação.

Benefícios: elimina a classe inteira de bugs de perda de dados, torna qualquer métrica futura (recordes, tendências, badges) computável retroativamente, e simplifica sync futuro (logs append-only sincronizam trivialmente).

### D2. SSR: manter ou simplificar?

O app é 100% client-side (localStorage, sem auth, sem dados no servidor). O SSR atual com Express:

- Renderiza sempre a casca vazia (o servidor não conhece os hábitos).
- Adiciona superfície de complexidade: `server.ts`, `main.server.ts`, guards `isPlatformBrowser` em todo serviço, hydration.

**Recomendação:** trocar SSR dinâmico por **prerender estático** (SSG) das 4 rotas — mantém SEO/first-paint e elimina o servidor Node. Firebase Hosting passa a servir arquivos puros. Menos código, deploy mais simples, mesmas vantagens práticas.

### D3. Camada de persistência atrás de interface

Hoje `HabitStorageService` mistura três responsabilidades: repositório (localStorage), regras de domínio (streak reset, normalização) e view-models (mapear cards). Antes de crescer, separar:

```
HabitRepository (porta)  ←  LocalStorageHabitRepository (adaptador atual)
        ↑                ←  IndexedDbHabitRepository (futuro)
HabitStore (signals + regras de domínio)
HabitViewModelService / mappers (cards por tela)
```

Isso destrava as evoluções de persistência (IndexedDB, sync remoto) sem reescrever o app.

### D4. Estratégia de migração de schema

Implementar o pipeline `migrate(raw)` real: `v1 → v2 → … → CURRENT`, cada passo puro e testado. Toda mudança de modelo (ex.: triggers como array) entra como nova versão. Remover o botão manual "Atualizar JSON".

---

## 3. Roadmap técnico (fundação)

### Fase 0 — Estancar riscos (1–2 dias)

| Item | Por quê |
|------|---------|
| Remover reset destrutivo (D1) | Perda de dados ativa em produção |
| Remover `COMPLETION_RESTORE_PATCH` | Dados pessoais no bundle, aplicado a todos os usuários |
| Consertar specs quebrados | `npm test` vermelho normaliza ignorar testes |
| `.gitignore` para `.firebase/` | Higiene de repositório |

### Fase 1 — Qualidade contínua (1 semana)

- **CI (GitHub Actions)**: lint + test + build em cada PR.
- **ESLint + angular-eslint** (o projeto só tem Prettier).
- **Testes do `HabitStorageService`**: toggle idempotente, archive preserva completions, migração, import/export roundtrip.
- **Refatorar componentes gigantes** (form modal 1.330 linhas, habit card 1.054, nav 518) em subcomponentes com template em arquivo próprio.
- **Migração v2 do modelo**: `triggers: string[]`, `motivations: string[]`, naming em inglês (`generalGoal`, `dynamicGoals`).

### Fase 2 — Plataforma de produto (2–4 semanas)

- **PWA**: manifest + service worker (`@angular/pwa`). O app já é offline-first por natureza — instalável no celular é o passo natural e barato. Pré-requisito para notificações.
- **IndexedDB** como storage primário (localStorage como fallback/migração): remove limite de ~5MB, acesso assíncrono, suporta histórico de anos e features de mídia (notas, fotos de progresso).
- **Camada de métricas** (`HabitMetricsService`): adesão 7/30d, streak atual/recorde, melhor dia da semana — tudo derivado do event log (D1). Alimenta detalhe do hábito, resumos e futuros insights.
- **Toast/notification service** global (pré-requisito de UX para undo e feedbacks).

---

## 4. Roadmap de features (produto)

Ordenadas por relação valor/custo e aderência à tese ("consistência > perfeição, falha sem culpa"):

### Horizonte 1 — completar o core prometido

1. **Detalhe do hábito** (`/habits/:id`): heatmap individual 30–66 dias, adesão 7/30d, streak atual + recorde, total de conclusões. *Os dados já existem; falta a projeção.*
2. **Adesão visível** nos cards e no Histórico (RF-08 do escopo original).
3. **Streak não-punitiva** (RN-07, RN-08): atual/recorde/total + freeze semanal automático (teto 1 free / 2 premium). Ver `docs/07-REGRAS-STREAK-E-FREEZE.md`.
4. **Undo de arquivar + toasts de feedback**.
5. **Templates de hábito** no onboarding/empty state.

### Horizonte 2 — engajamento e retenção

6. **Notificações locais** (PWA): lembrete no horário configurado por hábito — o campo de horário hoje é decorativo; isso o torna funcional. Opt-in, com copy gentil.
7. **Resumo semanal**: card de segunda-feira com adesão da semana anterior e destaque positivo.
8. **Modo férias** (futuro): pausa planejada de 1+ hábitos, até 3 semanas, ícone no heatmap, cooldown 7 dias ativos. Ver `docs/07-REGRAS-STREAK-E-FREEZE.md` §4.
9. **Notas por conclusão**: campo opcional de 1 linha ao marcar ("li 12 páginas") — transforma o log em diário leve; base para insights.
10. **Metas quantitativas opcionais**: hábito com alvo numérico (10 páginas, 20 min) e registro do valor — adesão parcial conta ("fiz a ação mínima").
11. **Widgets/atalhos**: shortcut PWA "marcar tudo de hoje", ações rápidas no ícone instalado.

### Horizonte 3 — expansão (exige decisões de plataforma)

11. **Sync multi-dispositivo**: o passo que exige backend. Caminho de menor atrito mantendo "sem auth obrigatório": sync opcional via Firebase (Anonymous Auth + Firestore), com merge baseado no event log append-only (D1 torna isso quase trivial — union de completions por id). localStorage continua como modo padrão.
12. **Insights/estatísticas**: tendências de adesão, correlação por dia da semana/categoria, "seu melhor horário".
13. **Compartilhamento social leve**: card-imagem de conquista ("66 dias de leitura") gerado client-side — marketing orgânico sem rede social embutida.
14. **i18n** (en-US) se o portfólio mirar audiência internacional — hoje copy hardcoded em PT-BR nos templates; extrair para `@angular/localize` ou dicionário próprio.

---

## 5. Riscos e mitigação

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Perda de dados do usuário (reset destrutivo ativo) | **Alta — já ocorreu** | Fase 0; backup automático silencioso (snapshot diário do JSON em IndexedDB com retenção de 7 dias) |
| localStorage apagado pelo navegador (limpeza de site data, modo anônimo) | Média | PWA + IndexedDB (storage persistente via `navigator.storage.persist()`); incentivo a export periódico; futuro sync opcional |
| Crescimento do bundle (CSS/animação inline gigantes) | Média | Budgets no `angular.json` + refator de componentes; auditar com `ng build --stats-json` |
| Evolução de schema quebrar dados antigos | Média | Pipeline de migração versionado + testes de migração com fixtures reais |
| Projeto de uma pessoa sem CI | Alta | Fase 1: CI mínimo evita regressões silenciosas |

---

## 6. Sequência recomendada (visão única)

```
Fase 0  ─ Estancar: reset destrutivo fora, patch fora, testes verdes
Fase 1  ─ Fundação: CI + lint + testes do storage + modelo v2 + componentes quebrados
Fase 2  ─ Plataforma: PWA + IndexedDB + métricas derivadas + toasts
H1      ─ Produto core: detalhe do hábito, adesão, streak gentil, undo, templates
H2      ─ Retenção: notificações, resumo semanal, notas, metas quantitativas
H3      ─ Expansão: sync opcional, insights, compartilhamento, i18n
```

A regra geral: **nenhuma feature do Horizonte 2+ antes da Fase 0/1** — o custo de construir sobre o modelo atual (campos numerados, storage com efeitos destrutivos, zero CI) cresce a cada feature adicionada.
