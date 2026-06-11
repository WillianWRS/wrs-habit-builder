# Avaliação UI/UX — WRS Habit Builder

> Análise sob a ótica de um profissional de UI/UX: pontos conflitantes, atritos, riscos de usabilidade e sugestões de solução/inovação. Data da análise: junho/2026.

---

## Resumo executivo

O app tem uma identidade visual forte e coerente (dark theme, tipografia display Fraunces + Plus Jakarta Sans, accent configurável, animações refinadas com respeito a `prefers-reduced-motion`). O cuidado com microinterações — sweep de conclusão, FLIP na lista, níveis visuais de streak — está acima do que se vê em MVPs.

Os problemas estão menos na estética e mais na **psicologia do produto** (mecânica punitiva de reset contradiz o tom "sem culpa"), no **custo de criação de hábito** (formulário longo com campos obrigatórios demais) e em **padrões de navegação/feedback** inconsistentes.

---

## 🔴 Conflitos graves com a tese do produto

### 1. A mecânica de "7 faltas zeram tudo" contradiz o princípio "falha sem culpa"

A tese de design do produto é explícita: *consistência > perfeição*, *falha sem culpa*, copy neutra "Recomeçar amanhã no mesmo gatilho". Porém a experiência atual:

- Mostra no card: **"mais N faltas seguidas interrompem a sequência"** — uma contagem regressiva de ameaça, ansiogênica por definição.
- Ao atingir 7 faltas, **apaga todo o histórico** do hábito (o contador "dia N" volta a zero e o heatmap esvazia).
- O usuário que volta de uma viagem é recebido com a maior punição possível: a evidência de meses de esforço sumiu. Esse é o momento exato em que apps de hábito perdem usuários (efeito "what-the-hell": quebrou, desisto).

**Solução recomendada:**

- Streak pausada ≠ histórico apagado. Exibir "Sequência atual: 0 · Recorde: 47 · Total: 132 dias". O recorde e o total nunca regridem — são as métricas que sustentam motivação de longo prazo.
- Trocar a contagem regressiva de ameaça por convite de retomada: *"Sentimos sua falta. Recomece hoje no mesmo gatilho."*
- **Proteção de sequência (oficializada — RN-08):** freeze automático 1/semana/hábito, teto 1 (free) / 2 (premium); ícone de escudo no heatmap; sem inventário de escudos no card Hoje. Spec: `docs/07-REGRAS-STREAK-E-FREEZE.md`.

### 2. Taxa de adesão — a métrica principal do produto — não existe na UI

O requisito RF-08 define adesão 7d/30d (dias concluídos ÷ dias esperados) como métrica central, justamente por ser mais gentil e informativa que streak. Hoje o app mostra apenas "dia N" (contagem bruta de conclusões) e o heatmap mensal. Não há nenhum lugar onde o usuário veja *"você cumpriu 85% dos dias planejados este mês"*.

**Solução:** chip de adesão no card do hábito (`85% · 30d`) e/ou um bloco de resumo na tela Histórico. É a métrica que melhor conta a história de "consistência > perfeição".

### 3. Não há tela de detalhe do hábito

O fluxo previsto (`/habits/:id` com heatmap individual, adesão, streak) não existe. Consequências:

- O heatmap do Histórico é **agregado** de todos os hábitos — o usuário não consegue responder "como estou indo na leitura?".
- Toda a riqueza de dados coletados (completions por hábito) fica invisível.

**Solução:** tela ou modal de detalhe por hábito: heatmap individual de 30–66 dias, adesão 7d/30d, recorde, melhor dia da semana. Clicar no card de "Meus hábitos" deveria levar para isso (hoje só há editar/arquivar).

---

## 🟠 Atritos de usabilidade

### 4. O formulário de criação cobra demais para começar

Para criar o primeiro hábito o usuário precisa preencher **nome + categoria + gatilho + recompensa + ação mínima + horário**, todos obrigatórios (até o "lembrete opcional" é obrigatório). Isso conflita com:

- O princípio de Fogg que o produto defende (reduzir barreira de entrada).
- O empty state que convida "Construa hábitos agora" — e na sequência apresenta um modal de 6+ campos com pré-visualização, metas dinâmicas por dia, slots de gatilho…

O custo de abandono no primeiro uso é alto: cada campo obrigatório extra reduz a taxa de conclusão do funil.

**Soluções:**

- **Criação em camadas**: obrigatórios apenas nome + dias. Gatilho, recompensa, meta, horário viram seção "Refinar (opcional)" colapsada — ou um fluxo de 2 passos ("crie rápido, refine depois").
- Tornar o horário de fato opcional (a ordenação já trata vazio).
- **Inovação**: templates de partida ("Leitura — Se café, então 1 página", "Caminhada — Se almoço, então 10 min"). Um toque preenche tudo; o usuário só ajusta. Resolve também a "síndrome da página em branco" do empty state.

### 5. Modal único para criar/editar em vez de rotas

Criar/editar não tem URL (`/habits/new`, `/habits/:id/edit` não existem; tudo acontece num modal global montado no `app-root`):

- Não dá para compartilhar/recarregar/voltar — o botão "voltar" do navegador fecha a página, não o modal (em mobile isso é um padrão muito sentido; usuários esperam que back feche o modal).
- Um modal com scroll interno longo (o form é grande) é exatamente o caso em que página dedicada funciona melhor em mobile.
- Risco de perda de dados: clique acidental no backdrop fecha o modal e **descarta tudo sem confirmação** (`onBackdropClick` → `close()` → `resetForm()`).

**Soluções:** mínimo — interceptar fechamento com formulário "sujo" ("Descartar alterações?") e suportar `Esc`/back-button; ideal — promover para rota própria em mobile (full-screen page) mantendo modal só em desktop.

### 6. Marquee de gatilhos/recompensas: informação essencial em movimento

Os gatilhos ("Se X, então Y") — coração da tese comportamental — são exibidos num **letreiro em rolagem infinita** que o usuário precisa tocar para pausar (ciclo normal → rápido → pausado, nada óbvio).

- Texto em movimento é difícil de ler, especialmente para usuários com déficit de atenção ou baixa visão (WCAG 2.2.2 pede mecanismo de pausa visível para conteúdo em movimento >5s).
- O affordance é invisível: nada indica que tocar muda a velocidade; o `aria-label` explica, mas usuários videntes não recebem essa dica.
- Tocar no card para pausar o marquee compete com a expectativa de "tocar no card = abrir detalhe/marcar".

**Solução:** exibir gatilho e recompensa como texto estático (1 linha com truncamento + expandir), reservando o marquee — se mantido — apenas para overflow real, com controle de pausa visível.

### 7. Navegação com hierarquia confusa

- **Desktop**: "Hoje" é um botão primário sólido centralizado que parece CTA, enquanto Hábitos/Histórico são botões-outline à esquerda; "+ Novo hábito" é um ícone à direita. Três estilos diferentes para itens do mesmo nível de navegação.
- **Mobile**: "Histórico" não existe na bottom nav — está escondido no menu "Ajustes" (configurações ≠ navegação; usuário não procura uma *tela* dentro de ajustes). A bottom nav tem Hoje / Hábitos / FAB+ / Ajustes.
- A rota `/data` (Gerenciar dados) não marca nenhuma aba como ativa.

**Solução:** tratar a navegação como um conjunto único e consistente: Hoje · Hábitos · Histórico (+ FAB de criar). Ajustes só com configurações (tema, accent, dados). Estado ativo padronizado em todas as superfícies.

### 8. Progresso de importação artificial (5–15s)

O import de JSON é síncrono e instantâneo, mas a UI encena 5 etapas com delays aleatórios de 1–3s cada ("Validando JSON… Organizando hábitos… Quase lá…"). Isso:

- Faz o usuário esperar até 15 segundos sem necessidade — o oposto de performance percebida.
- Mina a confiança quando percebido (e dados de backup são área sensível à confiança).
- Não tem estado de sucesso persistente claro além do último label.

**Solução:** aplicar import imediatamente + toast de sucesso ("128 conclusões e 6 hábitos importados"). Se quiser dar peso à operação, uma transição de 300–500ms basta.

### 9. Feedbacks ausentes em ações destrutivas/importantes

- **Arquivar** um hábito: acontece imediatamente, sem confirmação **e sem undo** — o card some da lista "Ativos" e o usuário precisa descobrir o filtro "Arquivados" para reverter.
- **Excluir permanentemente**: tem modal de confirmação (bom!), mas após confirmar não há feedback ("Hábito excluído").
- **Criar/editar hábito**: o modal fecha e… nada. Nenhum toast, nenhum highlight do card novo.

**Solução:** sistema simples de toast/snackbar com undo para arquivar (padrão Material: "Hábito arquivado · Desfazer"). É o componente de feedback mais rentável que falta no app.

---

## 🟡 Refinamentos visuais e de acessibilidade

### 10. Tela "Hoje" esconde o cabeçalho no empty state

Quando não há hábitos, o header "Hoje · quinta, 11 de junho" e a barra de progresso somem completamente. A âncora de contexto da tela não deveria desaparecer — só o conteúdo abaixo dela.

### 11. Copy do empty state "dia de descanso" muito longa

*"Você tem 5 hábitos ativos mas não são para hoje, aproveite o dia ou crie um hábito pra hoje agora"* — frase única com gramática frouxa, fazendo papel de título. Sugestão: título curto ("Dia livre 🎉" / "Nenhum hábito para hoje") + subtítulo de 1 linha + CTA. Também há mistura de registro ("pra" vs "para") espalhada pela copy.

### 12. Streak tiers: espetáculo crescente pode virar ruído

Os níveis visuais (borda animada cônica no tier 4, pulse no contador acelerando até 0,45s) são um diferencial de delight, mas:

- Pulse infinito de 0,45s num card é distrativo quando há vários cards tier 4 — vira uma tela inteira pulsando.
- Mensagens de tier ("Manteremos o topo") são estáticas; perdem o efeito com o tempo.
- Tudo já respeita `prefers-reduced-motion` (excelente!), mas considerar acalmar a animação após alguns segundos de tela (play once, depois estado estático com selo do nível).

### 13. Acessibilidade — bons fundamentos, lacunas pontuais

Bem feito: `aria-label` nos botões de marcar/desmarcar, `aria-modal`, `role="menu"`, `aria-expanded`, focus rings consistentes, dark/light com contraste cuidado.

Lacunas:

- **Modais sem focus trap e sem suporte a `Esc`** (form modal, delete confirm, day history). Foco não move para o modal ao abrir nem retorna ao gatilho ao fechar.
- A barra de progresso do dia deve expor `role="progressbar"` + `aria-valuenow` (verificar `day-progress`).
- Marquee: ver item 6 (WCAG 2.2.2).
- Textos `text-[10px]` (dica de faltas) ficam abaixo do mínimo confortável de leitura.
- Conclusão do hábito comunicada apenas por cor/animação para quem usa leitor de tela — anunciar via `aria-live` ("Leitura marcada como feita, 3 de 5 concluídos").

### 14. Inconsistências menores

- Desmarcar no desktop fica num link discreto no rodapé do card, no mobile aparece ao lado do "✓ Feito" — padrões diferentes para a mesma ação.
- "Categoria" é texto livre (input), mas o accent do card depende de palavras-chave mágicas ("corpo", "treino", "mind", "medita") — o usuário não tem como saber que "Academia" não ganha cor. Melhor: seletor de categorias com cores explícitas + opção "outra".
- O ícone de configurações abre menus diferentes em desktop/mobile com itens em ordem diferente.

---

## 💡 Inovações sugeridas (alinhadas à tese do produto)

1. **Check-in do dia em 1 gesto**: swipe no card (mobile) para marcar/desmarcar — a ação nº 1 do app merece o gesto mais barato. Manter o botão como alternativa acessível.
2. **Resumo semanal gentil**: card na segunda-feira: "Semana passada: 86% de adesão, melhor dia: quarta. Esta semana começa agora." Reforça consistência sem culpa.
3. **Templates + onboarding de 30 segundos**: 3 sugestões prontas de hábito-âncora na primeira visita (ver item 4).
4. **Proteção de sequência** (freeze semanal) — ver item 1.
5. **Notificações locais opt-in** (PWA): o campo de horário já existe; com service worker, vira lembrete real — hoje o horário é apenas decorativo, o que frustra a expectativa criada pelo campo.
6. **Modo foco "agora"**: a tela Hoje ordenada por horário poderia destacar o *próximo* hábito do dia (hero card no topo), reduzindo a lista a uma decisão única — menos carga cognitiva.

---

## Priorização sugerida

| # | Item | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Eliminar reset destrutivo + copy de retomada (itens 1) | M | 🔥 Altíssimo |
| 2 | Toast com undo (arquivar) + feedback de sucesso (item 9) | S | Alto |
| 3 | Formulário em camadas + horário opcional (item 4) | M | Alto |
| 4 | Histórico na navegação mobile + hierarquia da nav (item 7) | S | Alto |
| 5 | Adesão 7d/30d visível (item 2) | M | Alto |
| 6 | Detalhe do hábito com heatmap individual (item 3) | M/L | Alto |
| 7 | Gatilhos estáticos no card (item 6) | S | Médio |
| 8 | Focus trap + Esc nos modais (item 13) | S | Médio |
| 9 | Remover progresso fake do import (item 8) | S | Médio |
| 10 | Templates/onboarding (inovação 3) | M | Médio |

*S = pequeno, M = médio, L = grande*
