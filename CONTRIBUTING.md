# Fluxo de Git

## Branches
- main: somente código pronto para produção. Protegida; merge via PR aprovado e CI verde.
- develop: integração contínua. Features nascem aqui e voltam via PR.
- eature/<slug>: trabalho diário de curta duração; rebase frequente em develop.
- elease/<versao> (opcional): estabilização para produção; só fixes menores. Ao publicar, merge em main e back-merge em develop.
- hotfix/<bug>: correções urgentes a partir de main; depois merge em main e back-merge em develop.

## PRs
- Origem: develop (ou main para hotfix) → destino correspondente.
- Requisitos: CI passando, pelo menos 1 review, descrição curta do objetivo, checklist de testes manuais quando houver UI.
- Commits pequenos; squash permitido no merge.

## Versionamento
- Tag em main como X.Y.Z a cada release.
- Changelog derivado dos PRs/commits entre tags.

## CI
- Workflow .github/workflows/ci.yml executa:
  - backend: pytest com DATABASE_URL=sqlite:///./test.db.
  - frontend: 
pm ci, 
pm run lint -- --max-warnings=0, 
pm run build.

## Proteção de branches
- Rodar scripts/set-branch-protection.ps1 com GITHUB_TOKEN de admin para aplicar regras em main e develop:
  `pwsh
  ='<pat_repo_admin>'
  pwsh scripts/set-branch-protection.ps1
  `
- Regras aplicadas: PR obrigatório, 1 aprovação, job CI verde, histórico linear, sem force-push/deleção, admins incluídos.

## Convenções rápidas
- Mensagem de commit: imperativo curto (ex.: justa modal de personas).
- Nome de branch: kebab-case (ex.: eature/refatora-personas).
- Nada de push direto em main/develop; sempre via PR.
