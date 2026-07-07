---
id: 037
title: Adicionar modo project-scoped --project (.github/prompts + .github/chatmodes)
status: para implementar
feature: github-copilot-integration
area: backend
priority: P1
estimate: M
depends_on: [035]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#42-instalação-project-scoped---project"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 037 — Modo project-scoped `--project`

## Objetivo
Adicionar a sub-flag `--project` (válida só com `--copilot`) que instala os prompt files/chat mode em `.github/prompts/` e `.github/chatmodes/` do **diretório de trabalho atual** (repo-alvo), habilitando o modelo project-scoped nativo do Copilot — versionável no repo.

## Escopo
- Estender `parseArgs(argv)` para reconhecer `--project` como flag booleana.
- Em `installCopilot()`, quando `args.project === true`:
  - Base = `path.join(process.cwd(), '.github')` em vez do perfil global do VS Code.
  - `ensureDir(<cwd>/.github/prompts/)` + copiar os 9 `ksdd-*.prompt.md`.
  - `ensureDir(<cwd>/.github/chatmodes/)` + gerar `ksdd.chatmode.md`.
  - Não copiar o bundle inteiro (`references/agents`) no projeto — o contexto canônico vive na chat mode; se necessário, referenciar o bundle global. Decisão tática documentada aqui.
  - Adicionar os paths ao `tracked` (para uninstall via manifest).
- `--project` **substitui** o alvo global do Copilot (não instala nas duas superfícies ao mesmo tempo, salvo se o usuário rodar duas vezes) — comportamento documentado no help.
- Mensagem verde específica: "✓ KSDD instalado em .github/ do projeto (N arquivos)."
- Se `cwd` não for repo Git: instalar mesmo assim, com warning informativo (o usuário decide versionar).

## Fora de escopo
- Núcleo global (task 035) e chat mode/CLI global (task 036).
- `.github/copilot-instructions.md` gerenciado pelo KSDD (fora da v1 — FEATURE seção 2.2).
- Manifest/uninstall/status (task 038) — cobre estes paths via `tracked` genérico, mas atenção ao prune (ver 038).

## Critérios de aceitação
- [ ] `parseArgs` reconhece `--project` sem quebrar parsing existente.
- [ ] `ksdd install --copilot --project` cria `<cwd>/.github/prompts/ksdd-*.prompt.md` (9) + `<cwd>/.github/chatmodes/ksdd.chatmode.md`.
- [ ] `--project` **não** grava no perfil global do VS Code.
- [ ] `--project` sem `--copilot` é ignorado ou avisa (documentar o comportamento escolhido).
- [ ] Paths do projeto são adicionados ao `tracked`/manifest para uninstall limpo.
- [ ] `cwd` sem repo Git → instala com warning informativo, sem erro fatal.
- [ ] Idempotência: re-rodar não duplica.

## Notas técnicas
- É o único modo que grava fora de `~/` — efeito colateral no repo do usuário. Só com flag explícita; mensagem deve deixar claro **onde** gravou.
- Reusar a mesma nomenclatura/`copilotPromptBasename` da task 035.
- Cuidado no uninstall (task 038): `pruneEmptyDirs` sob `.github/prompts|chatmodes/` nunca deve subir para `.github/` (compartilhado com workflows/templates do repo) nem apagar `.github/` inteiro.

## Riscos / dependências externas
- Gravar em `.github/` do repo pode colidir com prompt files já versionados pelo time — prefixo `ksdd-` mitiga colisão de nome; não sobrescrever arquivos não-KSDD.
- Manifest com paths de projeto pode ficar "órfão" se o usuário mudar de diretório — uninstall usa paths absolutos rastreados; documentar a limitação.
