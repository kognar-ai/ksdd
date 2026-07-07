---
id: 038
title: Estender normalizeManifest/uninstall/status/pruneEmptyDirs p/ targets.copilot
status: para implementar
feature: github-copilot-integration
area: backend
priority: P0
estimate: M
depends_on: [035]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#6-impacto-no-modelo-de-dados"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#44-uninstall-completo-cross-agent"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#45-status-com-5-targets-ativos"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#31-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 038 — Manifest + uninstall + status para `targets.copilot`

## Objetivo
Fechar o ciclo de vida da instalação Copilot: `targets.copilot` no manifest, normalização de manifest legado, uninstall completo e limpo, exibição no `status`, e pruning **seguro** dos diretórios Copilot (nunca subindo além dos subdirs KSDD).

## Escopo
- `saveManifest()`/estrutura do manifest: incluir `targets.copilot: string[]` (array de paths absolutos populado pela task 035/036/037).
- `normalizeManifest(m)`: se manifest legado não tem `targets.copilot`, criar array vazio (sem erro, sem migração manual).
- `uninstall()` (em `main()`): iterar `targets.claude + codex + opencode + antigravity + copilot`, `removePath()` em cada.
- `pruneEmptyDirs()` chamado **estritamente** para os subdirs Copilot, e só se ficarem vazios:
  - `<userDir>/prompts/` (só se vazio — compartilhado com prompt files não-KSDD; **nunca** apagar se contiver arquivos de terceiros)
  - `<userDir>/ksdd/`
  - `~/.copilot/prompts/`
  - `.github/prompts/` e `.github/chatmodes/` (modo project) — **nunca** subir para `.github/` nem `<userDir>/`
- `status()`: imprimir linha `copilot: N arquivos em <userDir>/ (prompts + chat mode + bundle)` quando `targets.copilot` não-vazio; omitir quando vazio.
- Fallback de uninstall sem manifest: remover paths Copilot por convenção (usando `resolveVscodeUserDir()`), com warning amarelo "modo fallback".
- Preservação: `ksdd install` sem `--copilot` não toca em `targets.copilot` nem nos arquivos (SPEC seção 11).

## Fora de escopo
- Instalação em si (tasks 035/036/037).
- Bump de versão / docs (task 042).

## Critérios de aceitação
- [ ] Manifest pós-`ksdd install --copilot` contém `targets.copilot` com paths absolutos corretos.
- [ ] `normalizeManifest()` lê manifest antigo (sem `targets.copilot`) e cria array vazio sem erro.
- [ ] `ksdd uninstall` remove todos os arquivos rastreados de `targets.copilot`; nenhum prompt file não-KSDD nem config do `User/` do VS Code é deletado.
- [ ] `pruneEmptyDirs` **nunca** apaga `<userDir>/`, `~/.copilot/` (raiz) nem `.github/` — só os subdirs KSDD e só se vazios.
- [ ] `<userDir>/prompts/` com prompt files de terceiros é preservado após uninstall (só os `ksdd-*` são removidos).
- [ ] `ksdd status` mostra a linha de `copilot` quando ativo e a omite quando vazio.
- [ ] `ksdd uninstall` sem manifest remove paths Copilot por convenção (resolução por SO), com warning amarelo.
- [ ] `ksdd install` sem `--copilot` preserva `targets.copilot` e arquivos existentes (teste de preservação).
- [ ] Manifest schema com `version` coerente com `package.json` (0.10.0 após task 042).

## Notas técnicas
- O `uninstall` já itera arrays genéricos de `tracked` — o cuidado real é o **pruning**: `<userDir>/prompts/` é compartilhado com toda a config do VS Code e com prompt files do próprio usuário. Só remover o diretório se ficar 100% vazio; nunca `rm -rf` do diretório inteiro.
- Reusar `resolveVscodeUserDir()` da task 035 no fallback de uninstall (sem manifest) para achar os paths por SO.
- Espelhar o tratamento que `installAntigravity`/`targets.antigravity` já fazem em `bin/ksdd.js`, com o cuidado extra do diretório compartilhado do VS Code.

## Riscos / dependências externas
- **Risco alto:** prune agressivo em `<userDir>/` apagaria config do VS Code. Mitigação: prune restrito e condicional a diretório vazio (critério de aceite explícito).
- Depende de `resolveVscodeUserDir()` (task 035) estar mergeado.
