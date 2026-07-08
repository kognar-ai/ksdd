# Feature: Health check de update ao rodar um command (uma vez por sessão)

> Na primeira invocação de qualquer slash command KSDD numa conversa, o agente compara a versão instalada com a última publicada no npm e avisa (sem bloquear) se houver update — mantendo a CLI 100% offline.

**Slug:** update-health-check
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 08/07/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

O KSDD é distribuído por npm e atualizado com frequência (5 targets em ~2 meses: opencode v0.8.0 → Antigravity v0.9.0 → Copilot v0.10.0 → commands de fix v0.11.0). Mas o produto é **conteúdo distribuído, não runtime** (architecture seção 1, ADR-003): depois de instalado, ele nunca fala com a rede. A consequência prática é que **o usuário não tem nenhum sinal de que está numa versão velha** — ele descobre um target novo ou um command novo (`new:fix`, `build:fix`) só se acompanhar o GitHub/npm por fora.

O fluxo 13.5 do SPEC ("Atualização da própria instalação") assume que o usuário sabe rodar `npm install -g @kognar/ksdd@latest` — mas nada o lembra de fazê-lo. Quem instalou na v0.8.0 e usa `/ksdd:start` todo dia continua sem `new:fix`, sem Copilot, sem os ajustes de path, e sem saber que existem.

A oportunidade: os slash commands **já são executados por um agente** (Claude Code, Codex, opencode, Antigravity, Copilot) que tem acesso a shell e/ou fetch. Um health check leve, disparado uma vez por sessão de chat na primeira vez que o usuário roda um command, fecha esse gap de descoberta **sem** violar o princípio "a CLI não faz chamada de rede" — quem faz a checagem é o agente, não o `bin/ksdd.js`.

### 1.2 Personas Impactadas

- **Marina — Product Designer / PM solo (SPEC 2.1):** usa sessões longas no começo e consultas curtas depois. É a mais exposta a ficar numa versão velha por meses. O aviso discreto na primeira invocação a mantém atualizada sem esforço.
- **Rafa — Founder técnico solo (SPEC 2.2):** rodadas rápidas e esporádicas ("quando vai começar uma feature"). Entre uma sessão e outra passam semanas; o health check garante que ele pegue fixes e novos commands sem ter que lembrar de atualizar.
- **Lia — Líder técnica em agência (SPEC 2.3):** padroniza o fluxo entre clientes e quer consistência de versão nas máquinas do time. O aviso reduz o risco de dois devs rodarem versões diferentes do KSDD no mesmo projeto.

Todas as três instalam e invocam os commands (SPEC seção 6, perfil "Usuário do CLI") — o impacto é universal.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Overhead da checagem na 1ª invocação (percebido pelo usuário) | < 2s, não-bloqueante (o command segue mesmo se a checagem demorar/falhar) | v0.12.0 |
| Falsos positivos (aviso quando já está atualizado) | 0 | v0.12.0 |
| Ruído: nº de avisos por sessão de chat | ≤ 1 (nunca repete na 2ª invocação da mesma conversa) | v0.12.0 |
| Regressão em ambiente offline | 0 — command funciona idêntico ao de hoje sem rede | v0.12.0 |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **`references/update-check.md`** — procedimento canônico único que descreve a checagem (fonte da versão instalada, fonte da versão remota, comparação semver, mensagem, condições de skip). Distribuído a todos os 5 targets pelo bundle de `references/` existente.
- **Pré-flight nos 11 commands** — cada `commands/*.md` ganha um bloco curto no topo: "antes de executar, se ainda não checou nesta conversa, siga `references/update-check.md`". Como a "primeira vez" depende de qual command o usuário abre primeiro, **todos** precisam disparar.
- **Fonte da versão instalada:** campo `version` do `~/.claude/skills/ksdd/.ksdd-manifest.json` (sempre presente — `installClaude` roda em toda instalação; `bin/ksdd.js:472-484`). Fallback: `npm ls -g @kognar/ksdd`.
- **Fonte da versão remota:** o agente roda `npm view @kognar/ksdd version` (mecanismo primário, universal a qualquer agente com shell) e/ou `web_fetch` em `https://registry.npmjs.org/@kognar/ksdd/latest` (fallback).
- **Escopo temporal:** **uma vez por sessão de chat**, sem persistência. O agente checa na 1ª invocação KSDD da conversa e não repete — decisão determinada olhando o próprio histórico da conversa (sem gravar estado no manifest).
- **Comportamento na saída:** avisa **apenas** se a versão remota for maior que a instalada; sugere `npm install -g @kognar/ksdd@latest`; **não** auto-atualiza (respeita approval gates). Silêncio quando já está atualizado.
- **Não-bloqueante e à prova de offline:** qualquer erro (sem rede, npm ausente, timeout, manifest ilegível) → pula em silêncio e o command segue seu fluxo normal.
- **Opt-out:** `KSDD_SKIP_UPDATE_CHECK=1` desliga a checagem (documentado junto às demais env vars).

### 2.2 O que fica pra depois

- **Throttle persistido (1x/dia, `lastUpdateCheckAt` no manifest)** — mais robusto entre sessões, mas exige gravar no manifest a partir de um command. Adiado; v1 é sessão-only por decisão de escopo.
- **Checagem na CLI (`ksdd status` / `ksdd install` mostrando update disponível)** — introduziria a 1ª chamada de rede no `bin/ksdd.js`, contra ADR-001/003. Fora da v1 por decisão explícita (ver seção 9).
- **Auto-update opcional** (`ksdd upgrade`) — fora de escopo; o KSDD nunca executa mutação sem aprovação.
- **Changelog inline** ("o que mudou entre sua versão e a última") — desejável, mas depende de parsear releases; adiado.
- **Aviso de breaking change / migração de layout** entre versões — adiado.

### 2.3 O que NÃO é essa feature

- Não é telemetria. Nada é enviado para servidores KSDD/Kognar; a única rede tocada é o registry público do npm, a partir da máquina do usuário, para **ler** a versão publicada.
- Não muda `bin/ksdd.js` para fazer rede (a CLI permanece offline; quem checa é o agente).
- Não adiciona campo novo ao `.ksdd-manifest.json` (sessão-only, sem persistência).
- Não adiciona um novo slash command nem uma nova função `install*`.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM solo) | ser avisada, ao começar a usar o KSDD numa conversa, que existe versão nova | não ficar meses numa versão velha sem perceber |
| US-02 | Rafa (founder) | que o aviso não me trave nem me atrapalhe quando estou offline ou com pressa | seguir o fluxo do command sem fricção |
| US-03 | Lia (tech lead) | um comando pronto de atualização no próprio aviso | atualizar as máquinas do time em 1 copy-paste |
| US-04 | qualquer usuário | não ver o mesmo aviso repetido a cada command da sessão | não ser incomodado com ruído |
| US-05 | usuário avançado / CI | desligar a checagem via env var | rodar em ambiente sem rede ou controlado sem efeitos colaterais |

---

## 4. Fluxos de Uso

### 4.1 Fluxo principal — há update disponível

**Pré-condição:** KSDD instalado (manifest presente); rede disponível; `KSDD_SKIP_UPDATE_CHECK` não setado; agente ainda não checou nesta conversa.
**Trigger:** usuário invoca o primeiro command KSDD da conversa (ex.: `/ksdd:start`).

1. O agente lê a versão instalada do `.ksdd-manifest.json` (`version`).
2. Roda `npm view @kognar/ksdd version` (ou `web_fetch` no registry) para obter a última publicada.
3. Compara por semver. Remota > instalada.
4. Emite **uma** linha de aviso discreta com o comando de atualização.
5. **Segue normalmente** com o fluxo do command invocado (ex.: começa o brainstorm do `/ksdd:start`).

**Sucesso:** usuário vê o aviso + o command roda sem interrupção.
**Erro / edge case:** ver 4.3.

### 4.2 Fluxo — já atualizado ou 2ª invocação

**Trigger:** versão instalada == última publicada, **ou** o agente já rodou a checagem antes nesta conversa.

1. Nenhum aviso é emitido (silêncio total).
2. O command roda normalmente.

**Sucesso:** zero ruído; comportamento idêntico ao de hoje.

### 4.3 Fluxo — offline / erro / opt-out

**Trigger:** sem rede, `npm` ausente do PATH, timeout, registry inacessível, manifest ilegível, ou `KSDD_SKIP_UPDATE_CHECK=1`.

1. A checagem falha ou é pulada — **sem** mensagem de erro ao usuário.
2. O command roda normalmente, exatamente como antes desta feature.

**Sucesso:** nenhuma regressão; o health check nunca é caminho crítico.

---

## 5. Impacto em Superfícies Existentes

> KSDD não tem UI (SPEC seção 7). "Telas" aqui = superfícies de interação: os slash commands e a saída CLI.

### 5.1 Superfícies Modificadas

| Superfície (SPEC seção 7) | O que muda | Onde | Por quê |
|---------------------------|------------|------|---------|
| Os 11 slash commands (`commands/*.md`) | +bloco de pré-flight no topo referenciando `references/update-check.md` | frontmatter (`allowed-tools`) + primeira seção do corpo | disparar a checagem 1x/sessão em qualquer command que o usuário abra primeiro |
| Skill/bundle de `references/` (SPEC 7.6, 4.3) | +1 arquivo `update-check.md` distribuído aos 5 targets | `~/.claude/skills/ksdd/references/`, `~/.agents/...`, `~/.config/opencode/ksdd/...`, `~/.gemini/ksdd/...`, `<vscode-user>/ksdd/...` | procedimento canônico único, DRY entre os 11 commands |
| Fluxo 13.5 (SPEC) | passa a ser "puxado" pelo aviso, não só "empurrado" pelo usuário | doc | fechar o gap de descoberta de update |

### 5.2 Superfícies Novas

Nenhuma nova. Sem novo command, sem nova função `install*`, sem novo artefato de projeto.

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

Nenhuma.

### 6.2 Alterações em Entidades Existentes

| Entidade (SPEC seção 4) | Alteração | Migração |
|-------------------------|-----------|----------|
| `.ksdd-manifest.json` | **Nenhuma** — a checagem é sessão-only e lê o campo `version` já existente; não grava nada | não |

> Decisão de escopo (seção 2.2): a alternativa "1x/dia persistido" exigiria um campo `lastUpdateCheckAt`. Ficou fora da v1 justamente para não tocar o schema do manifest.

---

## 7. Impacto na Superfície CLI e nos Commands

### 7.1 CLI (`bin/ksdd.js`)

- **Nenhuma mudança de código de rede.** A CLI permanece 100% offline (ADR-001/003 preservados).
- **Env var nova, apenas documentada:** `KSDD_SKIP_UPDATE_CHECK=1` — honrada pelo agente ao seguir `references/update-check.md` (o `bin/ksdd.js` não precisa lê-la; entra em `ksdd help` e na tabela de env vars do SPEC/architecture).
- `references/update-check.md` é distribuído automaticamente pelo `copyDir(references/...)` já presente em todas as 5 funções `install*` (`bin/ksdd.js:168,205,235,283,367`) — **zero linha de instalador nova** (mesmo padrão do `fix-template.md`, ADR-013).

### 7.2 Commands (`commands/*.md`)

- Cada um dos 11 commands ganha, no topo, um bloco padronizado de pré-flight (texto abaixo, seção 8.2).
- `allowed-tools` de cada command precisa permitir a ferramenta usada na checagem (`Bash` para `npm view`, e/ou o tool de fetch do agente). Vários commands já incluem `Bash`; os que não incluem passam a incluir, com escopo restrito à checagem.

---

## 8. Comportamento e Mensagens (equivalente ao "Impacto no Design")

> Sem design gráfico. Tom segue SPEC seção 3: direto, técnico, sem floreio, respeita `NO_COLOR`/não-TTY. A "saída" é a mensagem do agente no chat.

### 8.1 Mensagem canônica — update disponível

```
KSDD: versão v{latest} disponível (instalada: v{current}).
Atualize com: npm install -g @kognar/ksdd@latest
```

- Uma linha de aviso + uma de comando. Discreta, sem emoji, sem exclamação.
- Em seguida o agente segue o fluxo do command normalmente (sem exigir confirmação para prosseguir — o aviso é informativo, não é um gate).

### 8.2 Bloco de pré-flight nos commands (texto de referência)

> **Pré-flight (uma vez por sessão):** se você ainda não executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` antes de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou npm ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.

### 8.3 Silêncio

- Já atualizado, versão remota igual/menor, erro, offline, opt-out, ou 2ª invocação → **nenhuma** saída relativa à checagem.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | Agente com acesso a `Bash`/`npm` ou a `web_fetch` | resolvida (todos os 5 targets têm shell) | baixo — sem acesso, a checagem pula em silêncio |
| Técnica | `.ksdd-manifest.json` com campo `version` | resolvida (`bin/ksdd.js:472`) | baixo — sem manifest, pula |
| Externa | Registry npm público acessível | ambiente do usuário | baixo — offline = pula |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Detecção "já checei nesta conversa" é soft (baseada no histórico da conversa; some se o contexto for compactado) | Baixo | Média | Pior caso = uma checagem extra, ainda não-bloqueante. Aceito como trade-off do modelo sessão-only sem persistência |
| Disponibilidade de tool difere por target (web_fetch pode faltar; shell existe em todos) | Médio | Média | `npm view` (shell) como mecanismo primário universal; `web_fetch` só como fallback; skip silencioso se nenhum |
| `npm view` adiciona latência à 1ª invocação | Baixo | Média | Não-bloqueante por design; timeout curto recomendado no procedimento; opt-out disponível |
| Percepção de "telemetria" | Médio | Baixa | Documentar claramente: leitura do registry público, nada enviado; opt-out explícito; alinhado a SPEC seção 12 (sem telemetria) |
| Editar 11 commands introduz inconsistência entre eles | Médio | Média | Bloco idêntico e curto; lógica centralizada em `references/update-check.md` (os commands só referenciam) |
| Ampliar `allowed-tools` amplia permissão do agente | Baixo | Baixa | Escopo do bloco restrito à checagem de versão; muitos commands já permitem `Bash` |

---

## 10. Critérios de Aceite

- [ ] Existe `references/update-check.md` com: fonte da versão instalada (manifest `version`), fonte da remota (`npm view` primário + `web_fetch` fallback), regra de comparação semver, mensagem canônica, e todas as condições de skip.
- [ ] Os 11 commands (`commands/*.md`) contêm o bloco de pré-flight referenciando `references/update-check.md`, e seus `allowed-tools` permitem a checagem.
- [ ] Na 1ª invocação de um command numa conversa, com versão remota > instalada, o agente emite exatamente **uma** linha de aviso + comando de update, e **prossegue** com o command.
- [ ] Numa 2ª invocação de command na mesma conversa, **nenhum** aviso é reemitido.
- [ ] Quando instalada == última, ou remota < instalada, **nenhum** aviso é emitido.
- [ ] Offline / `npm` ausente / timeout / manifest ilegível → checagem pula em silêncio e o command roda idêntico ao comportamento pré-feature (sem erro exposto ao usuário).
- [ ] `KSDD_SKIP_UPDATE_CHECK=1` desliga a checagem por completo.
- [ ] `bin/ksdd.js` não ganha nenhuma chamada de rede; `references/update-check.md` é distribuído aos 5 targets sem nova linha de instalador (validado com HOME override por target).
- [ ] SPEC.md e architecture.md documentam o comportamento + nova ADR; README/INSTALL/CHANGELOG + `package.json` refletem a versão (bump para v0.12.0).
- [ ] Env var `KSDD_SKIP_UPDATE_CHECK` aparece em `ksdd help` e nas tabelas de env var do SPEC/architecture.

---

## 11. Fases de Implementação

### Fase 1 — Núcleo (o essencial)
- [ ] `references/update-check.md` (procedimento canônico).
- [ ] Pré-flight nos 11 commands + `allowed-tools`.

### Fase 2 — Documentação e release
- [ ] SPEC.md + architecture.md (nova ADR, env var, fluxo 13.5, contagem de env vars).
- [ ] README/INSTALL/CHANGELOG + bump `package.json` para v0.12.0.

### Fase 3 — Validação
- [ ] Dogfood + QA smoke test: dispara 1x/sessão, não repete, offline silencioso, opt-out, distribuição aos 5 targets via HOME override.

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 4.1 (manifest `version`), 7.1/7.2 (CLI + commands), 11 (interações/idempotência), 13.5 (fluxo de atualização), 12 (sem telemetria)
- `.ksdd/specs/architecture.md` — seções 1 (conteúdo distribuído), 5 ("KSDD não faz chamada de rede em runtime"), 10 (ADR-001/003; nova ADR-014), 4.2 (env vars)
- `bin/ksdd.js` — 45 (`COMMAND_FILES`), 168/205/235/283/367 (`copyDir` de `references/`), 472-484 (manifest `version`)
- Precedente: `.ksdd/features/FEATURE-new-fix-command.md` (ADR-013 — command/reference de conteúdo, sem função `install*` nova)
