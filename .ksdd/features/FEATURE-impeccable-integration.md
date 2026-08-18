# Feature: Integração KSDD ↔ impeccable.style (1ª integração / convenção de integrações)

> Costura o handoff do design spec-driven do KSDD (`DESIGN.md` Google Stitch) para a camada de craft/QA do impeccable — 100% conteúdo, opt-in, sem dependência de código — e estabelece `references/integrations/` como convenção reaproveitável (Figma/v0/Pencil seguem depois).

**Slug:** impeccable-integration
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 18/08/2026
**Projeto:** KSDD (Kognar Spec-Driven Design & Development)

---

## 1. Motivação

### 1.1 Problema / Oportunidade

O fluxo KSDD entrega o design como **contrato**: `brainstorm → SPEC → architecture → DESIGN.md` (formato Google Stitch, ADR-008). Mas a partir do `DESIGN.md` o KSDD **não toca mais no design** — o `/ksdd:build:feature` e o `/ksdd:build:all` tratam `DESIGN.md` como read-only (Gate 6/7) e implementam o código. O elo fraco do ciclo é justamente onde o design vira código: não há camada que **eleve e valide o craft** da UI durante o build. É onde "slop" (UI genérica, sem polimento, sem consistência com o contrato) entra sem ser detectado.

O **impeccable** (`pbakaus/impeccable`, Apache-2.0, Node 22.12+) preenche exatamente esse vão: lê e escreve **o mesmo `DESIGN.md` Google Stitch** que o KSDD já produz, e adiciona 23 commands (`shape/critique/audit/polish/craft/live/document…`), 59 regras de "anti-slop" e hooks nos edits de UI — uma camada de craft/QA **no código**, durante a implementação. As fases são complementares, sem sobreposição de responsabilidade:

- **KSDD (spec-driven):** o *contrato* de design (`DESIGN.md`).
- **impeccable (craft/QA):** eleva e valida o design **no código**, durante o build.

Oportunidade dupla: (a) plugar o impeccable com custo mínimo, já que a compatibilidade de formato **já existe** (Google Stitch dos dois lados); (b) usar o impeccable como **primeira integração documentada** de uma convenção reaproveitável — semeando `references/integrations/` para que Figma, v0 e Pencil (Fase 6 do roadmap, "Integração com design tools") sigam o mesmo padrão sem reinventar.

A restrição inegociável: costurar o handoff **sem** criar dependência de código, preservando os tenets do KSDD (zero-dep — ADR-001; conteúdo estático — ADR-003; Node ≥16; AGPL-3.0). A integração é **100% conteúdo** (mesmo padrão do ADR-013), e **não** inventa runtime de plugins no CLI.

### 1.2 Personas Impactadas

- **Marina — Product Designer / PM solo (SPEC seção 2.1):** gera o `DESIGN.md` no `/ksdd:design` e leva para qualquer ferramenta. Com o handoff documentado, ela sabe exatamente como continuar o craft da UI no impeccable sem perder o contrato de design. Ganha um caminho claro do "contrato" ao "código polido".
- **Rafa — Founder técnico solo (SPEC seção 2.2):** durante o build, tem um gate opcional de qualidade de UI (`npx impeccable detect`) que pega slop sem burocracia — alinhado com sua aversão a "ficar escrevendo spec quando podia tar codando".
- **Lia — Tech lead em agência (SPEC seção 2.3):** padroniza a entrega ao cliente incluindo uma etapa de craft/QA opt-in; entrega `DESIGN.md` + `PRODUCT.md` + código auditado. A convenção `references/integrations/` vira parte do playbook padrão da agência.

Nenhuma persona é **forçada** a usar o impeccable — toda a orientação é condicional ("se você usa o impeccable…"), então o fluxo nunca quebra para quem não o tem.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| `references/integrations/*.md` distribuído nos 5 targets sem alterar `bin/ksdd.js` | 100% (Claude, Codex, opencode, Antigravity, Copilot) | no release 0.12.0 |
| `DESIGN.md` gerado pelo `/ksdd:design` passa `@google/design.md lint` (contrato de interop) | passa | no release 0.12.0 |
| Convenção documentada e replicável (doc de "como adicionar a próxima integração") | 1 README de convenção + 1 integração de exemplo | no release 0.12.0 |
| Zero regressão: `node -c bin/ksdd.js` e install/uninstall inalterados | sem diff em `bin/ksdd.js` | no release 0.12.0 |

---

## 2. Escopo

### 2.1 O que entra (v1)

1. **Convenção de integrações** — `references/integrations/README.md`: o que um doc de integração precisa conter, o princípio "sempre handoff/opt-in, nunca dependência de código", como são distribuídas (bundle via `copyDir`, sem tocar o CLI) e como adicionar a próxima (Figma/v0/Pencil).
2. **Doc canônico da 1ª integração** — `references/integrations/impeccable.md`: o que é o impeccable e quando acionar cada command por fase (design vs build); a garantia de compat (mesmo Google Stitch; passar `@google/design.md lint` = compat); o **path bridge** (`.ksdd/specs/` ↔ raiz); o mapeamento **SPEC → PRODUCT.md** (Users, Mode `brand|product`, Brand voice, Anti-references); e a receita do **slop detector como gate** (`npx impeccable detect <ui-paths>`).
3. **Handoff no `/ksdd:design`** — bloco "Integração impeccable (opcional)" no checkpoint (Step 7) apontando `/impeccable craft|audit|polish|live` + path bridge; e um passo opcional (5.5) que emite `PRODUCT.md` a partir de SPEC/brainstorm/personas, se o usuário optar.
4. **Craft/QA no `/ksdd:build:feature`** — no bloco de tasks de design/frontend (§4.5), orientação condicional "rode `/impeccable shape|critique` antes e `/impeccable audit|polish` depois nas tasks de UI"; e um **quality gate opcional** de UI (§4.8/§6): "Slop detector (impeccable): `npx impeccable detect <ui-paths>`" — opt-in, não bloqueia quem não tem.
5. **Nota de interop** — `references/design-md-spec.md` ganha "## Interop com impeccable" (mesmo Google Stitch; `@google/design.md lint` = garantia; pointer para o doc + path bridge).
6. **Registro arquitetural** — ADR-014 em `architecture.md` (convenção de integrações: conteúdo-only, por que não framework de plugins, por que não incorre na dívida ADR-010/011/012); nota breve em `CLAUDE.md` sobre `references/integrations/`.
7. **Release** — nova seção "## Integrações" no `README.md`; `CHANGELOG.md` + bump `package.json` **0.11.0 → 0.12.0** (minor, backward-compatible).
8. **(Opcional, P2)** — nota em `agents/critic.md` de que as regras de slop do impeccable complementam o checklist do `DESIGN.md`.

### 2.2 O que fica pra depois

- **Integrações Figma / v0 / Pencil** — a convenção é semeada agora, mas cada integração é sua própria feature (Fase 6 do roadmap). Só o impeccable entra na v1.
- **Detecção rígida do impeccable / auto-invocação** — nada de "se detectar impeccable instalado, rodar automaticamente". Tudo permanece manual e condicional.
- **Command KSDD que "embrulhe" o impeccable** — explicitamente fora (ver 2.3). Usa-se os commands nativos do impeccable.
- **Reflexo da convenção no SPEC.md (Fase 6 roadmap)** — o registro canônico da decisão vive em ADR-014 (`architecture.md`); um alinhamento cosmético do SPEC pode vir num polimento futuro, não é gate desta feature.

### 2.3 O que NÃO é essa feature

- **Não é** um framework/registry de plugins no CLI. Nenhuma detecção rígida, nenhum runtime, nada em `bin/ksdd.js`.
- **Não é** dependência de código: o KSDD **nunca** faz `require('impeccable')` nem entra em `package.json`. O usuário instala o impeccable por conta (`npx impeccable install` / marketplace). Node 22.12+ é problema do usuário; o KSDD segue Node ≥16.
- **Não é** vendorização de conteúdo do impeccable (mantém a fronteira AGPL-3.0 × Apache-2.0 limpa — só linkamos/referenciamos, não copiamos o conteúdo deles).
- **Não é** um novo slash command KSDD, nem um novo target de instalação — logo **não** dispara o refator `installTarget(targetConfig)` (ADR-012 intocado).
- **Não é** mudança no comportamento read-only do build sobre `DESIGN.md` (Gate 6/7): o impeccable atua sobre o *código*, não sobre os artefatos KSDD.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (designer/PM) | ao terminar o `/ksdd:design`, ver um passo claro de como continuar o craft no impeccable | levar o `DESIGN.md` do contrato ao código polido sem perder consistência |
| US-02 | Rafa (founder solo) | um gate opcional de UI no build que detecta slop | subir qualidade de UI sem adicionar processo pesado |
| US-03 | Lia (tech lead) | uma convenção documentada de integrações + um exemplo real | padronizar a etapa de craft/QA na entrega ao cliente e adicionar Figma/v0/Pencil depois pelo mesmo padrão |
| US-04 | Usuário sem impeccable | que toda a orientação seja condicional e opt-in | rodar o fluxo KSDD inteiro sem nunca ser bloqueado por uma ferramenta que não instalei |
| US-05 | Mantenedor do KSDD | adicionar a integração sem tocar `bin/ksdd.js` nem `package.json` | preservar zero-dep (ADR-001), conteúdo estático (ADR-003) e não disparar o refator `installTarget` |
| US-06 | Contribuidor futuro | um doc "como adicionar a próxima integração" | criar a integração Figma/v0/Pencil sem reengenharia, seguindo o padrão do impeccable |

---

## 4. Fluxos de Uso

### 4.1 Handoff design → impeccable (fluxo principal)

**Pré-condição:** `DESIGN.md` gerado pelo `/ksdd:design` (formato Google Stitch, em `.ksdd/specs/DESIGN.md`), impeccable instalado pelo usuário.
**Trigger:** usuário chega ao checkpoint do `/ksdd:design` (Step 7).

1. `/ksdd:design` gera o `DESIGN.md` normalmente (spec-driven, inalterado).
2. No checkpoint (Step 7), aparece o bloco "Integração impeccable (opcional)": explica que o `DESIGN.md` já é Google Stitch e aponta `/impeccable craft|audit|polish|live` + o path bridge, referenciando `references/integrations/impeccable.md`.
3. (Opcional, passo 5.5) Se o usuário optar, o command emite `PRODUCT.md` a partir de SPEC/brainstorm/personas conforme o mapeamento no doc de integração (respeitando `references/language-policy.md`).
4. Usuário aplica o path bridge (`ln -s .ksdd/specs/DESIGN.md DESIGN.md`, ou `--path` se o impeccable suportar) e roda os commands nativos do impeccable.

**Sucesso:** o usuário tem um caminho documentado do contrato de design ao craft no código, sem o KSDD depender do impeccable.
**Erro / edge case:** usuário sem impeccable — o bloco é claramente opt-in; o fluxo do `/ksdd:design` termina normalmente ignorando o bloco.

### 4.2 Craft/QA durante o `/ksdd:build:feature`

**Pré-condição:** feature com tasks de UI (`area: frontend`/`design`), impeccable instalado.
**Trigger:** `/ksdd:build:feature` chega numa task de UI.

1. No bloco de design/frontend (§4.5), a orientação condicional sugere `/impeccable shape|critique` **antes** de implementar a UI e `/impeccable audit|polish` **depois**.
2. Nos quality gates (§4.8/§6), o gate opcional de UI roda `npx impeccable detect <ui-paths>` sobre o código gerado.
3. Se o detector aponta slop, o usuário corrige antes de fechar a task; se não há impeccable, o gate é simplesmente pulado (não bloqueia).

**Sucesso:** UI implementada com craft validado, sem alterar o comportamento read-only do build sobre `DESIGN.md`.
**Erro / edge case:** sem impeccable → gate opt-in pulado silenciosamente; o build segue com os gates padrão.

### 4.3 Adicionar a próxima integração (convenção)

**Pré-condição:** contribuidor quer integrar Figma/v0/Pencil.
**Trigger:** leitura de `references/integrations/README.md`.

1. Contribuidor lê a convenção: doc de integração é sempre handoff/opt-in, nunca dependência de código; é distribuído automaticamente por `copyDir` de `references/`; segue a estrutura do `impeccable.md` como exemplo.
2. Cria `references/integrations/<tool>.md` seguindo a estrutura canônica.
3. Nenhuma mudança em `bin/ksdd.js` é necessária — o novo arquivo já cai no bundle de todos os targets.

**Sucesso:** nova integração distribuída em todos os targets com zero CLI change.

---

## 5. Impacto em Superfícies e Artefatos Existentes

### 5.1 Superfícies modificadas

| Superfície / arquivo | O que muda | Por quê |
|----------------------|------------|---------|
| `commands/design.md` | Step 7 ganha bloco "Integração impeccable (opcional)"; novo passo opcional 5.5 (emitir `PRODUCT.md`) | expor o handoff design → craft no ponto natural (fim do design) |
| `commands/build:feature.md` | §4.5 (bloco design/frontend) ganha orientação condicional `/impeccable shape\|critique\|audit\|polish`; §4.8 + §6 ganham gate opcional `npx impeccable detect` | expor o craft/QA no build, onde a UI vira código |
| `references/design-md-spec.md` | nota "## Interop com impeccable" (mesmo Google Stitch; `@google/design.md lint`; pointer + path bridge) | documentar o contrato de interoperabilidade no artefato que define o `DESIGN.md` |
| `.ksdd/specs/architecture.md` | ADR-014 (convenção de integrações) | registrar a decisão arquitetural (conteúdo-only, sem framework de plugins) |
| `CLAUDE.md` | nota breve sobre `references/integrations/` para agentes futuros | orientar quem for adicionar a próxima integração |
| `README.md` | nova seção "## Integrações" (impeccable como a primeira) | descoberta pública da capacidade |
| `CHANGELOG.md` / `package.json` | entrada 0.12.0 + bump de versão | release |
| `agents/critic.md` *(opcional, P2)* | citar que as regras de slop do impeccable complementam o checklist do `DESIGN.md` | reforço de qualidade, sem tornar obrigatório |

### 5.2 Superfícies novas

- **`references/integrations/README.md`** — define a convenção de integrações (o que um doc precisa conter, princípio handoff/opt-in, distribuição via `copyDir`, como adicionar a próxima).
- **`references/integrations/impeccable.md`** — doc canônico da 1ª integração (fases, compat, path bridge, mapeamento SPEC→PRODUCT.md, slop detector como gate).

Ambos entram no bundle de skill de **todos os 5 targets** automaticamente, porque `installClaude/Codex/Opencode/Antigravity/Copilot` chamam `copyDir(references, …)` recursivamente. Não há entrada nova em `COMMAND_FILES`, nenhuma `install*` nova, **zero mudança em `bin/ksdd.js`**.

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades (artefatos)

| Entidade | Atributos / conteúdo | Relações |
|----------|---------------------|----------|
| `references/integrations/README.md` | doc da convenção (distribuído no bundle de todos os targets) | referenciado por `impeccable.md` e por integrações futuras |
| `references/integrations/impeccable.md` | doc de integração canônico | referenciado por `commands/design.md`, `commands/build:feature.md`, `references/design-md-spec.md` |
| `PRODUCT.md` (gerado, opcional) | Users, Mode `brand\|product`, Brand voice, Anti-references — derivado de SPEC/brainstorm/personas | consumido pelo impeccable via path bridge; **artefato do usuário**, não do repo KSDD |

**Path bridge:** o impeccable espera `DESIGN.md`/`PRODUCT.md` na **raiz** do projeto; o KSDD grava em `.ksdd/specs/`. A ponte documentada é `ln -s .ksdd/specs/DESIGN.md DESIGN.md` (ou `cp`; idem `PRODUCT.md`). A implementação deve **verificar na doc do impeccable** se ele aceita flag de path (ex. `--path .ksdd/specs`); se sim, documentar como alternativa ao symlink. Default: symlink/`cp` a partir de `.ksdd/specs/` (mantém a convenção KSDD como fonte da verdade).

### 6.2 Alterações em Entidades Existentes

| Entidade | Alteração | Migração |
|----------|-----------|----------|
| `DESIGN.md` (SPEC seção 4.2) | nenhuma no formato — segue Google Stitch; só ganha nota de interop no spec | não |
| Manifest `.ksdd-manifest.json` | os novos arquivos `references/integrations/*` entram em `targets.<agente>` automaticamente (via `tracked`) — uninstall remove limpo | não (transparente) |

---

## 7. Impacto na "API" (superfície CLI)

**Nenhuma mudança em `bin/ksdd.js`.** Este é um princípio central da feature (consistente com ADR-013):

### 7.1 Novos "endpoints"

- Nenhum subcomando CLI novo, nenhuma flag nova, nenhuma env var nova.

### 7.2 Superfícies modificadas

- `references/` passa a conter o subdiretório `integrations/`, copiado recursivamente por `copyDir` para o bundle de cada target:
  - `~/.claude/skills/ksdd/references/integrations/`
  - `~/.agents/skills/ksdd/references/integrations/`
  - `~/.config/opencode/ksdd/references/integrations/`
  - `~/.gemini/ksdd/references/integrations/`
  - `<vscode-user>/ksdd/references/integrations/`
- Como tudo entra no `tracked`, o `uninstall` remove limpo. `ksdd status` reflete a contagem maior por target.

---

## 8. Impacto no Design (interop)

### 8.1 Contrato de interoperabilidade

- O `DESIGN.md` gerado pelo `/ksdd:design` **já** é Google Stitch (ADR-008). O impeccable lê e escreve **exatamente** o mesmo formato. A garantia objetiva de compat é: **passar `@google/design.md lint .ksdd/specs/DESIGN.md`**.
- A nota "## Interop com impeccable" em `references/design-md-spec.md` documenta esse contrato e aponta para o doc de integração + path bridge.

### 8.2 Mapeamento SPEC → PRODUCT.md

O doc de integração define como derivar `PRODUCT.md` (formato do impeccable) a partir dos artefatos KSDD:

| Campo PRODUCT.md | Origem no KSDD |
|------------------|----------------|
| Users | Personas (SPEC seção 2) |
| Mode (`brand` \| `product`) | Modelo de Negócio + natureza do produto (SPEC seções 1, 12) |
| Brand voice | Identidade Visual / Personalidade da Marca (SPEC seção 3) |
| Anti-references | Diferenciais / o que evitar (brainstorm + SPEC) |

A geração respeita `references/language-policy.md` (idioma da conversa, não fixo em pt-BR).

### 8.3 Slop detector como gate (texto/receita)

- Gate opcional de UI no build: `npx impeccable detect <ui-paths>`. Opt-in — se o impeccable não está instalado, o gate é pulado; nunca bloqueia o build de quem não o tem.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | `copyDir(references, …)` já distribui `references/integrations/` recursivamente aos 5 targets | resolvida (comportamento existente) | alto (é o mecanismo de distribuição) |
| Técnica | Compat de formato Google Stitch entre `/ksdd:design` e impeccable | resolvida (ADR-008 + impeccable lê/escreve Stitch) | alto |
| Externa | impeccable aceitar flag de path (ex. `--path .ksdd/specs`) como alternativa ao symlink | **pendente — verificar na doc do impeccable na implementação** | baixo (symlink/`cp` é o default confiável) |
| Externa | usuário instala o impeccable por conta (Node 22.12+) | fora do escopo do KSDD (opt-in) | nenhum (fluxo condicional) |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Path bridge confunde o usuário (KSDD grava em `.ksdd/specs/`, impeccable espera raiz) | Médio | Média | documentar symlink/`cp` explicitamente + verificar flag `--path`; a convenção KSDD permanece fonte da verdade |
| Orientação parecer obrigatória e quebrar o fluxo de quem não tem impeccable | Alto | Baixa | frasar **tudo** como condicional ("se você usa o impeccable…"); gate opt-in que pula silenciosamente |
| Fronteira de licença (AGPL-3.0 × Apache-2.0) por vendorizar conteúdo do impeccable | Médio | Baixa | **não** vendorizar — só linkar/referenciar; nenhum conteúdo deles copiado para o repo |
| Evolução do formato Google Stitch quebrar a compat | Alto | Baixa-Média | o contrato é `@google/design.md lint`; versionar `design-md-spec.md` por release (risco já mapeado em `architecture.md` seção 11) |
| Tentação de adicionar detecção/runtime no CLI (violar ADR-001/003) | Médio | Baixa | ADR-014 registra explicitamente "conteúdo-only, sem framework de plugins"; nenhuma mudança em `bin/ksdd.js` |
| `PRODUCT.md`/`DESIGN.md` na raiz colidirem com arquivos do projeto do usuário | Baixo | Baixa | symlink aponta para `.ksdd/specs/`; documentar que a fonte da verdade é `.ksdd/specs/` |

---

## 10. Critérios de Aceite

- [ ] `references/integrations/README.md` existe e define a convenção (conteúdo obrigatório de um doc de integração, princípio handoff/opt-in, distribuição via `copyDir`, como adicionar a próxima).
- [ ] `references/integrations/impeccable.md` existe e cobre: o que é o impeccable + commands por fase (design vs build), garantia de compat (`@google/design.md lint`), path bridge (symlink/`cp` + nota sobre flag `--path` a verificar), mapeamento SPEC→PRODUCT.md, e a receita do slop detector como gate.
- [ ] `commands/design.md` tem o bloco "Integração impeccable (opcional)" no Step 7 e o passo opcional 5.5 (`PRODUCT.md`), ambos frasados como opt-in e referenciando o doc de integração.
- [ ] `commands/build:feature.md` tem, na §4.5, a orientação condicional `/impeccable shape|critique|audit|polish`, e, na §4.8/§6, o gate opcional `npx impeccable detect <ui-paths>` (não bloqueante).
- [ ] `references/design-md-spec.md` tem a nota "## Interop com impeccable" com o pointer + path bridge.
- [ ] ADR-014 registrado em `architecture.md` (convenção de integrações; por que conteúdo-only; por que não incorre na dívida ADR-010/011/012) e nota breve em `CLAUDE.md`.
- [ ] `README.md` tem a seção "## Integrações" com o impeccable como a primeira; `CHANGELOG.md` tem a entrada `[0.12.0]`; `package.json` está em `0.12.0`.
- [ ] `node -c bin/ksdd.js` passa e **não há diff em `bin/ksdd.js`** (zero CLI change).
- [ ] Distribuição verificada por target com HOME override: `references/integrations/impeccable.md` presente no bundle de Claude, Codex, opencode, Antigravity e Copilot após install; `uninstall` remove sem resíduo e preserva arquivos não-ksdd.
- [ ] Um `DESIGN.md` de exemplo gerado passa `npx @google/design.md lint` (contrato de interop).
- [ ] Dry-run do `/ksdd:design` mostra o bloco impeccable + passo `PRODUCT.md` opcional; dry-run do `/ksdd:build:feature` mostra §4.5 + gate opcional.
- [ ] Toda a orientação é condicional/opt-in — o fluxo KSDD roda ponta a ponta sem impeccable instalado, sem bloqueio.

---

## 11. Fases de Implementação

### Fase 1 — Semente da convenção + doc canônico
- [ ] `references/integrations/README.md` (convenção)
- [ ] `references/integrations/impeccable.md` (1ª integração: fases, compat, path bridge, SPEC→PRODUCT.md, slop gate)

### Fase 2 — Superfícies do fluxo (design + build)
- [ ] `commands/design.md` — Step 7 (bloco impeccable) + passo 5.5 (`PRODUCT.md`)
- [ ] `commands/build:feature.md` — §4.5 (craft) + §4.8/§6 (gate opcional)
- [ ] `references/design-md-spec.md` — nota de interop

### Fase 3 — Registro arquitetural + release
- [ ] ADR-014 em `architecture.md` + nota em `CLAUDE.md`
- [ ] `README.md` "## Integrações" + `CHANGELOG.md` + bump `package.json` 0.12.0
- [ ] *(opcional, P2)* nota em `agents/critic.md`

### Fase 4 — Verificação end-to-end
- [ ] `node -c bin/ksdd.js` intacto + distribuição por target (HOME override) + `uninstall` limpo
- [ ] compat: `npx @google/design.md lint` num `DESIGN.md` de exemplo
- [ ] dry-run dos handoffs (`/ksdd:design`, `/ksdd:build:feature`)

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 1 (visão/Stitch), 2 (personas), 3 (identidade visual → brand voice), 12 (modelo de negócio → mode), 14 (Fase 6 roadmap)
- `.ksdd/specs/architecture.md` — seções 1 (conteúdo distribuído), 10 (ADR-003, ADR-008, ADR-013 como precedente conteúdo-only), 11 (riscos: Stitch, dependências)
- `references/design-md-spec.md` — contrato do `DESIGN.md` Google Stitch (ponto da nota de interop)
- `references/language-policy.md` — idioma da geração do `PRODUCT.md`
- `impeccable` (`pbakaus/impeccable`, Apache-2.0) — ferramenta externa; **não** dependência de código
