---
id: 063
title: README/INSTALL/CHANGELOG + bump package.json 0.12.0
status: em revisão
feature: parallel-build-sync
area: backend
priority: P0
estimate: S
depends_on: [056, 057, 058, 059, 060, 061, 062]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 063 — Docs + CHANGELOG + bump 0.12.0

## Objetivo
Documentar o fluxo de build turbinado nos docs do repo e cortar a release: entrada de CHANGELOG, ajustes em README/INSTALL, e bump de versão em `package.json` para **0.12.0**. Também valida que o novo reference é distribuído sem tocar o instalador.

## Escopo
- **`package.json`**: bump `version` para `0.12.0`. Atualizar o `version` embutido no manifest exemplo se houver menção em docs.
- **`CHANGELOG.md`**: entrada `0.12.0` descrevendo — execução paralela com worktrees, PR único ao final (`--multi-pr` opt-in), fase de sync pós-build (só docs derivados), alinhamento do `build:all`, novo `references/parallel-build.md`, **sem mudança em `bin/ksdd.js`**.
- **`README.md`**: atualizar a descrição do fluxo `build:feature`/`build:all` (PR único, paralelismo, sync). Se houver contagem de references, incrementar.
- **`INSTALL.md`**: revisar menções ao fluxo de build, se houver.
- **Validação de distribuição** (parte do critério): rodar `node -c bin/ksdd.js`; `HOME`/`COPILOT_HOME` de teste apontando para `/tmp` → `ksdd install` + `ksdd status` mostram `parallel-build.md` bundlado no skill de cada target; `ksdd uninstall` limpo.

## Fora de escopo
- Editar SPEC/architecture (tasks 061/062) e commands (057-059).
- Qualquer mudança de código em `bin/ksdd.js` (o objetivo é justamente comprovar que não precisa).

## Critérios de aceitação
- [ ] `package.json` em `0.12.0`.
- [ ] `CHANGELOG.md` com entrada 0.12.0 cobrindo os pontos da feature e destacando "sem mudança em bin/ksdd.js".
- [ ] `README.md` (e `INSTALL.md` se aplicável) refletem PR único + paralelismo + sync.
- [ ] `node -c bin/ksdd.js` OK e `ksdd install`/`status` (HOME de teste) mostram `references/parallel-build.md` distribuído; `uninstall` preserva arquivos não-ksdd.
- [ ] Contagens (references, versão) consistentes entre docs.

## Notas técnicas
- Não tocar o `~` real — usar overrides de HOME por target (`CODEX_HOME`, `OPENCODE_HOME`, `ANTIGRAVITY_HOME`, `COPILOT_HOME`) apontando para `/tmp`, conforme CLAUDE.md.
- Idioma dos docs do repo: pt-BR técnico (README/INSTALL do repo já são).

## Riscos / dependências externas
- Depende de todas as tasks de conteúdo (056-062) para documentar o estado final.
