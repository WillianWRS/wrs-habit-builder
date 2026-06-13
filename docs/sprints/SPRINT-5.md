# Sprint 5 — Beta fechado + fechamento do Alfa

> Projeto: **WRS Habit Builder**  
> Marco: **Beta (5/6)** · Sprint anterior: **Sprint 4 (concluída)** · Capacidade real: ~1–2 semanas dev solo  
> Objetivo: fechar o alfa técnico/produto e preparar beta fechado com landing, privacidade, feedback estruturado e base de lançamento.  
> **Status: CONCLUÍDA COM PENDÊNCIAS OPERACIONAIS** (13/06/2026) · `npm run lint` ✅ · `npm test` ✅ (`101` testes)

---

## Verificação executada (protocolo PO)

| Checagem | Evidência |
|----------|-----------|
| Rotas reais x prometidas | `app.routes.ts` com `/`, `/today`, `/habits/new`, `/habits/:id/edit`, `/habits/:id`, `/habits`, `/progress`, `/settings` |
| Qualidade técnica | `npm run lint` verde; `npm test` verde com 23 arquivos e 101 testes |
| Histórico de entrega | `git log --oneline -15` confirma sequência S2 → S5 (`ae08758` "feat: sprint 4 polish") |
| Estado de branch | `git status` limpo (master sincronizada com origin) |
| Backlog de referência | S5 marcada como concluída no backlog; pendências migradas para lançamento |

---

## Fechamento da Sprint 5

| ID | Entrega | Status | Evidência |
|----|---------|--------|-----------|
| S5-00 | Tema claro/escuro | DONE | Fluxo em Configurações + componentes já ajustados |
| S5-01 | PWA instalável | DONE | `@angular/service-worker`, `ngsw-config.json`, `manifest.webmanifest`, `provideServiceWorker` |
| S5-02 | Form em camadas + templates | DONE | `habit-template-picker`, templates e fluxo `/habits/new` |
| S5-03 | Landing pública | DONE | `/` aponta para `LandingPageComponent` |
| S5-04 | Política de privacidade | DONE | `/privacy` + links de navegação |
| S5-05 | Kit de beta fechado | PARTIAL | Checklist e painel entregues; URL do form ainda placeholder |
| S5-06 | Lacunas S4 + polish | DONE | navegação lista→detalhe, labels progressivos, specs da trilha |
| S5-07 | Modo demo dev-only | DONE | comportamento protegido por `isDevMode()` e doc formal |

---

## Definition of Beta — status final

| Critério de saída Beta | Situação |
|------------------------|----------|
| Alfa completo (core + estabilidade) | ✅ |
| Landing publicada | ✅ |
| Política de privacidade publicada | ✅ |
| Canal de feedback estruturado | ⚠️ Parcial (falta URL final do Google Form) |
| Smoke manual para 20 testers | ⚠️ Parcial (checklist existe, execução completa entra em S6) |
| Base técnica confiável (lint + testes) | ✅ |

---

## Pendências reais que sobram para o lançamento

1. **Formulário beta ainda com URL de exemplo**  
   `src/app/core/constants/beta-feedback.constants.ts` mantém `...1FAIpQLSexample...` e precisa do link real antes da rodada com testers.

2. **Documentação pública desatualizada para o estado atual do produto**  
   `README.md` ainda descreve localStorage, modal create/edit e reset de streak legado; hoje o app usa IndexedDB, páginas dedicadas e regras novas.

3. **Checklist beta ainda não executado como gate formal de release**  
   `docs/BETA-CHECKLIST.md` está pronto, mas a evidência operacional (rodada completa mobile/desktop + registro de bugs) fica para a Sprint 6.

---

## Riscos ativos herdados para S6

| Risco | Impacto | Mitigação na próxima sprint |
|-------|---------|-----------------------------|
| Entrar em beta sem link real de feedback | Perda de insumo de produto | S6-01 (ativar form real + QA do funil de feedback) |
| Lançar com docs divergentes do app | Suporte/confiança comprometidos | S6-02 (README + release notes + política de dados) |
| "Soft launch" sem regressão guiada | Regressões visíveis em produção | S6-03/S6-04 (smoke P0 + regressão pré e pós deploy) |

---

## Saída PO da Sprint 5

Sprint 5 fecha o **beta de produto** e deixa o projeto pronto para a fase de **lançamento operacional**.  
O próximo passo recomendado é executar a Sprint 6 focada em qualidade de release, documentação pública e distribuição controlada.

---

## Referências

- `docs/BETA-CHECKLIST.md`
- `docs/DEMO-MODE.md`
- `docs/sprints/SPRINT-4.md`
- `src/app/app.routes.ts`
- `src/app/core/constants/beta-feedback.constants.ts`
