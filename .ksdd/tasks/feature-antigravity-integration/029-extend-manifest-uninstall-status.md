---
id: 029
title: Estender normalizeManifest, uninstall, status, pruneEmptyDirs p/ targets.antigravity
status: em revisão
feature: antigravity-integration
area: backend
priority: P0
estimate: S
depends_on: [028]
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#43-uninstall-completo-cross-agent"
  - ".ksdd/features/FEATURE-antigravity-integration.md#44-status-com-4-targets-ativos"
  - ".ksdd/features/FEATURE-antigravity-integration.md#6-impacto-no-modelo-de-dados"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#31-manifest-de-instalação"
---

# 029 — Estender manifest, uninstall e status para `targets.antigravity`

## Objetivo
Fazer o manifest, o `uninstall`, o `status` e o `pruneEmptyDirs` reconhecerem o quarto target. Sem isso, `installAntigravity` (task 028) escreve arquivos que ficam órfãos no uninstall e invisíveis no status.

## Escopo
- `normalizeManifest(m)`: reconhece manifest legado sem `targets.antigravity` e cria array vazio (espelha o tratamento de `targets.opencode`).
- `saveManifest`/schema: passa a persistir `targets.antigravity` (array de paths absolutos).
- `uninstall()` (em `main()`): itera os 4 arrays (`claude`, `codex`, `opencode`, `antigravity`); `removePath` em cada; ao final `pruneEmptyDirs` em `~/.gemini/antigravity-cli/skills/`, `~/.gemini/antigravity/skills/` e `~/.gemini/ksdd/`.
- **Pruning seguro:** restringir estritamente aos subdirs KSDD acima — **nunca** subir para `~/.gemini/` (compartilhado com gemini-cli e outros tools Google).
- Fallback sem manifest: tenta remover paths Antigravity por convenção (os 3 subdirs), com warning amarelo "modo fallback".
- `status()`: imprime `antigravity: N arquivos em ~/.gemini/` quando `targets.antigravity` é não-vazio; omite a linha quando vazio.

## Fora de escopo
- A função `installAntigravity()` em si (task 028).
- Documentação e bump de versão (task 033).
- Confirmação do path IDE (task 034).

## Critérios de aceitação
- [ ] `normalizeManifest()` lê manifest antigo sem `targets.antigravity` e devolve array vazio sem erro.
- [ ] Após `ksdd install --antigravity`, o manifest persistido contém `targets.antigravity` com paths absolutos de skills CLI + skills IDE + bundle.
- [ ] `ksdd uninstall` remove todos os paths rastreados em `targets.antigravity` e faz prune dos 3 subdirs; `~/.gemini/` e arquivos não-KSDD (ex: config do gemini-cli) ficam intactos.
- [ ] `ksdd uninstall` em modo fallback (sem manifest) remove paths Antigravity por convenção, com warning amarelo.
- [ ] `ksdd status` imprime a linha `antigravity: ...` só quando há instalação; omite quando vazio.
- [ ] `ksdd install` sem `--antigravity` preserva `targets.antigravity` e os arquivos correspondentes (não deleta).
- [ ] Smoke local: install → status (4 linhas) → uninstall (remove tudo) → status (sem linha antigravity).

## Notas técnicas
- Espelhar 1:1 a extensão feita para `targets.opencode` na feature opencode (tasks 020/021) — mesma forma, mais um target.
- `pruneEmptyDirs` em si é inalterado; só recebe chamadas adicionais com os paths Antigravity.
- Cuidado com a ordem no fallback: derivar os paths de convenção a partir de `ANTIGRAVITY_HOME || ~/.gemini`.

## Riscos / dependências externas
- Depende da task 028 (paths e estrutura definidos lá).
- Risco do prune em diretório compartilhado `~/.gemini/` — mitigado restringindo aos subdirs (FEATURE seção 9.2).
