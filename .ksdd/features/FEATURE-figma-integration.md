# Feature: Integração Figma (Exportador DESIGN.md → Figma via MCP)

> Slash command que orquestra o MCP oficial do Figma para materializar tokens do `DESIGN.md` (Google Stitch) como Figma Variables, fechando a ponte spec ↔ design tool sem KSDD ganhar runtime de rede.

**Slug:** figma-integration
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 27/05/2026
**Projeto:** KSDD (Kognar Spec-Driven Design & Development)
**Fase do roadmap:** Fase 6 — Integração com design tools (`.ksdd/specs/SPEC.md` seção 14 + `.ksdd/specs/architecture.md` seção 12)

---

## 1. Motivação

### 1.1 Problema / Oportunidade

Hoje o fluxo KSDD termina no `DESIGN.md` Google Stitch e o usuário fica com um artefato Markdown excelente para AI tooling (Cursor, Lovable, v0, Stitch) mas inerte no Figma — a ferramenta onde designers de produto efetivamente operam. As três personas confirmadas pelo mantenedor (Marina, Rafa, Lia — `.ksdd/specs/SPEC.md` §2) reclamam que precisam transcrever manualmente cada token para Figma Variables, perdendo justamente o ganho de "spec é a fonte da verdade".

A oportunidade é dupla:

1. **Fechar o ciclo Stitch → Figma** que o roadmap (`.ksdd/specs/SPEC.md` §14 Fase 6, `.ksdd/specs/architecture.md` §12 Fase 6) marca como **Próximo**.
2. **Usar MCP em vez de runtime próprio**, evitando quebrar ADR-001 (zero deps runtime) e ADR-003 (KSDD como conteúdo distribuído, não runtime). O Figma já publica MCP oficial (Dev Mode MCP / Make MCP) que expõe tools de manipulação de Variables — KSDD só precisa **orquestrar** essa chamada a partir do `DESIGN.md`.

### 1.2 Personas Impactadas

- **Marina — Product Designer / PM solo (`.ksdd/specs/SPEC.md` §2.1):** ganho principal. Para de transcrever tokens à mão; o `DESIGN.md` que ela versiona no repo passa a render no Figma com um único `/ksdd:figma:export`. Mata a frustração de "perder contexto entre sessões" — o Figma e o repo ficam alinhados pelo mesmo artefato.
- **Rafa — Founder técnico solo (`.ksdd/specs/SPEC.md` §2.2):** ganho secundário. Quando contrata designer/agência, entrega `DESIGN.md` aprovado + comando para o designer materializar no Figma em segundos.
- **Lia — Tech lead em agência (`.ksdd/specs/SPEC.md` §2.3):** ganho terciário. Entrega para o cliente o `DESIGN.md` + instruções de export — cliente fica autônomo para iterar no Figma sem refém da agência.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Tempo médio para materializar `DESIGN.md` no Figma (manual hoje vs. `/ksdd:figma:export`) | manual ~30-60 min → MCP < 2 min | v0.9.0 + 1 mês |
| Cobertura de tokens exportados (colors + typography + spacing + rounded) | 100% das 4 categorias do escopo v1 | v0.9.0 |
| Issues abertas reportando bug de mapeamento Stitch → Figma Variables | ≤ 3 nas primeiras 2 semanas pós-release | v0.9.0 + 2 semanas |
| Projetos KSDD documentados publicamente que usam o export | ≥ 1 (dogfood com fixture sintética) | v0.9.0 |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Novo slash command** `/ksdd:figma:export` (Claude), `/prompts:ksdd-figma-export` (Codex), `/ksdd-figma-export` (opencode) — convenção idêntica a `new:feature` / `build:feature`.
- **Pipeline de export orientado por MCP oficial Figma:**
  1. Comando lê `.ksdd/specs/DESIGN.md` (fallback raiz `DESIGN.md`).
  2. Valida frontmatter YAML contra `references/design-md-spec.md` (estrutura mínima: pelo menos `name`, `colors` com `primary`).
  3. Normaliza os 4 grupos de tokens — **colors, typography, spacing, rounded** — para payload Figma Variables.
  4. Pergunta ao usuário (batch único) o `FILE_KEY` Figma alvo + nome da coleção de Variables.
  5. Instrui o agente a invocar as tools do MCP oficial Figma para criar/atualizar Variables na coleção.
  6. Reporta diff aplicado (tokens criados / atualizados / pulados) no terminal.
- **Reference de mapeamento canônico** `references/figma-mapping.md` — tabela Stitch token type → Figma Variable type + regras de naming (ex: `colors.primary` → variable `colors/primary` no Figma).
- **Fixture sintética** `references/fixtures/example-DESIGN.md` — `DESIGN.md` mínimo válido cobrindo as 4 categorias do escopo, usada para QA e como exemplo no README.
- **Atualização do agent `critic`** com checklist de qualidade para a invocação de export (DESIGN.md aprovado? frontmatter lint passou? `FILE_KEY` confirmado?).
- **Skill discovery** atualizada em `references/codex-SKILL.md` e `references/opencode-AGENTS.md` para que Codex/opencode descubram o command.
- **Approval gate** novo (Gate 8) documentado em `references/approval-gates.md` — confirmação explícita do `FILE_KEY` e do diff antes de aplicar no Figma.
- **Pré-requisito documentado:** MCP oficial do Figma instalado e autenticado pelo usuário (link no README).

### 2.2 O que fica pra depois

- **Importer Figma → DESIGN.md** — round-trip bidirecional fica para v1.x; o roadmap (`.ksdd/specs/architecture.md` §12 Fase 6) cita "validar export bidirecional com Google Stitch", mas v1 entrega só a direção Stitch → Figma.
- **Export de Components (não só tokens)** — Stitch `components:` block (button-primary, etc.) → Figma Components/Variants. Tecnicamente possível via MCP, mas escopo grande; v1 cobre só Variables.
- **Modos (light/dark)** — Figma Variables suportam modes; v1 exporta modo único. Suporte multi-modo entra quando `DESIGN.md` upstream padronizar (Stitch alpha ainda não modela).
- **CI/CD gate** que valida `DESIGN.md` antes do export — quando suite de testes existir (`.ksdd/specs/architecture.md` §12 Fase 7).
- **Exportador para Pencil** e **validação bidirecional Stitch** — features separadas da mesma Fase 6, com slugs próprios (`pencil-integration`, `stitch-roundtrip`).

### 2.3 O que NÃO é essa feature

- **Não é um plugin Figma nativo** (não publicamos no Figma Community).
- **Não é um MCP server próprio do KSDD** — KSDD continua sem runtime de rede; só orquestra MCP de terceiro.
- **Não é uma integração via REST API direta** (`fetch` no `bin/ksdd.js`) — quebraria ADR-001 (zero deps) e ADR-003.
- **Não inclui setup automático do MCP do Figma** — usuário instala/autentica conforme docs do Figma; KSDD só linka o procedimento.
- **Não substitui o `npx @google/design.md lint`** — esse lint do `DESIGN.md` continua sendo responsabilidade do `/ksdd:design`. O export confia que o input já é válido (mas faz sanity check mínimo).

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (designer) | rodar `/ksdd:figma:export` no projeto e ver tokens do meu `DESIGN.md` criados como Figma Variables | parar de transcrever cor/typo/spacing manualmente quando atualizo o spec |
| US-02 | Rafa (founder) | passar para meu designer um `DESIGN.md` + comando único que materializa no Figma | reduzir fricção de onboarding de designer sem ter que documentar processo |
| US-03 | Lia (tech lead) | entregar pro cliente `DESIGN.md` versionado + instruções de `/ksdd:figma:export` | cliente continuar iterando no Figma sem refém da agência |
| US-04 | Qualquer persona | ver um diff claro (tokens criados / atualizados / pulados) antes do export confirmar | não sobrescrever Variables existentes do Figma sem aviso |
| US-05 | Mantenedor KSDD | rodar export contra fixture sintética em `references/fixtures/` e validar visualmente no Figma | dogfood o command em release sem precisar de DESIGN.md próprio (KSDD é CLI sem UI) |

---

## 4. Fluxos de Uso

### 4.1 Export inicial (primeira vez no projeto)

**Pré-condição:** `DESIGN.md` aprovado em `.ksdd/specs/DESIGN.md`. MCP oficial Figma instalado e autenticado no agente (Claude Code / Codex / opencode).
**Trigger:** usuário invoca `/ksdd:figma:export` no diretório do projeto.

1. Command lê `.ksdd/specs/DESIGN.md` (fallback raiz).
2. Sanity check do frontmatter (≥ `name`, `colors.primary`); se inválido, aborta com instrução para rodar `/ksdd:design`.
3. Agente apresenta resumo: "Detectei N color tokens, M typography tokens, P spacing tokens, Q rounded tokens. Vou criar uma coleção Figma Variables chamada `[design.name]`."
4. Pergunta batch (Gate 8 — entrada): (a) `FILE_KEY` Figma alvo (b) nome da coleção (default = `design.name` do frontmatter) (c) sobrescrever Variables com nomes colidentes? (sim/não, default não).
5. Agente normaliza tokens conforme `references/figma-mapping.md` em payload Figma Variables.
6. Agente invoca tool do MCP oficial Figma — sequência: criar coleção (se não existe) → criar/atualizar cada Variable.
7. Reporta diff: "✓ 12 colors criadas, ✓ 8 typography, ✓ 5 spacing, ✓ 4 rounded · 0 pulados · 0 erros."

**Sucesso:** Coleção de Variables no Figma reflete 100% dos 4 grupos do `DESIGN.md`. Diff persistido em terminal output (sem arquivo de log — KSDD permanece stateless por ADR-003).
**Erro / edge case:**
- `DESIGN.md` inválido → aborta antes de chamar MCP.
- MCP do Figma não instalado → mensagem amarela: "Instale o MCP do Figma (link na docs); /ksdd:figma:export precisa dele."
- Tool MCP falha (auth, FILE_KEY inválido, rate limit) → reporta a falha do MCP cru + sugere comando de retry.

### 4.2 Re-export após edit do `DESIGN.md`

**Pré-condição:** export anterior já rodou. Usuário editou `DESIGN.md`.
**Trigger:** `/ksdd:figma:export` novamente.

1-3. Igual ao 4.1.
4. Pergunta batch detecta que a coleção provavelmente já existe → default de "sobrescrever colidentes" pode ser sim (com aviso explícito).
5. Normaliza + invoca MCP em modo "upsert".
6. Reporta diff incremental: "✓ 2 atualizados, ✓ 1 criado, ↻ 9 inalterados, 0 pulados."

**Sucesso:** Coleção Figma sincronizada com o novo estado do `DESIGN.md`.
**Erro:** se um token foi removido do `DESIGN.md` mas existe na coleção Figma, **mantém** o Variable no Figma e reporta como "↻ órfão" — v1 não deleta (decisão conservadora; deleção entra como flag opcional em v2).

### 4.3 Dogfood / QA pelo mantenedor

**Pré-condição:** desenvolvendo localmente o KSDD; sem `DESIGN.md` próprio.
**Trigger:** mantenedor copia `references/fixtures/example-DESIGN.md` para `/tmp/<proj>/.ksdd/specs/DESIGN.md` e roda `/ksdd:figma:export` apontando para um arquivo Figma sandbox pessoal.

Fluxo igual a 4.1, com expectativa de criar exatamente os tokens listados na fixture.

**Sucesso:** todos os tokens da fixture aparecem no arquivo Figma sandbox; QA-REPORT documenta a screenshot do Figma como evidência.

---

## 5. Impacto em Telas Existentes

### 5.1 Telas Modificadas

**Não aplicável** — KSDD não tem UI gráfica (`.ksdd/specs/SPEC.md` §7: "KSDD não tem UI"). Substituído por **superfícies de interação**:

| Superfície (`.ksdd/specs/SPEC.md` §7) | O que muda | Onde | Por quê |
|---------------------------------------|------------|------|---------|
| `7.2 Slash commands (Claude Code)` | Adiciona `ksdd:figma:export` à lista de 8 commands existentes | `~/.claude/commands/ksdd:figma:export.md` | Surface principal da feature |
| `7.3 Custom prompts (Codex)` | Adiciona `ksdd-figma-export` | `~/.codex/prompts/ksdd-figma-export.md` | Paridade multi-agent |
| `7.4 Slash commands (opencode)` | Adiciona `ksdd-figma-export` | `~/.config/opencode/commands/ksdd-figma-export.md` | Paridade multi-agent |
| `7.5 Skill instalada` | Adiciona `references/figma-mapping.md` + `references/fixtures/example-DESIGN.md` ao bundle | `~/.claude/skills/ksdd/references/` (e equivalentes Codex/opencode) | Agente acessa mapping + fixture |
| `ksdd help` (CLI) | Sem mudança | `bin/ksdd.js` | Help do CLI não enumera slash commands (sempre delegou aos agentes) |
| `ksdd status` (CLI) | Conta os novos arquivos automaticamente via `tracked[]` | `bin/ksdd.js` | Lógica idempotente já existente |

### 5.2 Telas Novas

**Não aplicável** — sem novas superfícies além do command/prompts/skill files acima.

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

| Entidade | Atributos críticos | Relações |
|----------|-------------------|----------|
| **Figma Variables payload** (em memória, transiente — gerado pelo agente durante export) | `collectionName: string`, `variables: [{ name, type, value, mode }]` (forma do payload definida em `references/figma-mapping.md`) | Derivado 1:1 do frontmatter YAML do `DESIGN.md` |
| **Fixture sintética** (artefato versionado no repo) | `references/fixtures/example-DESIGN.md` — DESIGN.md mínimo cobrindo `colors`, `typography`, `spacing`, `rounded` | Distribuída via `copyDir` para `~/.claude/skills/ksdd/references/fixtures/` (e equivalentes Codex/opencode) |

Nenhum dado é persistido no projeto-alvo além do `DESIGN.md` que já existe. Sem log, sem cache local — alinhado com ADR-003.

### 6.2 Alterações em Entidades Existentes

| Entidade (`.ksdd/specs/SPEC.md` §4) | Alteração | Migração |
|--------------------------|-----------|----------|
| `.ksdd-manifest.json` | Inclui novos paths em `targets.claude` / `targets.codex` / `targets.opencode` (command + reference + fixture) | Não — `installClaude/Codex/Opencode` populam `tracked[]` automaticamente |
| `references/` bundle | Adiciona `figma-mapping.md` e subdir `fixtures/` | Não — `copyDir` é recursivo |
| `references/codex-SKILL.md` e `references/opencode-AGENTS.md` | Adicionam menção ao novo command no discovery | str_replace direto |

---

## 7. Impacto na API

API equivalente é a **superfície CLI + slash commands** (`.ksdd/specs/architecture.md` §4).

### 7.1 Novos Endpoints

Não aplicável (sem HTTP). Novo **slash command**:

```
/ksdd:figma:export        Lê DESIGN.md → normaliza → invoca MCP oficial Figma p/ criar/atualizar Variables
/prompts:ksdd-figma-export  (Codex equivalente)
/ksdd-figma-export        (opencode equivalente)
```

### 7.2 Endpoints Modificados

| CLI / API (`.ksdd/specs/architecture.md` §4) | Alteração |
|----------------------------------------------|-----------|
| `bin/ksdd.js` `installClaude/Codex/Opencode` | Nenhuma alteração de lógica — `copyDir` recursivo absorve `commands/figma:export.md` e `references/fixtures/` automaticamente |
| `bin/ksdd.js` `codexPromptBasename` | Já cobre conversão `figma:export.md` → `ksdd-figma-export.md` (mesma lógica de `new:feature.md`) |
| `ksdd status` | Sem alteração de código; contagem reflete novos arquivos |

### 7.3 Integrações Externas

| Serviço | Propósito | Auth | Mudança |
|---------|-----------|------|---------|
| **MCP oficial do Figma** (Dev Mode MCP / Make MCP) | Tools para criar/atualizar Figma Variables a partir do agente | Personal Access Token Figma (gerenciado pelo MCP, não pelo KSDD) | **Nova dependência externa**, mas opcional e instalada pelo usuário fora do KSDD. Documentar como pré-requisito no README. |

Esta integração **não** altera `.ksdd/specs/architecture.md` §5 ("KSDD não faz nenhuma chamada de rede em runtime") — quem fala com a rede é o MCP do Figma, não o `bin/ksdd.js`. Aderência a ADR-001/ADR-003 preservada.

---

## 8. Impacto no Design

Não aplicável a este projeto (KSDD é CLI sem UI — `.ksdd/specs/SPEC.md` §3 e §10).

A feature **produz** Figma Variables a partir do `DESIGN.md` dos *projetos-alvo*; ela própria não tem UI gráfica nem consome `DESIGN.md` do KSDD.

### 8.1 Mapeamento Stitch → Figma Variables (resumo)

Regras canônicas detalhadas em `references/figma-mapping.md` (task 029). Resumo:

| Stitch token (`design-md-spec.md`) | Figma Variable type | Naming convention | Notas |
|------------------------------------|---------------------|-------------------|-------|
| `colors.<name>` (`#RRGGBB`) | `COLOR` | `colors/<name>` | Resolve Token References (`{colors.primary}`) antes de criar a Variable |
| `typography.<name>.fontSize` | `FLOAT` | `typography/<name>/fontSize` | Stitch suporta `px`/`rem`/`em`; converter para `FLOAT` em px (com sufixo na descrição) |
| `typography.<name>.lineHeight` | `FLOAT` | `typography/<name>/lineHeight` | Unitless = multiplier do fontSize → multiplicar e gravar em px |
| `typography.<name>.fontWeight` | `FLOAT` | `typography/<name>/fontWeight` | — |
| `typography.<name>.fontFamily` | `STRING` | `typography/<name>/fontFamily` | — |
| `spacing.<level>` | `FLOAT` | `spacing/<level>` | Dimension ou number; normalizar para px |
| `rounded.<level>` | `FLOAT` | `rounded/<level>` | Idem |

`components.<comp>.<prop>` (Stitch §Components) **NÃO** é exportado em v1 — escopo 2.2.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Externa | **MCP oficial do Figma** (Dev Mode MCP / Make MCP) — usuário precisa instalar e autenticar | Disponível publicamente; usuário não-mantenedor | Alto — sem MCP do Figma instalado, command aborta com mensagem instrutiva. KSDD não tem fallback (REST direto quebra ADRs). |
| Técnica | `DESIGN.md` aprovado no projeto-alvo (`.ksdd/specs/DESIGN.md`) | Gerado por `/ksdd:design` existente | Alto — sem `DESIGN.md`, nada a exportar; command aborta com instrução. |
| Técnica | `references/design-md-spec.md` mantido alinhado com Google Stitch alpha | Existe em v0.8.0 | Médio — divergência upstream pode quebrar parse do frontmatter. ADR-008 já cobre. |
| Técnica | ADR-010 (refator `installTarget` genérico) | Pendente, prazo "próxima feature multi-agent" | Baixo — `figma-integration` não adiciona target, só conteúdo. Não bloqueia. |
| Feature | Nenhuma feature KSDD predecessora | — | — |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| API/tools do MCP oficial Figma mudam shape antes do release | Alto | Média | Pinar versão suportada do MCP no README + `references/figma-mapping.md`; smoke test pré-release (task 034) |
| Usuário roda export sem ter MCP do Figma instalado | Médio | Alta no primeiro uso | Sanity check no command: detectar ausência do tool MCP e mostrar instrução clara + link |
| Tokens com `fontFamily` exótica não existem na conta Figma do usuário | Médio | Média | Documentar limitação no README; export cria a Variable mesmo assim, Figma renderiza fallback |
| Conflito de naming entre Variables existentes (colidentes) | Médio | Média | Pergunta batch no fluxo (4.1 passo 4) tem default conservador "não sobrescrever" |
| Stitch alpha evolui formato de tokens (ex: adiciona modes) e fixture/mapping ficam stale | Médio | Média | Versionar `references/figma-mapping.md` por release; CHANGELOG documenta versão Stitch suportada |
| `lineHeight` unitless é interpretado errado por designers no Figma | Baixo | Média | Documentar conversão (multiplier × fontSize → px) na fixture + mapping |
| Auth do MCP do Figma falha silenciosamente (token expirado) | Médio | Média | Reportar mensagem crua do MCP no terminal sem mascarar; sugerir comando de re-auth do MCP |
| Mantenedor único valida QA contra conta Figma pessoal (bus factor de QA) | Médio | Média | Fixture + screenshot no `QA-REPORT.md` (task 034) servem como artefato reproduzível |

---

## 10. Critérios de Aceite

- [ ] `/ksdd:figma:export` instalado em `~/.claude/commands/ksdd:figma:export.md` após `ksdd install`.
- [ ] `/prompts:ksdd-figma-export` instalado em `~/.codex/prompts/ksdd-figma-export.md` após `ksdd install --codex`.
- [ ] `/ksdd-figma-export` instalado em `~/.config/opencode/commands/ksdd-figma-export.md` após `ksdd install --opencode`.
- [ ] `references/figma-mapping.md` documenta as 4 categorias do escopo (colors, typography, spacing, rounded) com tabela canônica de mapeamento Stitch → Figma Variable type + naming.
- [ ] `references/fixtures/example-DESIGN.md` é um `DESIGN.md` mínimo válido (passa `npx @google/design.md lint` sem erros) e cobre as 4 categorias.
- [ ] Em projeto com `.ksdd/specs/DESIGN.md` aprovado e MCP do Figma instalado, rodar o command lê o DESIGN, normaliza tokens conforme `references/figma-mapping.md`, e invoca tools do MCP oficial sem erro.
- [ ] Command aborta com mensagem amarela clara quando `DESIGN.md` ausente, frontmatter inválido, ou MCP do Figma não disponível — sem stack trace cru.
- [ ] Gate 8 (confirmação de `FILE_KEY` + diff antes do apply) documentado em `references/approval-gates.md` e respeitado pelo command (sem encadeamento automático).
- [ ] Default de "sobrescrever colidentes" é **não**; usuário precisa explicitamente confirmar overwrite.
- [ ] Diff final reporta contagens separadas: criados / atualizados / inalterados / pulados / erros.
- [ ] Tokens removidos do `DESIGN.md` mas ainda presentes no Figma são marcados como "↻ órfão" (não deletados em v1).
- [ ] `bin/ksdd.js` `installClaude/Codex/Opencode` copiam os novos arquivos automaticamente via `copyDir` recursivo, sem hardcode adicional.
- [ ] `ksdd status` mostra contagem atualizada após `ksdd install` (paridade com Claude/Codex/opencode).
- [ ] `references/codex-SKILL.md` e `references/opencode-AGENTS.md` mencionam `/ksdd:figma:export` no discovery.
- [ ] Agent `critic` ganha checklist específico para a invocação de export (DESIGN.md aprovado, frontmatter lintado, FILE_KEY confirmado, diff revisado).
- [ ] `.ksdd/specs/SPEC.md` §7.2/§7.3/§7.4 lista o novo command; §14 Fase 6 marca "Exportador para Figma" como **Em andamento (v0.9.0)** ou **Entregue (v0.9.0)** após o release.
- [ ] `.ksdd/specs/architecture.md` §12 Fase 6 reflete a entrega; novo ADR-011 documenta a decisão de "orquestrar MCP oficial em vez de runtime próprio".
- [ ] README atualizado com seção "Integração Figma" — pré-requisitos (MCP oficial Figma), uso (`/ksdd:figma:export`), limitações conhecidas (modes, components).
- [ ] CHANGELOG documenta a feature; `package.json` bump para `0.9.0`.
- [ ] QA dogfood (task 034) reproduz export contra `references/fixtures/example-DESIGN.md` num arquivo Figma sandbox; QA-REPORT.md com screenshot anexa evidência.

---

## 11. Fases de Implementação

### Fase 1 — Núcleo do export (P0)
- [ ] Slash command `commands/figma:export.md` (T-028)
- [ ] Reference de mapeamento `references/figma-mapping.md` (T-029)
- [ ] Fixture sintética `references/fixtures/example-DESIGN.md` (T-030)
- [ ] Dogfood QA contra a fixture com MCP do Figma real (T-034)

### Fase 2 — Integração com o resto do KSDD (P1)
- [ ] Agent `critic` + skill discovery (`codex-SKILL.md`, `opencode-AGENTS.md`) (T-031)
- [ ] Atualizar SPEC.md + architecture.md (ADR-011) (T-032)
- [ ] README + INSTALL + CHANGELOG + bump `0.9.0` (T-033)

---

**Referências:**
- `.ksdd/specs/SPEC.md` — §1.4 (Stitch como referência), §2 (personas), §7.2-§7.5 (superfícies), §14 Fase 6 (roadmap)
- `.ksdd/specs/architecture.md` — §1 (visão), §2.2 (zero deps), §4 (CLI/commands), §5 (integrações externas), §10 ADR-001/003/008/010, §12 Fase 6
- `.ksdd/specs/brainstorm.md` — visão original
- `references/design-md-spec.md` — schema Google Stitch (input do export)
- `references/approval-gates.md` — Gate 8 a adicionar
- `references/codex-SKILL.md`, `references/opencode-AGENTS.md` — discovery skill files
