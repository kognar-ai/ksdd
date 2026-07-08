---
description: Implementa tasks de fix ponta-a-ponta na linha do /ksdd:build:feature — repro-first, teste de regressão como gate obrigatório, issue+PR rotulados como bug. Lê .ksdd/fixes/FIX-[slug].md + tasks de .ksdd/tasks/fix-[slug]/ (com fallback legado).
argument-hint: "<slug|task-id|--all> (ex: checkout-cupom-expirado, 046, --all)"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, execute_shell, list_directory, mcp__github__*, mcp__context7__*, mcp__pencil__*, mcp__executeautomation-playwright-server__*
---

# /ksdd:build:fix — Implementar fix task por task (repro-first)

Você vai implementar tasks de um **fix** definidas em `.ksdd/tasks/fix-[slug]/` (com fallback para `docs/tasks/fix-[slug]/` legado), a partir de `.ksdd/fixes/FIX-[slug].md`.

**Este command executa o MESMO pipeline do `/ksdd:build:feature`** — pre-flight → detecção de slug arquivado → resolução de task → issue → branch → context.md → execução via teammates → quality gates → validação → status → PR. **Não vou repetir os ~400 passos aqui.** Leia `commands/build:feature.md` como pipeline-base; abaixo estão **apenas os deltas de fix**.

**Os três deltas que fazem disto um `build:fix` e não um `build:feature`:**

1. **Repro-first** — antes de tocar em código, reproduzo o bug para confirmar o diagnóstico do `FIX-[slug].md`. Não reproduziu? Paro: o FIX doc pode estar errado. Nunca corrijo às cegas.
2. **Teste de regressão = quality gate OBRIGATÓRIO** — um teste que **falha na base atual** e **passa após o ajuste**. Sem ele, o PR fica **bloqueado** (em features o teste é encorajado; num fix é a alma da correção).
3. **Labels bug** — issue e PR usam `bug`/`fix` (não `feature`); o corpo do PR referencia `FIX-[slug].md`, o root cause e a evidência falha-antes/passa-depois.

**Princípios (herdados do `build:feature`):**

- Atomic, rastreável, revertível. Cada passo é um commit ou comentário no issue.
- Nada de atalho: quality gates verdes antes do PR — e no fix o gate de regressão é inegociável.
- Falhou em qualquer gate? Reporta no issue, deixa a branch limpa, pede direcionamento.
- **NÃO faz merge.** Abre o PR e aguarda review humano.

## Idioma (obrigatório)

Siga `references/language-policy.md` — `context.md`, comentários em issues/PR, commits e comunicação com o usuário no idioma da conversa e dos artefatos KSDD; código e identificadores seguem convenções do repo.

---

## Mapa: o que reusar do `build:feature` e o que muda

| Seção do `build:feature` | No `build:fix` |
|---|---|
| 0. Pré-flight (falha rápida) | **Igual.** Git limpo, branch/default, `gh` (ou MCP GitHub) disponível?, Docker se aplicável. |
| 0.5 Detecção de slug arquivado | **Igual** (bloqueio 3-way) — só troca `.ksdd/features/` por `.ksdd/fixes/`. Ver seção A. |
| 1. Resolver e validar a task | **Igual** — mesmo parser de frontmatter, com `fix:` no lugar de `feature:` e `fix_refs` no lugar de `feature_refs`. Ver seção B. |
| — | **NOVO — Repro-first.** Logo após a seção B, antes de issue/branch/context.md. Ver Delta 1. |
| 2. Criar issue | **Delta:** labels `bug`/`fix`. Ver Delta 3. |
| 3. Criar branch | **Igual** — nome `fix/[slug]/NNN-[task-slug]`. |
| 4. Gerar context.md | **Delta:** compila `FIX-[slug].md` (root cause, blast radius, critérios de verificação) no lugar do FEATURE spec. Ver seção C. |
| 5. Executar via teammates | **Igual** — mesmo roteamento por área. Escreve o teste de regressão junto do ajuste. |
| 6. Quality gates | **Delta:** teste de regressão é **gate obrigatório** (falha-antes/passa-depois). Ver Delta 2. |
| 7. Validar critérios | **Igual** — valida os "Critérios de verificação" do `FIX-[slug].md`. |
| 8. Atualizar status | **Igual** — `status: em revisão` na fix task + README de `.ksdd/tasks/fix-[slug]/`. |
| 9. Abrir PR | **Delta:** labels `bug`/`fix`; corpo com root cause + evidência de regressão; `Closes #N`. Ver Delta 3. |
| 10. Checkpoint final | **Igual** (adaptado — cita repro + teste de regressão). |
| `--all`, Falhas, Read-only, Iteração | **Iguais**, com as notas de fix no fim deste arquivo. |

---

## Paths dos artefatos de fix

Mesma hierarquia do `build:feature`, na árvore de fix:

| Artefato | Ordem de busca |
|---|---|
| task `NNN-*.md` | `.ksdd/tasks/fix-[slug]/` → `docs/tasks/fix-[slug]/` (legado) |
| FIX-[slug].md | `.ksdd/fixes/FIX-[slug].md` → `docs/FIX-[slug].md` → raiz `FIX-[slug].md` (legados) |
| SPEC.md / architecture.md / DESIGN.md | idêntico ao `build:feature` (`.ksdd/specs/` → raiz) |
| fixes arquivados | `.ksdd/archive/raw/[slug]/` (read-only — detecção de archive bloqueia o build) |

**Regra-chave (idêntica ao `build:feature`):** o path onde a **task** vive dita onde fica seu `.context/NNN-context.md` e qual `README.md` é atualizado. Task em `.ksdd/tasks/fix-[slug]/` → context e README no mesmo diretório. Path legado → context e README legados, sem migração automática. Ao achar artefato legado, emita o warning amarelo padronizado dos demais commands KSDD v0.6.0+ e sugira `git mv`.

---

## Argumentos

`$ARGUMENTS` — **resolução idêntica ao `build:feature`**, aplicada à árvore de fix:

- **Slug do fix:** `checkout-cupom-expirado` → próxima task `para implementar` do fix (respeita `depends_on`).
- **ID de task:** `046` → `.ksdd/tasks/fix-*/046-*.md` (fallback `docs/tasks/fix-*/046-*.md`).
- **Slug parcial / caminho completo:** `046-corrige-expiracao`, `corrige-expiracao`, ou o path direto.
- **`--all`:** todas as tasks `para implementar` do fix em ordem de dependência, com checkpoint entre cada.

Ambíguo (mais de um match — incl. mesmo ID em paths novo e legado)? **Pare e peça desambiguação** — não adivinhe. Se o slug resolve para uma **feature** (`.ksdd/tasks/feature-[slug]/`) e não um fix, **redirecione** ao `/ksdd:build:feature` — fix tasks têm fluxo próprio (repro-first, gate de regressão).

---

## A. Detecção de slug arquivado (pre-flight, antes da seção B)

Mesmo bloqueio 3-way do `build:feature` seção 0.5, na árvore de fix:

1. Parse o argumento para o slug do fix (direto, ou derivado do ID/path).
2. Verifique se `.ksdd/archive/raw/[slug]/` existe.
3. Se existir, **pare** sem mexer em nada e ofereça 3 opções via `ask_user_input_v0`:
   - **(a)** Abrir a seção do slug em `.ksdd/archive/ARCHIVE.md` com `view` e encerrar.
   - **(b)** Instruir `/ksdd:archive --restore [slug]` e encerrar (a reabertura é decisão consciente do usuário).
   - **(c)** Abortar sem fazer nada.
4. **Nunca** restaure automaticamente. Em projetos sem `.ksdd/archive/`, pule esta checagem silenciosamente.

---

## B. Resolver e validar a fix task

Idêntico ao `build:feature` seção 1, com o frontmatter de fix:

1. **Resolva** o argumento para o path da task.
2. **Parse** o frontmatter — **mesmo parser**, mesmos campos (`id`, `title`, `status`, `area`, `priority`, `estimate`, `depends_on`), com **`fix: [slug]`** no lugar de `feature:` e **`fix_refs`** no lugar de `feature_refs` (`spec_refs`/`arch_refs` inalterados).
3. **Bloqueios idênticos:** `status` ≠ `para implementar` → pare e pergunte se quer reabrir/forçar; cada ID em `depends_on` precisa estar `concluída` (senão liste os pendentes e pare).
4. **Leia** os artefatos referenciados aplicando a hierarquia de paths: **`FIX-[slug].md`** (seções em `fix_refs`), SPEC (`spec_refs`), architecture (`arch_refs`), DESIGN se a task for `frontend`/`design`.

---

## Delta 1 — Repro-first (antes de corrigir)

**Este passo roda logo após resolver/validar a task (seção B) e ANTES de criar issue, branch e context.md.** É o que impede corrigir sobre um diagnóstico errado — e captura a evidência "falha-antes" na base intacta.

1. Leia as seções **Reprodução** e **Root cause** do `FIX-[slug].md`.
2. Execute a reprodução na base atual (ainda sem o ajuste):
   - Se o `FIX-[slug].md` aponta um teste que reproduz → rode-o e confirme que **falha** com o sintoma descrito.
   - Se são passos de fluxo (sem teste automatizado ainda) → execute o fluxo (`Bash`/Playwright MCP) e confirme o sintoma.
3. **Confirmou o bug** (reproduziu o sintoma exato / o teste falha pela razão certa): o diagnóstico está de pé. Guarde a evidência de repro (saída do teste, stack trace, screenshot) — ela ancora a metade "falha-antes" do gate de regressão (Delta 2). Prossiga para issue → branch → context.md → implementação.
4. **NÃO reproduziu** (o fluxo funciona, ou o teste falha por outra razão): **PARE.** Não corrija.
   - Sinalize em vermelho que o `FIX-[slug].md` pode estar errado (root cause desatualizado, bug já corrigido, ambiente diferente, repro insuficiente).
   - Comente no issue (se houver) e peça direcionamento: revisar o FIX doc via `/ksdd:new:fix [slug]`, ou fornecer uma repro determinística melhor.
   - Deixe a árvore limpa. **Corrigir às cegas é o anti-pattern central desta feature.**

> `✗ Não reproduzi [slug] na base atual. O FIX-[slug].md pode estar com o root cause errado — não corrijo sobre diagnóstico não confirmado. Revise via /ksdd:new:fix [slug] ou me dê uma repro determinística.`

---

## C. context.md do fix (delta na seção 4)

Mesmo `<tasks-dir>/.context/NNN-context.md` do `build:feature`, mesmos blocos — só muda a **fonte de produto**: no lugar do bloco "Feature spec relevante", compile do **`FIX-[slug].md`** (cole textualmente, não parafraseie):

- **Bug e reprodução** — o que acontece × o que deveria; passos determinísticos (base do repro-first).
- **Root cause** — hipótese confirmada + evidência `arquivo:linha`.
- **Componentes afetados / blast radius** — o que o ajuste toca; onde vigiar regressão colateral.
- **Ajuste proposto** — o patch aprovado no `FIX-[slug].md`.
- **Critérios de verificação** e **Estratégia de teste de regressão** — viram, respectivamente, os critérios validados na seção 7 e o gate do Delta 2.

Some a isso os trechos de SPEC (`spec_refs`) e architecture (`arch_refs`) referenciados. Os blocos "Plano de implementação" e "Quality gates" são iguais aos do `build:feature` — mas no checklist de gates, **marque o teste de regressão como item obrigatório**, não opcional.

Commit do context.md como primeiro commit da branch: `chore(task-NNN): adiciona context.md do fix`.

---

## Delta 2 — Teste de regressão (quality gate OBRIGATÓRIO)

Roda dentro da seção 6 (quality gates), somado a build/testes/lint/type-check/code-review (e `security-auditor` se toca auth/PII/billing). A diferença: **em feature o teste é encorajado; num fix ele é a condição de existência do PR.**

**O gate exige demonstrar as duas metades:**

1. **Falha-antes** — na base **sem** o ajuste, o teste de regressão **falha** (reproduz o bug). Você já tem o sinal do Delta 1; para o teste formal escrito durante a implementação, rode-o contra a base (ex.: `git stash` do ajuste, ou o teste commitado antes do ajuste) e prove que falha.
2. **Passa-depois** — **com** o ajuste aplicado, o mesmo teste **passa**, e a suíte existente continua verde (sem regressão colateral no blast radius mapeado).

Sem as duas metades demonstradas, **NÃO abra o PR.** Reporte em vermelho:

> `✗ Sem teste de regressão que falha-antes/passa-depois. Não abro PR de fix sem essa garantia.`

### Exceção (não silencie o gate)

Se um teste automatizado é **genuinamente inviável** (ex.: bug de concorrência/race, dependência externa não-determinística, timing de infra):

1. **Não pule o gate em silêncio.** Documente no `context.md` e no corpo do PR **por que** a automação é inviável.
2. Substitua por **evidência manual reproduzível**: um roteiro passo-a-passo que qualquer revisor rode para ver o bug antes e a correção depois (logs, capturas, comandos).
3. Exija **aprovação consciente do usuário** via `ask_user_input_v0` antes de prosseguir — o humano assume o trade-off explicitamente.
4. Registre a exceção como nota destacada no PR (`Regressão: evidência manual — automação inviável porque …`).

A exceção é para o teste **automatizado**, nunca para a **garantia de não-retorno**. Um fix sem prova de que corrige e não volta não passa.

---

## Delta 3 — Labels bug: issue e PR

Onde o `build:feature` usa labels de feature, o `build:fix` usa labels de bug. Vale para `gh` **ou** MCP GitHub equivalente; sem nenhum dos dois, degrade para local-only (registre no commit message).

**Issue (seção 2):**

- **Título:** `[Fix NNN] <título da task>`
- **Body:** metadata `Fix: [slug] · Área: <area> · Prioridade: PX · Severidade: <sev>`; seções "## Bug" e "## Root cause" do `FIX-[slug].md`; "## Critérios de verificação" como checklist `- [ ]`; "## Referências" (task, `FIX-[slug].md`, SPEC, architecture); rodapé `Gerada por /ksdd:build:fix em <ISO date>.`
- **Labels:** `bug`, `fix`, `fix-<slug>`, `area-<area>`, `priority-<pri>` (crie as inexistentes). **Assignee:** `@me`.
- Se o fix nasceu de uma **issue de bug já aberta**, **reuse essa issue** (capture o `#N` para o `Closes`) em vez de abrir outra.

**PR (seção 9):** base = default branch, **não** faz merge.

```markdown
## Resumo
<2-4 bullets do ajuste>

## Root cause
<hipótese confirmada + evidência arquivo:linha do FIX-[slug].md>

## Regressão (falha-antes / passa-depois)
- Teste: `<caminho::nome>`
- Falha-antes: <saída/commit provando que falhava na base>
- Passa-depois: <saída provando que passa com o ajuste>
<ou, na exceção: evidência manual reproduzível + justificativa da inviabilidade>

## Fix doc
.ksdd/fixes/FIX-[slug].md (ou path legado)

## Issue
Closes #<N>   <!-- quando o fix veio de uma issue -->

## Quality gates
- [x] Repro confirmada (repro-first)
- [x] Teste de regressão: falha-antes/passa-depois
- [x] Build · testes · lint · type-check
- [x] Code review (security audit se auth/PII/billing)
```

**Labels:** `bug`, `fix`, `fix-<slug>`, `area-<area>`, `ready-for-review`.

Sem `gh` e sem MCP GitHub: apresente esse mesmo corpo (com root cause + evidência de regressão) ao usuário para criar o PR manualmente.

---

## Checkpoint final (seção 10, adaptado)

> Fix **NNN — [título]** implementado.
> - Branch: `[nome]` · Commits: [N] · PR: [URL ou "local-only"]
> - Repro confirmada: sim · Teste de regressão: falha-antes/passa-depois demonstrado
> - Critérios de verificação: [N/N] · Quality gates: todos verdes
>
> **Próxima task sugerida:** NNN — [título]. Quer implementar a próxima? Ou revisar algo neste?

Mensagem canônica de sucesso: `✓ Fix [slug] implementado. Teste de regressão: falha-antes/passa-depois demonstrado. PR aberto (label: bug).`

---

## `--all`, falhas, read-only, retomada

Iguais ao `build:feature` (seções `--all`, "Falhas e abortos", "Artefatos são read-only", "Iteração / Retomada"). Notas específicas de fix:

- **`--all`:** implementa todas as fix tasks `para implementar` em ordem de dependência, com checkpoint antes de cada e **repro-first + gate de regressão por task**. Resumo agregado no fim.
- **Repro não confirma (Delta 1):** trate como abort de gate — deixe a base inspecionável, sinalize o FIX doc suspeito, **não** corrija.
- **Read-only:** além de `SPEC.md`/`architecture.md`/`DESIGN.md`, o **`FIX-[slug].md` é read-only durante o build** (em todos os paths suportados). Achou o FIX doc errado? Sinalize — não edite. Única exceção: `status` da task e o `README.md` de `.ksdd/tasks/fix-[slug]/`.
- **Retomada:** build interrompido? Leia o context.md, `git log --oneline` da branch, pergunte se continua de onde parou e retome do próximo gate incompleto (o repro-first já feito não precisa repetir se a base não mudou).

---

## Anti-patterns

- ❌ Corrigir sem reproduzir. → Sem repro-first, você conserta um bug que talvez nem exista — ou o errado. Delta 1 é inegociável.
- ❌ Abrir PR sem teste de regressão. → O fix precisa provar que corrige **e** que não volta. Falha-antes/passa-depois, ou não há PR.
- ❌ Silenciar o gate de regressão. → Teste automatizado inviável tem exceção documentada (evidência manual + aprovação consciente), nunca um "pulei".
- ❌ Fazer merge sozinho. → PR de fix aguarda review humano, como qualquer PR do KSDD.
- ❌ Editar o `FIX-[slug].md` durante o build. → É read-only. FIX doc errado → sinalize / `/ksdd:new:fix [slug]`.
- ❌ Marcar a fix task como `concluída` antes do merge. → Fica `em revisão` até o merge confirmado.
- ❌ Rotular a issue/PR de fix como `feature`. → Labels `bug`/`fix`; o namespace separado é o que evita a confusão "bug ou feature?".
- ❌ Tentar implementar slug de fix arquivado sem confirmação. → Use `/ksdd:archive --restore [slug]` explicitamente.

Os anti-patterns gerais do `build:feature` (codar sem ler context.md, sair do escopo da task, reescrever arquivos inteiros, ignorar padrões do codebase, commits monolíticos) valem aqui também.
