---
id: 057
title: Adicionar bloco de pré-flight de update-check nos 11 commands + ajustar allowed-tools
status: para implementar
feature: update-health-check
area: backend
priority: P0
estimate: M
depends_on: [056]
feature_refs:
  - ".ksdd/features/FEATURE-update-health-check.md#72-commands-commandsmd"
  - ".ksdd/features/FEATURE-update-health-check.md#82-bloco-de-pré-flight-nos-commands-texto-de-referência"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 057 — Wire do pré-flight nos 11 commands

## Objetivo
Fazer cada slash command disparar a checagem de update na primeira invocação KSDD da conversa. Como a "primeira vez" depende de qual command o usuário abre primeiro, **todos os 11** precisam conter o gatilho.

## Escopo
- Adicionar, no topo do corpo de cada `commands/*.md` (logo após o frontmatter / bloco de idioma, antes do fluxo principal), o **bloco de pré-flight** padronizado (FEATURE 8.2):
  > **Pré-flight (uma vez por sessão):** se você ainda não executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` antes de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou npm ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.
- Aplicar o **bloco idêntico** nos 11: `start.md`, `spec.md`, `tech.md`, `design.md`, `new:feature.md`, `new:fix.md`, `build:feature.md`, `build:fix.md`, `build:all.md`, `setup.md`, `archive.md`.
- Ajustar o `allowed-tools` de cada command para permitir a checagem (`Bash` para `npm view`; e o tool de fetch quando o command já o usa). Onde `Bash` já está presente, nada a fazer além do bloco.
- Usar edição cirúrgica (`str_replace`) — não reescrever os commands.

## Fora de escopo
- Criar `references/update-check.md` (task 056 — este bloco só o referencia).
- SPEC/architecture/README/help (tasks 058, 059).
- Mudar a lógica interna de qualquer command além do bloco + `allowed-tools`.

## Critérios de aceitação
- [ ] Os 11 `commands/*.md` contêm o bloco de pré-flight, idêntico em texto, referenciando `references/update-check.md`.
- [ ] O bloco aparece antes do fluxo principal de cada command (não enterrado no meio).
- [ ] `allowed-tools` de cada command permite a ferramenta usada na checagem (`Bash` e/ou fetch); nenhum command perde tools que já tinha.
- [ ] `node -c` não se aplica (Markdown), mas os frontmatters continuam YAML válido (sem quebrar `description`/`argument-hint`/`allowed-tools`).
- [ ] Diff mostra apenas adições do bloco + ajuste de `allowed-tools` — nenhuma regressão no conteúdo existente.

## Notas técnicas
- Os commands são fonte única (`commands/*.md`) copiada para todos os targets; editar aqui propaga a todos (`agentPromptBasename` cuida do rename `:` → `-`). Nada a fazer por target.
- Manter o bloco **curto**: toda a lógica vive em `references/update-check.md`. O bloco é só o gatilho + a garantia de não-bloqueio e de 1x/sessão.
- Conferir o `allowed-tools` real de cada arquivo antes de editar — alguns (`new:fix`, `build:feature`) já incluem `Bash`; `start`/`spec`/`design` podem não incluir.

## Riscos / dependências externas
- Inconsistência entre os 11 blocos: mitigar colando o mesmo texto verbatim e conferindo no QA (task 060).
- Ampliar `allowed-tools` amplia levemente a permissão do agente naquele command — escopo restrito à checagem; aceito (FEATURE 9.2).
