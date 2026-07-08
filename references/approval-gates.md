# Referência: Approval Gates (regras dos checkpoints)

O KSDD é construído sobre **checkpoints obrigatórios**. Não há atalho. Cada comando termina forçando uma decisão humana antes do próximo.

Os mesmos gates aplicam-se quer use **Claude Code** (`/ksdd:…`) quer **OpenAI Codex** (`/prompts:ksdd-…`); só muda o prefixo do comando.

## Por que checkpoints

1. **Documento ruim na fonte = entulho cascateado.** Se `brainstorm.md` está confuso, `SPEC.md` herda a confusão. Se `SPEC.md` está vago, `DESIGN.md` adivinha. Cada fase precisa estar sólida antes da próxima.
2. **Custo de iteração cresce.** Refazer brainstorm = 5 minutos. Refazer DESIGN.md = 30 minutos. Refazer architecture.md depois de implementar = semanas.
3. **Aprovação ativa = compreensão real.** Forçar o humano a dizer "aprovado" garante que ele leu. Aprovação silenciosa é assentimento, não compreensão.

## Regras dos gates

### Gate 1 — Após `/ksdd:start`
**Pré-condição pra `/ksdd:spec`:** `.ksdd/specs/brainstorm.md` existe (fallback raiz `brainstorm.md` legado) + aprovação explícita do usuário na conversa.

**Como o command verifica:** Lê o brainstorm no path encontrado. Se não viu "aprovado", "tá bom", "pode prosseguir", "ok" ou equivalente referente AO brainstorm na conversa recente, pergunta antes de continuar.

**O que NÃO conta como aprovação:**
- "ok" como reação a outra coisa
- "pode prosseguir" dito antes do brainstorm ser gerado
- Silêncio (usuário sumiu)

### Gate 2 — Após `/ksdd:spec`
**Pré-condição pra `/ksdd:tech` ou `/ksdd:design`:** `.ksdd/specs/SPEC.md` (fallback raiz `SPEC.md`) existe + aprovação explícita.

**Caso especial:** Se `/ksdd:design` é chamado sem `/ksdd:tech` ter rodado, ok — `tech` é opcional. Mas SPEC precisa estar aprovado.

### Gate 3 — Após `/ksdd:tech` (se chamado)
**Pré-condição pra `/ksdd:design`:** Se `.ksdd/specs/architecture.md` (fallback raiz) existe, deve estar aprovado também. Senão, ignora.

### Gate 4 — Após `/ksdd:design`
**Fim do fluxo padrão de projeto.** O usuário leva os 4 arquivos pra implementação. A partir daqui, pode usar `/ksdd:new:feature` pra especificar features individuais.

### Gate 5 — Após `/ksdd:new:feature`

O `/ksdd:new:feature` tem **dois checkpoints internos**:

1. **Checkpoint do FEATURE spec:** Após gerar `.ksdd/features/FEATURE-[slug].md` (fallback `docs/FEATURE-[slug].md` legado), antes de quebrar em tasks. O usuário aprova escopo, impacto e critérios de aceite.
2. **Checkpoint das tasks:** Após gerar `.ksdd/tasks/feature-[slug]/` (fallback `docs/tasks/feature-[slug]/` legado), com resumo de tasks por prioridade e estimativa total.

**Pré-condição:** `.ksdd/specs/SPEC.md` (fallback raiz `SPEC.md`) deve existir (obrigatório). `architecture.md` e `DESIGN.md` são opcionais mas enriquecem a análise de impacto e a granularidade das tasks.

### Gate 6 — Durante `/ksdd:build:feature`

O build tem **checkpoints por task**:

1. **Pre-flight:** Git limpo, dependências disponíveis. Falhou? STOP imediato.
2. **Antes de cada task:** Mostra qual task será implementada, confirma com o usuário.
3. **Quality gates por task:** Build, testes, lint, type-check, E2E (se UI), code review, security audit (se auth/PII). Tudo verde antes do PR.
4. **Validação de critérios:** Cada critério de aceitação da task demonstrado com evidência.
5. **PR aberto:** Não faz merge — aguarda review humano.

**Pré-condição:** FEATURE deve existir e estar aprovada — procura em ordem: `.ksdd/features/FEATURE-[slug].md` → `docs/FEATURE-[slug].md` → raiz `FEATURE-[slug].md` (legados). Tasks devem existir em `.ksdd/tasks/feature-[slug]/` ou `docs/tasks/feature-[slug]/` (legado). `SPEC.md` obrigatório (`.ksdd/specs/` ou raiz). Dependencies (`depends_on`) da task devem ter `status: concluída`.

**O build NUNCA modifica artefatos KSDD** (SPEC.md, architecture.md, DESIGN.md, FEATURE-*.md em qualquer dos paths suportados). Se durante a implementação ficar claro que algo está errado ou incompleto, sinalize ao usuário — não corrija automaticamente. A única exceção: status das tasks e o README de tasks podem ser atualizados (no path onde a task vive).

### Gate 7 — Durante `/ksdd:build:all`

O build completo tem **checkpoints em cascata**:

1. **Checkpoint do plano mestre:** Após gerar `.ksdd/build/BUILD-PLAN.md` (fallback raiz `BUILD-PLAN.md` legado) + todas as FEATURE specs + todas as tasks. O usuário aprova a decomposição, ordem de execução e estimativas. Se `--plan-only`, para aqui.
2. **Checkpoint por feature:** Antes de iniciar cada feature, mostra tasks na fila e pede confirmação.
3. **Checkpoints do `/ksdd:build:feature`:** Cada task segue o fluxo completo (pre-flight, issue, branch, context.md, quality gates, PR).
4. **Checkpoint pós-fase:** Após todas as features de uma fase, resumo consolidado. Recomenda testar antes de avançar pra próxima fase.
5. **Checkpoint final:** Validação contra critérios do SPEC, cobertura agregada, pendências.

**Pré-condição:** `.ksdd/specs/SPEC.md` (fallback raiz) deve existir e estar aprovado. `architecture.md` e `DESIGN.md` (em `.ksdd/specs/` ou raiz) são recomendados. Se não existem, o build faz uma rodada de perguntas de stack antes de prosseguir.

**`--resume`:** Detecta estado existente (features/tasks com status misto) e retoma da próxima task incompleta.

### Gate 8 — Após `/ksdd:new:fix`

O `/ksdd:new:fix` tem **dois checkpoints internos**:

1. **Checkpoint do FIX doc:** Após gerar `.ksdd/fixes/FIX-[slug].md`, antes de quebrar em tasks. O usuário aprova o root cause (com evidência `arquivo:linha`), o ajuste proposto e o blast radius do ajuste.
2. **Checkpoint das tasks:** Após gerar `.ksdd/tasks/fix-[slug]/`, apresentando os dois caminhos de implementação — fix inline (bug pequeno, baixo risco) ou `/ksdd:build:fix` (para o resto).

**Pré-condição:** `.ksdd/specs/SPEC.md` (fallback raiz `SPEC.md`) é recomendado; o codebase deve estar acessível para a investigação code-aware. `architecture.md` e `DESIGN.md` são opcionais mas ajudam a localizar os componentes afetados.

**Caso especial — bug não reproduzível:** Se o command não consegue reproduzir o bug nem localizar o root cause com confiança, gera o `FIX-[slug].md` em modo "investigação incompleta" (o que foi tentado, hipóteses candidatas, e o que falta — logs, versão, passos, ambiente) e **para**: não avança para as tasks nem oferece o fix inline até os dados faltantes chegarem. Nunca propõe ajuste sobre diagnóstico chutado.

### Gate 9 — Durante `/ksdd:build:fix`

O build de fix tem **checkpoints por task**, no mesmo molde do `/ksdd:build:feature`, com o gate que é a alma de qualquer correção — o teste de regressão:

1. **Pre-flight:** Git limpo, dependências disponíveis, detecção de slug arquivado. Falhou? STOP imediato.
2. **Repro-first:** Antes de corrigir, reproduz o bug (roda o teste/fluxo que falha) para confirmar o diagnóstico do `FIX-[slug].md`. Repro não confirma o bug? Para e sinaliza que o FIX doc pode estar errado — não corrige às cegas.
3. **Antes de cada task:** Mostra qual task será implementada, confirma com o usuário.
4. **Quality gates por task — teste de regressão obrigatório:** Build, testes, lint, type-check, code review, security audit (se auth/PII) e, acima de tudo, um teste de regressão que **falha na base atual e passa após o ajuste** (falha-antes/passa-depois demonstrado). Sem esse teste, o gate bloqueia — aqui não é opcional como em features.
5. **Validação de critérios:** Cada critério de verificação do `FIX-[slug].md` demonstrado com evidência.
6. **PR aberto:** Label `bug` (não `feature`); o corpo referencia o `FIX-[slug].md`, o root cause e a evidência de regressão. Não faz merge — aguarda review humano.

**Pré-condição:** o FIX deve existir e estar aprovado em `.ksdd/fixes/FIX-[slug].md`. Tasks devem existir em `.ksdd/tasks/fix-[slug]/`. `SPEC.md` recomendado (`.ksdd/specs/` ou raiz). Dependencies (`depends_on`) da task devem ter `status: concluída`.

**O que NÃO conta como aprovação:** PR aberto não encerra o fix — o merge aguarda review humano. Quality gates verdes **sem** o teste de regressão que falha-antes/passa-depois também não liberam o PR: sem essa garantia, o gate bloqueia e o fix não sai.

## Como fazer o checkpoint

Após gerar o arquivo, **sempre** termine com uma versão deste prompt:

```
[Nome].md gerado em [path]. Recomendo revisar especialmente:
- [Seção X] — [por quê]
- [Seção Y] — [por quê]

Aprovado para prosseguir para `/ksdd:[próximo]`?
Ou me diga o que ajustar.

Não vou rodar o próximo comando até você aprovar explicitamente.
```

## Anti-patterns

- ❌ Rodar comandos em sequência sem checkpoint. Mesmo que o usuário pareça com pressa.
- ❌ Assumir aprovação de mensagens ambíguas. "Show", "legal", "interessante" não são aprovação.
- ❌ Pular o gate em projeto pequeno. O hábito importa mais que o tamanho do projeto.
- ❌ Aprovação implícita via "passa pro próximo". Pergunte: "isso é aprovação do [arquivo atual]?"

## Quando o usuário insiste em pular

Se o usuário diz "pula essa parte, roda tudo direto" ou similar:

> Entendo a pressa, mas o KSDD é desenhado pra você revisar cada artefato antes do próximo. Posso rodar `/ksdd:spec` agora se você confirma que leu o `brainstorm.md` e tá ok com o conteúdo. Confirma?

Se confirma, prosseguir. Se não responde, esperar. **Nunca** rodar sem confirmação.

## Quando os arquivos já existem

Se o usuário começa o fluxo com arquivos prévios no diretório:

```
[detectou .ksdd/specs/brainstorm.md, .ksdd/specs/SPEC.md de uma sessão anterior — ou paths legados raiz]

Encontrei artefatos KSDD prévios:
- .ksdd/specs/brainstorm.md (DD/MM)
- .ksdd/specs/SPEC.md (DD/MM)

Você quer:
1. Continuar de onde parou (próximo seria /ksdd:design)
2. Iterar num arquivo específico (qual?)
3. Recomeçar do zero (/ksdd:start)
```

Espere a escolha.
