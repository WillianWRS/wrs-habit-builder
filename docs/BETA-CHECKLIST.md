# Checklist Beta — Habit Builder

> Smoke manual para ~20 testers do beta fechado. Marque cada item antes de enviar feedback.

## Pré-requisitos

- [ ] App aberto em **mobile** (360px) e **desktop**
- [ ] Dados reais (não modo demo — indisponível em produção)
- [ ] Opcional: instalar como PWA (Add to Home Screen)

## Fluxo P0

### Criar hábito

- [ ] Empty state em Meus hábitos mostra **3 templates** ou CTA criar
- [ ] Criar hábito só com **nome + dias** (campos opcionais colapsados)
- [ ] Template preenche formulário corretamente
- [ ] Toast "Hábito criado" aparece

### Marcar em Hoje

- [ ] Hábito aparece na tela Hoje
- [ ] Marcar/desmarcar em 1 toque
- [ ] Anúncio acessível ao marcar (aria-live)

### Progresso e detalhe

- [ ] Tela Progresso: heatmap mensal renderiza
- [ ] Chips de adesão com rótulo progressivo (não `30d` no dia 2)
- [ ] Card da lista abre detalhe `/habits/:id`
- [ ] Detalhe: heatmap individual, streak, freeze, adesão

### Editar e arquivar

- [ ] Editar hábito via `/habits/:id/edit`
- [ ] Guard "Descartar alterações?" ao sair com form sujo
- [ ] Arquivar com toast + **Desfazer**
- [ ] Excluir permanente com undo

### Dados

- [ ] Export JSON em Configurações
- [ ] Import JSON restaura dados
- [ ] Política de privacidade acessível

## Aparência

- [ ] Tema claro e escuro em Configurações
- [ ] Contraste legível no heatmap (ambos os modos)

## Feedback

Após o checklist, preencha o formulário de feedback (link em Configurações → Beta fechado).

Campos sugeridos no form:

1. Dispositivo e navegador
2. O que ficou confuso?
3. Adesão ficou clara?
4. Encontrou bugs? (passos para reproduzir)
5. NPS 0–10
6. Comentário livre

## Canal do fundador

- Formulário: ver `BETA_FEEDBACK_FORM_URL` em `src/app/core/constants/beta-feedback.constants.ts`
- E-mail: contato@willianwrs.dev
- **Precisa aprovação:** canal WhatsApp/Telegram para squad beta
