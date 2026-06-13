# Backlog de referência — PO WRS Habitua

> Ponto de partida para planejamento. **Recalcular a cada sprint** após protocolo de descoberta. Itens marcados `[S1]` = entregue na Sprint 1.

---

## Visão por marco

| Marco | Sprints | Objetivo de saída |
|-------|---------|-------------------|
| Fundação | 1 `[S1]` | Dados íntegros, CI verde, streak/freeze corretos |
| Alfa | 2, 3, 4, 5 | Core H1 + PWA + onboarding + beta prep entregues |
| Beta | 5 `[S5]` | ~20 testers, feedback estruturado, polish e landing |
| Lançamento | 6 | Soft launch web estável, 100% free, pronto para divulgação |

---

## Critérios de saída por fase

### Definition of Alpha (fim Sprint 4)

| Critério | Verificação |
|----------|-------------|
| Fluxo P0 completo | Criar hábito → marcar em Hoje → ver progresso → arquivar com undo |
| RF-07 parcial+ | Detalhe `/habits/:id` com heatmap individual e métricas |
| RF-08 | Adesão calculada e visível (lista e/ou detalhe; regra progressiva) |
| RF-09 | Streak atual/recorde/total + freeze `[S1]` |
| Feedback UX | Toasts em ações importantes; undo de arquivar |
| Onboarding | Templates ou form em camadas (barreira de entrada reduzida) |
| PWA básico | Instalável; cache da casca do app |
| Qualidade | `npm test` + `npm run lint` + build verdes no CI |
| Monetização | **Ausente** — app 100% free |

### Definition of Beta (fim Sprint 5)

| Critério | Verificação |
|----------|-------------|
| Alfa + polish | Focus trap modais, Esc consistente, copy revisada |
| Landing | Página mínima de marketing (doc 06 — dia 1, não "no sucesso") |
| Beta fechado | 20 convites; canal de feedback (formulário ou grupo) |
| Privacidade | Política de privacidade publicada |
| Smoke test | Checklist manual P0 passando em mobile + desktop |
| Reviews | Primeiras avaliações orgânicas (sem spam same-day) |

### Definition of Launch (fim Sprint 6)

| Critério | Verificação |
|----------|-------------|
| Deploy | Firebase Hosting estável; README atualizado |
| ASO web/loja prep | Screenshots, descrição, keywords PT-BR (se Play Store entrar) |
| Regressão | Fluxo completo testado pós-deploy |
| Timing | Preferência janela jan/2027 se alinhado (doc 06) |
| Monetização | Ainda **free**; paywall só pós-validação de retenção |

---

## Sprint 1 — CONCLUÍDA `[S1]`

| ID | Entrega | Status |
|----|---------|--------|
| S1-01 | Remover reset destrutivo; streak derivada | DONE |
| S1-02 | Freeze semanal automático (RN-08) | DONE |
| S1-03 | Remover COMPLETION_RESTORE_PATCH | DONE |
| S1-04 | Migração schema v5→v8 encadeada | DONE |
| S1-05 | Modelo v2 triggers/motivations arrays | DONE |
| S1-06 | CI (lint, test, build) + ESLint | DONE |
| S1-07 | Testes HabitStorageService + streak specs | DONE |
| S1-08 | Refactor form modal, habit card, nav | DONE |
| S1-09 | `.gitignore` .firebase/ | DONE |
| S1-10 | Limpezas item 8 (import fake, optionalReminder, asset) | PARTIAL |

---

## Sprint 2 — Métricas + feedback UX (sugestão)

**Tema:** desbloquear RF-08 (utils) e UX de confiança (toasts).

| ID | Tarefa | Prioridade | Esforço | Depende de |
|----|--------|------------|---------|------------|
| S2-01 | Utils adesão (`computeAdherence`, períodos 7/30, respeito `createdAt` + `scheduleDaySince`) + specs | P0 | M | S1 |
| S2-02 | Regra de exibição adesão progressiva (doc/decisão + helper `formatAdherenceLabel`) | P0 | S | S2-01 |
| S2-03 | Toast service global + undo arquivar + feedback criar/editar/excluir | P0 | M | — |
| S2-04 | Limpezas Sprint 1 item 8: remover import fake, `optionalReminder` opcional de fato, renomear asset | P1 | S | — |
| S2-05 | Substituir `formPreviewVersion` por `toSignal(form.valueChanges)` | P2 | S | — |

**Escopo OUT Sprint 2:** tela detalhe completa, PWA, IndexedDB, templates onboarding, monetização.

**Entregável doc:** `docs/SPRINT-2-TAREFA-01.md` (etc.) no formato Sprint 1.

---

## Sprint 3 — Core H1 (sugestão)

**Tema:** detalhe do hábito + adesão visível.

| ID | Tarefa | Prioridade | Esforço | Depende de |
|----|--------|------------|---------|------------|
| S3-01 | Rota `/habits/:id` + página detalhe (heatmap 30–66d, streak recorde/total, adesão 7d/30d adaptativa) | P0 | L | S2-01 |
| S3-02 | Inventário freeze no detalhe (estoque 1/1, histórico usos) | P1 | M | S1, S3-01 |
| S3-03 | Adesão na lista `/habits` (chip `71% · 7d` ou contagem progressiva) | P1 | M | S2-01, S2-02 |
| S3-04 | Resumo adesão na tela `/historico` | P1 | M | S2-01 |
| S3-05 | Ícone escudo no heatmap (dia protegido por freeze) | P1 | M | S3-01 |
| S3-06 | Navegação: card lista → detalhe (chevron) | P0 | S | S3-01 |

**Escopo OUT Sprint 3:** PWA, rotas full-screen create/edit, notificações.

---

## Sprint 4 — Detalhe + adesão — CONCLUÍDA `[S4]`

**Tema (doc sprint):** métricas por hábito na UI.

| ID | Entrega | Status |
|----|---------|--------|
| S4-01 | Utils adesão 7d/30d | DONE |
| S4-02 | Rota `/habits/:id` | DONE |
| S4-03 | Heatmap individual | DONE |
| S4-04 | Métricas no detalhe | DONE |
| S4-05 | Navegação lista → detalhe | DONE (S5-06: card clicável) |
| S4-06 | Chips adesão detalhe + progresso | DONE (S5-06: labels progressivos) |
| S4-07 | Testes fluxo detalhe | DONE (S5-06: specs componente) |

---

## Sprint 5 — Beta + fechamento Alfa — CONCLUÍDA `[S5]`

**Tema:** pronto para ~20 testers.

| ID | Entrega | Status |
|----|---------|--------|
| S5-00 | Tema claro/escuro | DONE |
| S5-01 | PWA instalável | DONE |
| S5-02 | Form camadas + 3 templates | DONE |
| S5-03 | Landing `/` | DONE |
| S5-04 | Política `/privacy` | DONE |
| S5-05 | BETA-CHECKLIST + feedback in-app | DONE |
| S5-06 | Lacunas S4 + polish | DONE |
| S5-07 | Demo dev-only | DONE |

**Pendência operacional:** atualizar `BETA_FEEDBACK_FORM_URL` com Google Form real antes dos convites.

---

## Sprint 4 (backlog legado — plataforma) — realocado para S5

Itens PWA/onboarding do backlog original foram entregues na Sprint 5 (numeração de produto divergiu do doc original S4 detalhe).

---

## Sprint 5 (backlog legado) — absorvido em S5 real

A11y parcial já existia (S2); landing/privacidade/beta kit entregues.

---

## Sprint 6 — Lançamento (sugestão)

**Tema:** soft launch web.

| ID | Tarefa | Prioridade | Esforço |
|----|--------|------------|---------|
| S6-01 | Deploy Firebase production checklist; smoke pós-deploy | P0 | S |
| S6-02 | README público (como usar, backup JSON, privacidade) | P0 | S |
| S6-03 | Screenshots e copy para ASO / Product Hunt / TabNews | P1 | M |
| S6-04 | Programa indicação v1 (código convite — doc 06 §4.2) | P2 | M |
| S6-05 | Regressão manual fluxo P0 completo (checklist) | P0 | S |
| S6-06 | Tag release v1.0.0 + notas | P0 | S |

---

## Backlog congelado (pós-launch / H2+)

Não entrar em Sprints 2–6 sem aprovação explícita do PO/usuário:

- Monetização / paywall / billing
- Sync Firebase / auth anônima
- Notificações locais (depende PWA maduro)
- IndexedDB + backup automático
- Modo férias (doc 07 §4)
- Resumo semanal, notas por conclusão, metas quantitativas
- Capacitor / Play Store / iOS
- i18n en-US
- Layer de foto compartilhável (doc 06 — ideal pré-launch jan, mas escopo extra)

---

## Requisitos funcionais — mapa de entrega

| RF | Descrição | Sprint alvo |
|----|-----------|-------------|
| RF-01 | CRUD hábito básico | `[S1]` parcial (modal) |
| RF-02 | Gatilho + ação mínima | `[S1]` |
| RF-03 | Listar hábitos do dia | `[S1]` |
| RF-04 | Marcar em 1 ação | `[S1]` |
| RF-05 | Desmarcar | `[S1]` |
| RF-06 | Editar e arquivar | `[S1]` |
| RF-07 | Detalhe heatmap 30–66d | `[S4]` |
| RF-08 | Adesão 7d/30d | `[S2]` utils + `[S4]`/`[S5]` UI |
| RF-09 | Streak + recorde + total + freeze | `[S1]` |

---

## Riscos a monitorar (PO)

| Risco | Sprint de mitigação |
|-------|---------------------|
| localStorage apagado pelo browser | Sprint 4+ (PWA persist) ou pós-alfa IndexedDB |
| Adesão mal comunicada no início | Sprint 2 (regra progressiva) |
| Formulário longo mata ativação | Sprint 4 (camadas + templates) |
| Docs desatualizados vs código | Toda sprint (protocolo descoberta) |
| Modo demo vs product skill | `[S5]` resolvido — ver `docs/DEMO-MODE.md` |

---

## Como atualizar este arquivo

Após cada sprint concluída:

1. Mover itens DONE para seção `[SN]` concluída
2. Ajustar sugestões das sprints seguintes com base em feedback
3. Atualizar baseline em `SKILL.md` se mudança estrutural grande
