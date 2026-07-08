# Fix: Contagem de slash commands inconsistente nos artefatos KSDD

> A documentação do próprio KSDD afirma números diferentes de slash commands em lugares diferentes (8 × 9 × 11) e a lista canônica do SPEC omitia `ksdd:archive` — quem lê não sabe quantos commands existem. Impacto: confusão/erro de onboarding, sem risco funcional.

**Slug:** spec-command-count
**Severidade:** Baixa — impacto no usuário (documentação enganosa; nenhum comportamento de runtime afetado)
**Status:** Aprovado
**Data:** 08/07/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

> **Nota:** primeiro FIX doc do repo, gerado como dogfood do fluxo `/ksdd:new:fix` (task 053 da feature `new-fix-command`).

---

## 1. Bug

**O que acontece:** os artefatos KSDD declaram a contagem de slash commands em prosa, e essas declarações divergem entre si:
- `SPEC.md §1.2` dizia "**8 slash commands**".
- `SPEC.md §7.2` listava **8** commands e **omitia `ksdd:archive`** (entregue na v0.7.0).
- `SPEC.md §7.5/§7.7` (Antigravity/Copilot) diziam "os **9 commands**".
- `brainstorm.md §3` diz "instala **8 slash commands**".

**O que deveria acontecer:** todos os pontos em tempo presente devem declarar o mesmo número — **11** após a v0.11.0 (`start, spec, tech, design, new:feature, new:fix, build:feature, build:fix, build:all, setup, archive`) — e a lista canônica (§7.2) deve enumerar os 11.

Reportado durante o dogfood da feature `new-fix-command`; sempre reproduzível (é estático nos arquivos).

---

## 2. Reprodução

**Ambiente:** repo na branch da feature `new-fix-command` (base v0.10.0 → v0.11.0).
**Comando/teste que dispara:** `grep -rn "slash command" .ksdd/specs/ README.md INSTALL.md`

1. Rodar o grep acima.
2. Observar "8 slash commands" (SPEC §1.2, brainstorm §3), "9 commands" (SPEC §7.5/§7.7, README, INSTALL) e a lista de 8 em SPEC §7.2 sem `archive`.
3. Contar os arquivos reais: `ls commands/*.md` → 11 (após v0.11.0).

**Resultado atual:** três números diferentes para a mesma grandeza. **Determinístico?** sempre.

---

## 3. Root cause

**Hipótese:** a contagem de commands foi escrita como número mágico em prosa em vários artefatos e **nunca teve uma fonte única de verdade**. Cada release que adicionou um command atualizou alguns pontos e esqueceu outros.

**Evidência (`arquivo:seção`):**
- `.ksdd/specs/SPEC.md:§1.2` — "8 slash commands": parou no baseline pré-`archive` (a v0.7.0 adicionou `archive` e não atualizou aqui).
- `.ksdd/specs/SPEC.md:§7.2` — lista de 8 sem `archive`: mesma origem.
- `.ksdd/specs/SPEC.md:§7.5`/`§7.7` — "9 commands": atualizado na era Antigravity/Copilot (v0.9.0/v0.10.0), mas divergiu de §1.2/§7.2.
- `.ksdd/specs/brainstorm.md:§3` — "8 slash commands": snapshot reverse-engineered de v0.5.0 nunca revisto em tempo presente.

**Cadeia causal:** command novo entregue → contagem existe em N lugares de prosa → só alguns são atualizados → divergência acumula a cada release.

---

## 4. Componentes afetados / blast radius

| Componente / arquivo | Papel no bug | Risco ao tocar |
|----------------------|--------------|----------------|
| `.ksdd/specs/SPEC.md` | declara a contagem em §1.2/§7.2/§7.5/§7.7 | Baixo (doc) |
| `.ksdd/specs/brainstorm.md` | declara em §3 (tempo presente) e §7 (histórico v0.5.0) | Baixo (doc) |
| `README.md` / `INSTALL.md` | declaram "9 commands" | Baixo (doc) |

**O que o ajuste toca:** apenas texto de documentação. **O que pode quebrar junto:** nada de runtime — `bin/ksdd.js` deriva os commands de `COMMAND_FILES`, não da prosa; nenhum código lê esses números.

---

## 5. Ajuste proposto

Reconciliar toda menção **em tempo presente** para **11** e enumerar os 11 commands na lista canônica (§7.2). Preservar as menções **historicamente corretas** (ex.: brainstorm §7 "entregue até v0.5.0: 8 commands", e a evidência dos ADR-011/012 que descreve entregas de v0.9.0/v0.10.0) — mudá-las falsificaria o histórico.

**Aplicado nesta v0.11.0 (inline, dentro da feature `new-fix-command`):**
- SPEC §1.2/§7.2/§7.5/§7.7 → 11 + lista completa (task 051).
- README/INSTALL → 11 (task 052).
- `brainstorm.md §3` (tempo presente) → 11 (aplicado por este fix; §7 permanece histórico).

**Caminho de implementação:** inline — mudança documental de baixo risco, aplicada junto da feature que introduziu os 2 commands. A guarda de regressão (evitar recorrência) fica como task `055` (`/ksdd:build:fix` opcional, ou manual).

---

## 6. Critérios de verificação

- [x] `grep -rn "slash commands" .ksdd/specs README.md INSTALL.md` não retorna nenhuma menção **em tempo presente** com número ≠ 11.
- [x] `SPEC.md §7.2` lista os 11 commands, incluindo `ksdd:archive`, `ksdd:new:fix` e `ksdd:build:fix`.
- [x] `ls commands/*.md | wc -l` = 11, batendo com a prosa.
- [x] Menções históricas legítimas (brainstorm §7 v0.5.0; evidência dos ADR-011/012) preservadas.

---

## 7. Estratégia de teste de regressão

Bug **documental** — não há teste unitário de runtime. A regressão recorre toda vez que um command é adicionado sem atualizar a contagem em todos os pontos.

**Guarda proposta (task 055, `para implementar`):** uma checagem de consistência que compara `COMMAND_FILES.length` (fonte de verdade em `bin/ksdd.js`) com a contagem declarada nos artefatos, falhando se divergirem. Enquanto não existir, o item vira parte do checklist de "adicionar um novo command" em `CLAUDE.md`.

**Falha ANTES:** na base atual a checagem acusaria 3 valores distintos (8/9/11) para 11 arquivos reais.
**Passa DEPOIS:** com a reconciliação, a checagem confirma 11 em todos os pontos de tempo presente.

---

## 8. Riscos do ajuste

| Risco / regressão possível | Impacto | Mitigação |
|----------------------------|---------|-----------|
| Mudar por engano uma menção histórica (falsificar release passado) | Baixo | Só tocar menções em tempo presente; preservar §7 do brainstorm e evidências de ADR |
| Recorrência no próximo command adicionado | Médio | Task 055 (guarda de consistência) + checklist em `CLAUDE.md` |

---

## 9. Referências

- `.ksdd/specs/SPEC.md` — §1.2, §7.2, §7.5, §7.7 (contrato quebrado / corrigido na task 051)
- `.ksdd/specs/brainstorm.md` — §3 (tempo presente, corrigido) · §7 (histórico, preservado)
- `README.md` / `INSTALL.md` — contagem (task 052)
- `bin/ksdd.js` — `COMMAND_FILES` (fonte de verdade dos commands)
- Feature: `.ksdd/features/FEATURE-new-fix-command.md` (dogfood — seção 4.6) · Task: `.ksdd/tasks/fix-spec-command-count/055-command-count-consistency-guard.md`
