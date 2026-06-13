# Sprint 6 — Demo instalável com features de apresentação

> Projeto: **WRS Habit Builder**  
> Marco: **Pré-lançamento (vitrine funcional mobile)** · Sprint anterior: **Sprint 5**  
> Capacidade: ~1 semana dev solo  
> Objetivo: entregar build instalável no **Android + Chrome** com as features de impacto para apresentação: notificação local, layer de foto, nota diária, resumo semanal e swipe para marcar/desmarcar.

---

## Decisões fechadas (com base nas respostas)

### S6-01 — PWA
- Alvo de instalação: **somente Android + Chrome**.
- Offline avançado: **fora de foco** (manter como está).
- Nome/ícone do manifest: manter **Habit Builder** por enquanto.

### S6-02 — Notificação local
- Só gera para hábitos com campo `time` preenchido.
- Disparo: **1 hora antes** do horário do hábito.
- Só notificar hábitos que estão esperados na tela Hoje (dia válido em `scheduleDays`).
- Ao tocar na notificação: abrir `/today`.
- Se permissão negada: mostrar toast com ícone de sino orientando reativação.

### S6-03 — Nota diária
- Limite da nota: **140 caracteres**.
- Nota permitida em dia concluído **e** dia não concluído.
- Nota entra no export/import JSON já nesta sprint.
- Edição livre no mesmo dia, sem histórico de versão.

### S6-04 — Swipe mobile
- `Swipe left` marca como concluído.
- `Swipe right` desmarca.
- Threshold: **30%** do card.
- Sem haptic e sem toast para manter fluidez.
- Desktop continua com interação por botão (sem swipe com mouse).

### S6-05 — Layer de foto
- Entrada de imagem: galeria + câmera (quando disponível).
- Formato padrão: **JPEG** (padrão de mercado para compartilhamento).
- Free: rótulo do app obrigatório no layer.
- Overlay inicial (3 linhas):
  1. nome do hábito
  2. meta geral ou meta mínima (se existir)
  3. streak atual
- Armazenamento: somente no dispositivo nesta sprint (sem nuvem).

### S6-06 — Resumo semanal
- Padrão adotado: **últimos 7 dias (rolling)**, comum em apps de hábito.
- Métricas mínimas:
  - melhor dia da semana
  - pior dia da semana
  - hábito de maior adesão
  - hábito de menor adesão
- Comparação com semana anterior fica para sprint seguinte.
- Empty state definido:
  - "Ainda sem dados suficientes desta semana."
  - "Conclua alguns hábitos e volte para ver seu resumo."

### S6-07 — Tema/cor premium-ready
- Cores free atuais: **verde** e **laranja**.
- Novas cores com badge premium (mas acessíveis por enquanto):
  - vermelho
  - azul
  - roxo
  - rosa
  - ciano
- Sem modal de "Conheça Premium" nesta sprint.

### S6-08 — UX/a11y (definido pelo PO técnico)
- Fluxos obrigatórios de smoke a11y:
  1. marcar/desmarcar por swipe e por botão
  2. criar/editar nota diária
  3. fluxo de foto (selecionar, gerar e salvar)
- Foco: contraste, labels, estados de foco e leitura por teclado nos fluxos novos.

### S6-09 / S6-10 — Avaliação
- Não haverá roteiro formal de demo nem checklist de apresentação como critério de aceite.
- Validação final será feita diretamente por avaliação manual do produto pronto.

---

## Definition of Done da Sprint 6

1. App instalável no Android + Chrome sem regressão de fluxo principal.
2. Notificação local 1h antes funciona para hábitos elegíveis de Hoje.
3. Notas diárias (até 140 chars) funcionam para dias concluídos e não concluídos.
4. Swipe left/right funciona no mobile com threshold de 30%.
5. Layer de foto gera e salva imagem JPEG com overlay definido.
6. Progresso exibe resumo dos últimos 7 dias com as 4 métricas acordadas.
7. Novas cores aparecem com badge premium (sem bloqueio real ainda).
8. `npm run lint` e `npm test` verdes após integração final.

---

## Backlog da Sprint (10 tarefas)

| # | ID | Título | Prioridade | Esforço | Dependência |
|---|----|--------|------------|---------|-------------|
| 1 | S6-01 | Hardening PWA instalável (Android + Chrome) | P0 | S | Sprint 5 |
| 2 | S6-02 | Notificação local 1h antes para hábitos elegíveis | P0 | M | S6-01 |
| 3 | S6-03 | Nota diária (concluído/não concluído) com limite 140 | P0 | M | S6-01 |
| 4 | S6-04 | Swipe left/right no mobile com threshold 30% | P0 | M | S6-01 |
| 5 | S6-05 | Layer de foto com câmera/galeria e export JPEG | P0 | L | S6-01 |
| 6 | S6-06 | Resumo semanal rolling 7 dias no Progresso | P0 | M | S6-03 |
| 7 | S6-07 | Novas cores com badge premium (sem bloqueio) | P1 | S | S6-05 |
| 8 | S6-08 | Polimento UX/a11y das novas interações | P1 | S | S6-02..S6-06 |
| 9 | S6-09 | Cobertura de testes das novas features | P0 | M | S6-02..S6-08 |
| 10 | S6-10 | QA final integrado e ajustes rápidos de estabilidade | P0 | M | S6-09 |

---

## Cards de execução (formato Trello)

### S6-01 — Hardening PWA instalável (Android + Chrome)
**Contexto:** garantir base estável para apresentação mobile instalada.  
**Escopo IN:** manifest, service worker e fluxo de instalação Android/Chrome.  
**Escopo OUT:** suporte iOS/Safari nesta sprint.  
**Arquivos prováveis:** `angular.json`, `ngsw-config.json`, `public/manifest.webmanifest`, `src/app/app.config.ts`.  
**DoD:** app instala e abre corretamente em Android + Chrome.

### S6-02 — Notificação local 1h antes
**Contexto:** lembrete preditivo sem complexidade de IA.  
**Escopo IN:** agenda local por hábito com `time`; disparo 1h antes; abertura em `/today`; toast para permissão negada.  
**Escopo OUT:** notificações para hábitos fora de Hoje.  
**Arquivos prováveis:** `src/app/core/services/*notification*`, `shared/habit-form`, `features/settings`.  
**DoD:** lembrete dispara corretamente em cenário real de teste.

### S6-03 — Nota diária
**Contexto:** registrar contexto da execução/falta.  
**Escopo IN:** CRUD de nota diária (até 140 chars) para dia concluído e não concluído; persistência e import/export.  
**Escopo OUT:** histórico de versões e anexos nas notas.  
**Arquivos prováveis:** `core/models`, `core/services/habit-storage.service.ts`, `features/today`, `features/progress/day-history-modal`.  
**DoD:** nota persiste, edita e reaparece após reload/import.

### S6-04 — Swipe left/right no mobile
**Contexto:** reduzir fricção da ação principal.  
**Escopo IN:** swipe left=marcar, swipe right=desmarcar, threshold 30%, sem toast/haptic.  
**Escopo OUT:** gesto no desktop.  
**Arquivos prováveis:** `features/today/components/*`, util de gesture em `core/utils` ou diretiva shared.  
**DoD:** gesto funcional sem conflito crítico com scroll vertical.

### S6-05 — Layer de foto
**Contexto:** feature de impacto visual para apresentação e compartilhamento.  
**Escopo IN:** capturar por câmera/galeria, aplicar overlay com 3 linhas (nome do hábito; meta geral ou meta mínima se existir; streak atual) + rótulo app, export JPEG para dispositivo.  
**Escopo OUT:** nuvem, editor avançado e pacotes premium completos.  
**Arquivos prováveis:** `src/app/features/share-photo/*`, util de canvas em `core/utils`.  
**DoD:** imagem final é gerada e salva com qualidade consistente.

### S6-06 — Resumo semanal (rolling 7 dias)
**Contexto:** leitura rápida de desempenho recente, padrão comum de mercado.  
**Escopo IN:** melhor dia, pior dia, hábito maior adesão, hábito menor adesão + empty state definido.  
**Escopo OUT:** comparação semana anterior.  
**Arquivos prováveis:** `features/progress/pages/progress-page.component.ts`, `core/utils/*adherence*`.  
**DoD:** resumo renderiza corretamente em semana cheia, parcial e vazia.

### S6-07 — Cores premium-ready (sem bloqueio)
**Contexto:** preparar estratégia premium sem travar uso agora.  
**Escopo IN:** adicionar 5 novas cores (vermelho, azul, roxo, rosa, ciano) com badge premium, mantendo acesso liberado.  
**Escopo OUT:** paywall e bloqueio real por assinatura.  
**Arquivos prováveis:** `core/constants/theme.constants.ts`, `core/services/theme.service.ts`, `features/settings`.  
**DoD:** cores novas aparecem e aplicam tema sem quebrar persistência.

### S6-08 — Polimento UX/a11y
**Contexto:** garantir usabilidade dos fluxos novos.  
**Escopo IN:** contraste, labels, foco, navegação por teclado e feedback visual dos fluxos definidos.  
**Escopo OUT:** auditoria WCAG completa de todo o app legado.  
**Arquivos prováveis:** componentes e páginas criados/alterados nesta sprint.  
**DoD:** smoke a11y dos 3 fluxos obrigatórios sem bloqueador.

### S6-09 — Cobertura de testes das novas features
**Contexto:** pedido explícito de cobertura total das mudanças da sprint.  
**Escopo IN:** specs unitários dos utilitários e comportamento crítico de cada feature nova.  
**Escopo OUT:** E2E completo cross-browser.  
**Arquivos prováveis:** `src/app/**/*.spec.ts`.  
**DoD:** novas features com cobertura de comportamento principal + suite verde.

### S6-10 — QA final integrado
**Contexto:** validação final prática antes da sua avaliação manual.  
**Escopo IN:** rodada integrada das 6 features novas no app instalado + correções rápidas de estabilidade.  
**Escopo OUT:** checklist formal de apresentação e plano B documentado.  
**Arquivos prováveis:** correções pontuais em `src/app/**` + atualização desta sprint.  
**DoD:** build pronta para sua avaliação direta do produto.

---

## Escopo OUT da Sprint 6

- Assinatura real, entitlements ativos e bloqueio premium por backend.
- Login Google + backup em nuvem.
- Heatmap/session replay e telemetria avançada.
- Comparativo entre semanas no resumo.

---

## Prévia da Sprint 7 (proposta)

1. Login Google + backup em nuvem por usuário.
2. Assinatura e entitlements em backend Java.
3. Bloqueio real das features premium.
4. Evolução do layer de foto para editor premium.
5. Instrumentação de analytics/observabilidade.

---

## Referências

- `docs/sprints/SPRINT-5.md`
- `docs/02-AVALIACAO-UI-UX.md`
- `docs/03-ARQUITETURA-E-ROADMAP.md`
- `docs/07-REGRAS-STREAK-E-FREEZE.md`
- Skills: `habit-builder-product`, `habit-builder-screens`, `habit-builder-ui`
