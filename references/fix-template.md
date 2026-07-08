# Fix: [TITLE]

> [Uma linha: o sintoma observável do bug, quem ele afeta e quão grave é o impacto.]

**Slug:** [SLUG]
**Severidade:** [SEVERITY] — Crítica / Alta / Média / Baixa · impacto no **usuário** (distinto da prioridade da task)
**Status:** [STATUS] — Rascunho (antes do Checkpoint 1) / Aprovado (após)
**Data:** [DATE] · DD/MM/AAAA
**Projeto:** [PROJECT — extrair do SPEC.md]

---

## 1. Bug

**O que acontece:** [comportamento observado — o sintoma concreto, com a mensagem de erro / stack trace se houver]
**O que deveria acontecer:** [comportamento esperado — o contrato quebrado, referenciando SPEC/FEATURE quando aplicável]

[Contexto mínimo: quando começou, quem reportou (usuário / cliente / CI vermelho / produção), frequência (sempre / intermitente).]

---

## 2. Reprodução

**Ambiente:** [versão / branch / SO / dados necessários para o bug aparecer]
**Comando/teste que dispara:** `[comando exato — ex: npm test -- caminho/do/teste, curl, ou a rota/fluxo de UI]`

1. [Passo determinístico 1]
2. [Passo determinístico 2]
3. [Passo determinístico 3 → aqui o bug se manifesta]

**Resultado atual:** [o que se vê — erro, valor errado, travamento]
**Determinístico?** [sempre / intermitente — se não for reproduzível com confiança, ver "[investigação incompleta]" na seção 3]

---

## 3. Root cause

**Hipótese:** [a causa raiz — a doença, não o sintoma. Uma frase afirmativa.]

**Evidência (`arquivo:linha`):**
- `[caminho/arquivo.ext:linha]` — [por que essa linha é a causa; o que ela faz de errado]
- `[caminho/arquivo.ext:linha]` — [evidência de apoio, se houver]

**Cadeia causal:** [do gatilho ao sintoma: entrada X → código Y assume Z → quebra em W]

> **[investigação incompleta]** — Use este estado quando o bug **não** foi reproduzido ou a causa raiz não tem evidência confiável. Não chute um root cause. Documente:
> - **O que foi tentado:** [reproduções, buscas, hipóteses já descartadas]
> - **Hipóteses candidatas:** [as suspeitas, sem eleger uma vencedora]
> - **O que falta:** [logs, versão, passos, ambiente, dados que o usuário precisa fornecer]
>
> Neste estado o fix **para** aqui: sem ajuste proposto sobre diagnóstico incerto (seções 5–7 ficam vazias até reproduzir).

---

## 4. Componentes afetados / blast radius

| Componente / arquivo | Papel no bug | Risco ao tocar |
|----------------------|--------------|----------------|
| `[arquivo ou módulo]` | [é a causa / consome a causa / vizinho] | Alto / Médio / Baixo |

**O que o ajuste toca:** [os pontos que serão alterados]
**O que pode quebrar junto:** [dependentes do código alterado — callers, contratos públicos, migrações, dados persistidos]

---

## 5. Ajuste proposto

[O QUÊ do ajuste — a mudança em linguagem de intenção, **não** o patch completo. Corrija a causa raiz da seção 3, não um paliativo no sintoma. Se houver alternativas, cite a escolhida e por quê.]

**Caminho de implementação:** [inline (bug pequeno: 1 arquivo, sem schema/API/auth) | `/ksdd:build:fix` (não-trivial)] — [justificativa curta da escolha]

---

## 6. Critérios de verificação

- [ ] [Condição binária e observável — ex: "cupom expirado retorna 400 com mensagem clara, não 500"]
- [ ] [O sintoma original não se reproduz mais pelos passos da seção 2]
- [ ] [Nenhum caminho vizinho do blast radius (seção 4) regrediu]

---

## 7. Estratégia de teste de regressão

**Teste:** `[caminho/nome do teste que captura o bug]`
**Falha ANTES do ajuste:** [o que o teste afirma e por que ele falha na base atual — a prova de que ele pega o bug]
**Passa DEPOIS do ajuste:** [o mesmo teste, verde após a correção]

[Se um teste automatizado for inviável (ex: concorrência), descrever a evidência manual reproduzível que substitui o gate — nunca silenciá-lo.]

---

## 8. Riscos do ajuste

| Risco / regressão possível | Impacto | Mitigação |
|----------------------------|---------|-----------|
| [o que o ajuste pode quebrar] | Alto / Médio / Baixo | [como evitar ou detectar] |

---

## 9. Referências

- `.ksdd/specs/SPEC.md` (ou raiz legado) — seções [X, Y] *(contrato quebrado)*
- `.ksdd/specs/architecture.md` (ou raiz legado) — seções [X] *(componente afetado, se existir)*
- `.ksdd/features/FEATURE-[slug].md` — *(feature que introduziu ou contém o bug, se conhecida)*
- Issue: [#123 ou URL] · Teste: `[caminho]` · PR: [#quando existir]

<!--
=======================================================================
EXEMPLO PREENCHIDO (referência humana — NÃO copiar para o FIX doc real)
=======================================================================

# Fix: Checkout retorna 500 ao aplicar cupom expirado

> Usuário que aplica um cupom já vencido trava o checkout com erro 500 em vez de receber uma recusa clara — bloqueia a compra.

**Slug:** checkout-cupom-expirado
**Severidade:** Alta — impacto no usuário (bloqueia a compra; distinto da prioridade da task)
**Status:** Aprovado
**Data:** 08/07/2026
**Projeto:** Loja Exemplo

## 1. Bug
**O que acontece:** aplicar um cupom com `expiresAt` no passado retorna HTTP 500 (`Unexpected token NaN in JSON`).
**O que deveria acontecer:** o cupom vencido é recusado com HTTP 400 e mensagem "Cupom expirado" (SPEC 5.3).
Reportado por usuário; sempre reproduzível.

## 2. Reprodução
**Ambiente:** main @ commit atual, Node 20.
**Comando/teste que dispara:** `npm test -- checkout.spec.ts -t "cupom expirado"`
1. Criar cupom com `expiresAt` = ontem.
2. POST /api/checkout com o código do cupom.
3. A resposta é 500 (esperado: 400).
**Resultado atual:** 500 + stack trace no serializer. **Determinístico?** sempre.

## 3. Root cause
**Hipótese:** `applyCoupon` calcula o desconto sem validar `expiresAt`; a data no passado produz `NaN`, que estoura na serialização.
**Evidência (`arquivo:linha`):**
- `src/checkout/coupon.ts:42` — usa `expiresAt` no cálculo sem checar se já venceu.
- `src/checkout/serialize.ts:18` — `JSON.stringify` de um total `NaN` lança e vira 500.
**Cadeia causal:** cupom vencido → desconto = NaN → total = NaN → serializer lança → 500.

## 4. Componentes afetados / blast radius
| Componente / arquivo | Papel no bug | Risco ao tocar |
|----------------------|--------------|----------------|
| `src/checkout/coupon.ts` | causa raiz | Médio |
| `src/checkout/serialize.ts` | onde estoura | Baixo |
**O que o ajuste toca:** validação em `applyCoupon`. **O que pode quebrar junto:** qualquer fluxo que aplique cupom.

## 5. Ajuste proposto
Validar `expiresAt` no início de `applyCoupon`; se vencido, lançar erro de domínio `CouponExpired` mapeado para HTTP 400 com mensagem localizada. Não tratar sintoma no serializer.
**Caminho de implementação:** inline — 2 arquivos, sem schema/API/auth.

## 6. Critérios de verificação
- [ ] Cupom expirado retorna 400 + "Cupom expirado".
- [ ] Cupom válido continua aplicando o desconto (sem regressão).
- [ ] Nenhuma resposta 500 no fluxo de checkout com cupom.

## 7. Estratégia de teste de regressão
**Teste:** `checkout.spec.ts > "cupom expirado retorna 400"`
**Falha ANTES:** na base atual recebe 500 → o teste (que espera 400) falha.
**Passa DEPOIS:** com a validação, recebe 400 → o teste passa.

## 8. Riscos do ajuste
| Risco / regressão possível | Impacto | Mitigação |
|----------------------------|---------|-----------|
| Mensagem de erro sem tradução em outros locales | Baixo | reusar chave i18n existente e testar pt/en |

## 9. Referências
- `.ksdd/specs/SPEC.md` — seção 5.3 (regras de cupom)
- Issue: #142 · Teste: `checkout.spec.ts` · PR: #143
-->
