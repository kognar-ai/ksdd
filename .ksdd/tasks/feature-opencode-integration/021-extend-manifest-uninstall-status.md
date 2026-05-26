---
id: 021
title: Estender normalizeManifest, uninstall, status, pruneEmptyDirs para targets.opencode
status: em revisão
feature: opencode-integration
area: backend
priority: P0
estimate: S
depends_on: [020]
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#43-uninstall-completo-cross-agent"
  - ".ksdd/features/FEATURE-opencode-integration.md#44-status-com-3-targets-ativos"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#31-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/architecture.md#43-funções-internas-não-exportadas--uso-interno-do-cli"
---

# 021 — Estender manifest + uninstall + status para `targets.opencode`

## Objetivo
Tornar o manifest, o `uninstall` e o `status` cientes do terceiro target (opencode), preservando compatibilidade com manifests antigos (Claude-only, Claude+Codex). Sem este task, install opencode escreve arquivos mas não consegue removê-los nem reportá-los.

## Escopo
- **`normalizeManifest(m)`** (`bin/ksdd.js:73-91`): aceitar manifest sem `targets.opencode` e popular como `[]`. Manter migração existente do formato pré-0.4.0 (`files: []` → `targets.claude`). Após normalização, todo manifest tem `{ targets: { claude: [...], codex: [...], opencode: [...] } }`.
- **`main()` uninstall path:** iterar `targets.claude.concat(targets.codex).concat(targets.opencode)` para `removePath()`. Ordem não importa pra correção, mas preferir Claude → Codex → opencode pra logs consistentes.
- **`pruneEmptyDirs(root)`:** chamar adicionalmente para os roots opencode após uninstall:
  - `~/.config/opencode/ksdd/` (bundle inteiro)
  - `~/.config/opencode/commands/` (apenas se ficar vazio — usuário pode ter outros commands).
  - **Não** subir para `~/.config/opencode/` em si (risco médio em FEATURE 9.2 — pode haver outros tools usando o diretório).
  - Honrar `OPENCODE_HOME` override aqui também.
- **`status()`:** imprimir linha `opencode: N arquivos em <base>` quando `targets.opencode.length > 0`. Omitir a linha quando vazio (alinhado com comportamento Codex atual — paridade UX).
- **Fallback de uninstall sem manifest:** estender a lista de paths "conhecidos por convenção" para incluir `~/.config/opencode/commands/ksdd-*.md` (glob simples via `fs.readdirSync` + filter) e `~/.config/opencode/ksdd/`. Manter warning amarelo "modo fallback" existente.
- **`saveManifest()`** não precisa mudar — só serializa o objeto recebido.
- **Schema version do manifest:** atualizar a string da versão escrita no manifest para `0.8.0` (vinculado ao bump em task 026; usar a versão lida de `package.json` se já houver mecanismo, senão hardcoded e revisar em 026).

## Fora de escopo
- Implementação de `installOpencode` (task 020).
- Criação de `references/opencode-AGENTS.md` (task 022).
- Renomear `codexPromptBasename` (task 023).
- Bumpar `package.json` para 0.8.0 (task 026).
- Documentar mudança de schema em CHANGELOG (task 026).

## Critérios de aceitação
- [ ] Manifest antigo `{ targets: { claude: [...], codex: [...] } }` lido pelo `normalizeManifest` resulta em `{ targets: { claude: [...], codex: [...], opencode: [] } }`.
- [ ] Manifest pré-0.4.0 `{ files: [...] }` continua migrando corretamente; após migração tem `opencode: []` também.
- [ ] Manifest novo escrito após `ksdd install --opencode` contém `targets.opencode` com paths absolutos válidos.
- [ ] `ksdd uninstall` após `install --codex --opencode` remove todos os arquivos rastreados nos 3 arrays sem deixar lixo.
- [ ] `ksdd uninstall` em fallback (manifest deletado manualmente) remove arquivos opencode por convenção e emite warning amarelo.
- [ ] `pruneEmptyDirs` não remove `~/.config/opencode/` em si nem subdiretórios que contenham arquivos não-KSDD.
- [ ] `pruneEmptyDirs` remove `~/.config/opencode/ksdd/` inteiro após uninstall (todos os arquivos rastreados sumiram).
- [ ] `ksdd status` exibe `opencode: N arquivos em ~/.config/opencode/` quando há instalação ativa.
- [ ] `ksdd status` **omite** a linha opencode quando `targets.opencode` está vazio (paridade com Codex).
- [ ] Tudo testado manualmente neste repo: install → status → uninstall → status (cada um produz a saída esperada).

## Notas técnicas
- O lookup de "paths por convenção" no fallback deve usar a mesma resolução de base path (`OPENCODE_HOME` env override). Reaproveitar helper criado em 020.
- Cuidado: `fs.readdirSync` em diretório inexistente lança — wrap em try/catch silencioso (idêntico ao já feito para Codex).
- `pruneEmptyDirs` atual (linha ~104 de `bin/ksdd.js`) precisa receber root específico; chamar 2-3x explicitamente em vez de generalizar.

## Riscos / dependências externas
- Depende de task 020 (precisa do helper de base path e da invocação de `installOpencode` que popula `targets.opencode`).
- Risco baixo: `pruneEmptyDirs` mal-restrita poderia deletar diretório de usuário — mitigação é a regra explícita "nunca subir além de `~/.config/opencode/ksdd/` e `~/.config/opencode/commands/`" e teste manual em 027.
