# Modo demonstrativo (dev-only)

**Decisão Sprint 5 (S5-07):** o modo demo permanece no código para previews locais, mas fica **desabilitado em builds de produção**.

## Comportamento

- Em **desenvolvimento** (`ng serve`): double-click no logo revela ações de preview no menu (dados predefinidos ou aleatórios).
- Em **produção** (`ng build`): double-click não expõe preview; testers do beta veem apenas dados reais do IndexedDB.

## Implementação

- `AppNavComponent.revealPreviewActions()` retorna cedo quando `!isDevMode()`.
- `SettingsMenuComponent` só renderiza entradas de demo quando `showPreviewActions()` está ativo (já condicionado ao dev).

## Alternativas descartadas

- **Remover serviço:** perderia utilidade para screenshots e demos locais.
- **Feature oculta em prod:** risco de confundir testers — rejeitado.
