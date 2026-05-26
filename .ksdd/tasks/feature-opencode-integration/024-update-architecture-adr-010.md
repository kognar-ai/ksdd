---
id: 024
title: Atualizar architecture.md — ADR-010 + diagrama + roadmap Fase 5
status: em revisão
feature: opencode-integration
area: design
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#11-problema--oportunidade"
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 024 — `architecture.md`: ADR-010 + diagrama + roadmap

## Objetivo
Atualizar `.ksdd/specs/architecture.md` registrando a decisão arquitetural da feature (ADR-010 — terceiro target hardcoded, refator `installTarget` adiado), atualizando o diagrama da seção 1 para incluir opencode como terceiro target, e marcando o início da Fase 5 multi-agent no roadmap.

## Escopo
- **ADR-010 (nova entrada em `architecture.md` seção 10):**
  - Título: "ADR-010: Terceiro target (opencode) hardcoded antes do refator `installTarget` genérico"
  - Evidência: feature opencode-integration (v0.8.0) adiciona `installOpencode()` como cópia adaptada de `installCodex` em `bin/ksdd.js`, em vez de refatorar para padrão `installTarget(targetConfig)`.
  - Decisão: aceitar duplicação intencional `installCodex` ↔ `installOpencode` com prazo explícito — a próxima feature multi-agent (suporte a Cursor, Windsurf ou Cline) **deve** introduzir `installTarget(targetConfig)` genérico antes de adicionar o quarto target.
  - Confiança: alta — decisão deliberada após análise de trade-off (FEATURE seção 1.1).
  - Consequência: release de opencode 2-3x mais rápido; aumenta dívida técnica de ~250 linhas duplicadas (`installCodex` + `installOpencode`); refator dobra de tamanho quando finalmente acontecer (3 funções para refatorar em vez de 2).
- **Diagrama seção 1:** adicionar terceira "coluna" do lado direito para opencode, espelhando o layout das colunas Claude/Codex existentes:
  ```
  ┌──────────────────────────────────────┐
  │  opencode (target: opencode)         │
  │  ~/.config/opencode/commands/        │
  │       ksdd-*.md                      │
  │  ~/.config/opencode/ksdd/            │
  │    ├── references/                   │
  │    ├── agents/                       │
  │    ├── README.md INSTALL.md          │
  │    └── AGENTS.md                     │
  └──────────────────────────────────────┘
  ```
  Atualizar a seta `ksdd install [--codex]` para `ksdd install [--codex] [--opencode]`.
- **Seção 2.4 (Infraestrutura):** sem mudança estrutural — opencode também é distribuído via npm.
- **Seção 3.1 (Manifest schema):** atualizar o exemplo JSON pra incluir `targets.opencode: [...]`. Atualizar a versão do exemplo pra `0.8.0`.
- **Seção 4.1 (Subcomandos CLI):** adicionar linhas:
  ```
  ksdd install --opencode             # Claude + opencode
  ksdd install --codex --opencode     # Claude + Codex + opencode
  ```
- **Seção 4.2 (Env vars):** adicionar `KSDD_WITH_OPENCODE` e `OPENCODE_HOME` à tabela.
- **Seção 4.3 (Funções internas):** adicionar linha para `installOpencode(tracked, out)` e atualizar `codexPromptBasename` → `agentPromptBasename` (se task 023 entrou) com nota "compartilhado entre Codex e opencode".
- **Seção 5 (Integrações Externas):** adicionar linha `opencode` à tabela (Propósito: "Consumidor terciário via custom commands + bundle", Auth: n/a, Rate limit: n/a, Custo: usuário paga sua conta — espelha Codex).
- **Seção 11 (Riscos Técnicos):** adicionar risco já cunhado em FEATURE 9.2 sobre paths de opencode em Windows e sobre a duplicação `installCodex`/`installOpencode`.
- **Seção 12 (Roadmap):** marcar Fase 5 como "Em andamento" e adicionar checkbox `[x] Suporte a opencode (v0.8.0)`; deixar os outros 3 (Cursor, Windsurf, Cline) como `[ ]`.
- Atualizar header do arquivo: "Última atualização: 26/05/2026".

## Fora de escopo
- Implementação do código (tasks 020-023).
- Atualizar `SPEC.md` (task 025).
- Atualizar `README.md`, `INSTALL.md`, `CHANGELOG.md`, `package.json` (task 026).
- Mudar `Status:` do architecture.md de "Rascunho" para "Aprovado" — fica sob responsabilidade do mantenedor após revisão.

## Critérios de aceitação
- [ ] Seção 10 tem nova entrada `ADR-010: Terceiro target (opencode) hardcoded antes do refator installTarget genérico` com Evidência/Decisão/Confiança/Consequência.
- [ ] Diagrama da seção 1 mostra 3 colunas (Claude, Codex, opencode) e a seta menciona `[--codex] [--opencode]`.
- [ ] Seção 3.1 exemplo de manifest tem `targets.opencode: [...]` e `version: "0.8.0"`.
- [ ] Seção 4.1 lista os 2 novos comandos (`--opencode` solo, `--codex --opencode`).
- [ ] Seção 4.2 tem linhas pra `KSDD_WITH_OPENCODE` e `OPENCODE_HOME`.
- [ ] Seção 4.3 lista `installOpencode(tracked, out)` na tabela de funções internas.
- [ ] Seção 5 tem linha pra opencode na tabela de integrações.
- [ ] Seção 11 tem ≥ 1 risco novo relacionado à feature (Windows path + duplicação).
- [ ] Seção 12 mostra Fase 5 "Em andamento" com checkbox marcado para opencode.
- [ ] Header tem "Última atualização: 26/05/2026".
- [ ] Markdown válido (sem tabelas quebradas, sem code blocks abertos).

## Notas técnicas
- Edição cirúrgica via `Edit` tool — não reescrever o arquivo inteiro. Manter formatação existente (alinhamento de tabela, indentação de listas).
- Diagrama é ASCII art — cuidar de larguras consistentes pra não desalinhar.
- ADRs do arquivo seguem padrão estável (`### ADR-NNN:` + 4 subseções **Evidência**, **Decisão**, **Confiança**, **Consequência**) — manter idêntico.

## Riscos / dependências externas
- Nenhuma dependência de outras tasks pra começar — pode rodar em paralelo. Mas convém revisar **após** a implementação (020-023) pra garantir que ADR-010 e tabela de funções refletem o que de fato foi codado.
- Risco mínimo: divergência entre architecture.md e código se code review da implementação muda algo (ex: nome final do helper). Mitigação: incluir uma checagem cruzada na task 027 (QA).
