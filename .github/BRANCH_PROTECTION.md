# Branch protection — `master`

Após o primeiro push do workflow `.github/workflows/ci.yml`, configure no GitHub:

**Settings → Branches → Add branch protection rule → Branch name pattern: `master`**

Recomendado:

| Opção | Valor |
|-------|--------|
| Require a pull request before merging | Sim (1 approval, se trabalhar em equipe) |
| Require status checks to pass before merging | Sim |
| Status checks required | `lint`, `test`, `build` (jobs do workflow **CI**) |
| Require branches to be up to date before merging | Sim |
| Do not allow bypassing the above settings | Sim (opcional, recomendado) |

Os nomes exatos dos checks aparecem na aba **Actions** após a primeira execução do workflow. Se o GitHub exibir prefixo `CI /`, selecione `CI / lint`, `CI / test` e `CI / build`.

Via CLI (requer permissão de admin no repositório):

```bash
gh api repos/WillianWRS/wrs-habit-builder/branches/master/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "lint" },
      { "context": "test" },
      { "context": "build" }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

Ajuste `context` se os checks aparecerem com prefixo `CI /` no repositório.
