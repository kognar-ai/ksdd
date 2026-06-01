# Context — Task 030: references/antigravity-AGENTS.md

**Issue:** #19 · **Área:** data-model · **P0 · S**

## Task em uma página
Criar `references/antigravity-AGENTS.md` (~20-40 linhas), bundlado e copiado para `~/.gemini/ksdd/AGENTS.md` no install (task 028). Dá contexto canônico ao agente Antigravity: onde achar references/agents, convenção de approval gates, idioma, fluxo padrão. Sem dependências.

## Feature spec relevante (seção 5 — Telas Novas)
> arquivo novo `references/antigravity-AGENTS.md` distribuído com o pacote, copiado para `~/.gemini/ksdd/AGENTS.md`. Conteúdo (~30 linhas): orienta o agente Antigravity a usar `./references/` e `./agents/` e a respeitar os checkpoints obrigatórios (espelha `references/opencode-AGENTS.md`).

## Plano de implementação
- Novo arquivo: `references/antigravity-AGENTS.md`
- Base: `references/opencode-AGENTS.md` (trocar opencode/`~/.config/opencode/` → Antigravity/`~/.gemini/`; citar as duas superfícies de skills CLI+IDE)
- Sem código; sem migração.

## Quality gates
- [x] Arquivo existe, 20-40 linhas
- [x] Cita ./references/, ./agents/, approval gates, idioma, paths CLI+IDE
- [x] Sem emojis, voz ativa
- [x] Coerente com opencode-AGENTS.md
