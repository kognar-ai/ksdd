# Brainstorm — KSDD (Kognar Spec-Driven Design & Development)

> Slash commands para Claude Code e Codex que guiam produtos do brainstorm bruto até design system implementável, com checkpoints humanos entre cada etapa.

**Data:** 14/05/2026
**Status:** Rascunho (reverse-engineered)
**Origem:** Reverse-engineered via `/ksdd:setup` em 14/05/2026
**Aviso:** Artefato gerado automaticamente. Revise e corrija antes de usar como contrato.

---

## 1. Conceito em uma frase

Sistema de slash commands open source que estrutura o trabalho com IA generativa em produto, transformando ideias brutas em quatro artefatos canônicos acumulativos (brainstorm → spec → arquitetura → design system), com aprovação humana obrigatória entre cada fase.

## 2. Problema

Trabalhar com agentes de IA (Claude Code, Codex) em projetos de produto tem três falhas recorrentes:

- **Documento ruim na fonte cascateia.** Brainstorm vago gera SPEC confuso, que gera design adivinhado, que gera código que não resolve o problema original.
- **Falta de checkpoints obrigatórios.** Agentes correm da ideia direto pro código sem que o humano valide as fundações — quando o erro é detectado, já está implementado.
- **Falta de formato canônico compartilhado entre ferramentas.** Cada agente (Claude, Cursor, v0, Lovable, Stitch) consome especificações diferentes — sem padrão, não há reuso de contexto entre ferramentas.

Quem sofre: product designers, founders solo, devs e agências que usam Claude Code/Codex e querem rastreabilidade de spec até implementação. Sinal de que o problema é real: o próprio projeto nasceu como ferramenta interna da Kognar (`[verificar com mantenedores]`) e foi aberto como OSS após validação de uso.

## 3. Solução proposta

KSDD é um pacote npm (`@kognar/ksdd`) que instala 11 slash commands em `~/.claude/commands/` e custom prompts em `~/.codex/prompts/`. Cada comando lê o output do anterior, faz uma rodada de perguntas estruturadas para preencher lacunas, gera o artefato no formato canônico e **para antes de avançar** para o próximo. O humano valida, ajusta com edição cirúrgica, e só então roda o próximo comando.

Os artefatos são acumulativos: `SPEC.md` referencia `brainstorm.md`; `architecture.md` e `DESIGN.md` referenciam ambos. Cada documento é um "contrato" que o próximo respeita. Agentes auxiliares (`interviewer`, `consolidator`, `critic`, `setup-analyst`) garantem qualidade, e `references/` contém os templates canônicos imutáveis.

O loop principal: ideia bruta → `/ksdd:start` → brainstorm aprovado → `/ksdd:spec` → SPEC aprovado → `/ksdd:tech` (opcional) + `/ksdd:design` → entregáveis prontos para implementação via `/ksdd:new:feature`, `/ksdd:build:feature`, `/ksdd:build:all`.

## 4. Diferencial

| Alternativa | O que faz | Por que KSDD é diferente |
|-------------|-----------|--------------------------|
| **Prompts/skills ad-hoc** (uso direto do Claude/Codex) | Conversação livre, sem estrutura | KSDD impõe checkpoints e formato canônico — saída reproduzível |
| **Spec-driven puro (em texto)** | Documento Word/Notion + AI separados | KSDD une fluxo de geração + artefatos versionáveis no repo |
| **Google Stitch (DESIGN.md)** | Formato de design system | KSDD adota o formato Stitch e adiciona as 3 fases anteriores |
| **Linear/Notion + IA** | Tracker + AI assistant | KSDD trabalha em arquivos no repo, não em ferramentas externas |

**Unfair advantage:** ser a primeira camada de "spec-driven" que padroniza a saída entre múltiplos agentes (Claude + Codex hoje; Cursor, Windsurf, Cline no roadmap), com a saída final em formato Stitch já reconhecido por design tools (v0, Lovable, Pencil).

## 5. Público-alvo

- **Primário:** Product designers / PMs solo + fundadores / equipes pequenas (1-5 pessoas) + devs e agências que usam Claude Code / Codex e querem rastreabilidade spec → implementação com aprovação humana entre fases. Multi-perfil confirmado com o mantenedor.
- **Secundário:** Equipes maiores que adotam parcialmente (ex: só os artefatos de spec, sem build:all) e contribuidores OSS interessados em estender para outros agentes.
- **Não é pra:** Times que preferem fluxo conversacional puro sem checkpoints; projetos que não usam agentes de código; quem quer um SaaS hospedado (KSDD é local-first, CLI-only).

## 6. Referências

- **Google Stitch (`design.md` spec)** — adotado integralmente como formato do artefato final. KSDD gera `DESIGN.md` 100% compatível.
- **SPEC Development model** — citado no README como inspiração filosófica (checkpoints obrigatórios, aprovação ativa).
- **Skill ecosystems (Claude skills, Codex skills/custom prompts)** — KSDD adota as duas convenções nativas para distribuição.
- **`[verificar]`** Outras referências (Linear specs, Amazon working backwards, etc.) não estão documentadas no projeto — confirmar com mantenedor.

## 7. Escopo MVP

**Já entregue (até v0.5.0):**

- 8 slash commands: `start`, `spec`, `tech`, `design`, `new:feature`, `build:feature`, `build:all`, `setup`
- 4 artefatos canônicos gerados (brainstorm, SPEC, architecture, DESIGN) + feature-level (`docs/FEATURE-*.md`, BUILD-PLAN.md, tasks)
- Instalador CLI Node.js (`bin/ksdd.js`) com `install` / `install --codex` / `uninstall` / `status` / `help`
- Distribuição via npm (`@kognar/ksdd`) com postinstall hook
- Suporte dual: Claude Code (`~/.claude/commands/`) + OpenAI Codex (`~/.codex/prompts/` + `~/.agents/skills/ksdd/`)
- 9 referências canônicas (`references/`) + 4 agents (`agents/`)
- Sistema de 7 approval gates documentados
- Comando `/ksdd:setup` para reverse-engineering de projetos existentes (v0.5.0)
- Licença AGPL-3.0 + CONTRIBUTING.md

**Fora do MVP (roadmap futuro confirmado com mantenedor):**

- Suporte a Cursor, Windsurf, Cline
- Integração nativa com design tools (Figma, Pencil, Stitch — exportadores/importadores)
- `[verificar]` Lint/validador autômato de SPEC.md (não confirmado no roadmap)

## 8. Modelo de negócio (hipótese inicial)

**Open source gratuito sob AGPL-3.0.** Confirmado com mantenedor: sem monetização direta, sem plano comercial futuro imediato. AGPL como copyleft forte garante que forks/derivados redistribuídos sigam a mesma licença.

Sustentabilidade vem do uso interno da Kognar LLC + contribuições OSS da comunidade. Não há SaaS hospedado, conta paga, ou tier premium previsto.

## 9. Restrições conhecidas

- **Tecnológicas:**
  - Node ≥ 16 (declarado em `package.json` engines)
  - Distribuição via npm — depende do ciclo do registry público
  - CommonJS (não ESM) — escolha mantida por compatibilidade com Node 16+ sem flags
  - Zero dependências runtime no CLI (`bin/ksdd.js` usa só `fs`, `path`, `os`)
- **Licença:** AGPL-3.0 impede uso comercial fechado de forks que sejam expostos via rede
- **Plataforma:** depende das convenções de `~/.claude/commands/` e `~/.codex/prompts/` — mudanças quebrantes nesses agentes exigem retrabalho
- **Equipe:** mantida por Kognar LLC (autor único visível no git: Cleiton Tavares) — capacidade de manutenção limitada por isso

## 10. Perguntas em aberto

- Como medir adoção? (instalações npm, stars, issues ativas) — `[verificar]` métricas não documentadas
- Estratégia para validar suporte a novos agents (Cursor/Windsurf/Cline) — convenções de cada um diferem
- Como manter os 4 templates canônicos consistentes quando múltiplos agents tiverem opiniões diferentes sobre formato
- Política de versionamento: 0.x → 1.0 quando? Existe critério explícito para marcar estabilidade?
- Gestão de contribuições externas — quem pode aprovar mudanças nos templates canônicos vs nos commands?

---

**Próximo passo:** Este brainstorm foi gerado por reverse-engineering. Revise, aprove (mude `Status:` para `Aprovado`) e então rode `/ksdd:spec` se quiser regenerar o SPEC a partir dele — ou continue para a próxima etapa do `/ksdd:setup`, que já gerou `SPEC.md` e `architecture.md` neste fluxo.
